"""ACRS v3 integrated evaluation: O1+O2+O3+O4 in one loop, governed by G1.

Usage
-----
    python experiments/integrated_eval.py --dataset toolbench --seeds 3
    python experiments/integrated_eval.py --dataset kcc --kcc /path/to/kcc_csv_dir --limit 20000
    python experiments/integrated_eval.py --dataset kcc --smoke      # synthetic rows, NOT a result
    ACRS_DENSE_MODEL=BAAI/bge-base-en-v1.5 python experiments/integrated_eval.py --retriever hybrid ...

What is measured (all per sub-goal, micro-averaged, then summarised over seeds
as a distribution: median, p10, p90, n)
-----------------------------------------------------------------------------
A. Objective ablation      SOTA baseline -> +O1 -> +O2 -> +O3 -> +O4 -> full ACRS -> full + G1
B. Adversarial sweep       poisoned-endpoint rate 0 / 0.15 / 0.30; attack success rate (ASR)
                           = share of sub-goals where an attacker-steered claim was EXECUTED
C. Certified execution     Learn-then-Test threshold on a calibration half, checked on the
                           held-out half: executed error among executed vs alpha, coverage
D. Calibration             ECE of MNCD's weighted share
E. Reliability             tau-bench pass^k over seeds; per-stage reliability and its product
F. Release                 seven-part manifest, evaluation gate, R-REL-01 promotion decision

Agents are SIMULATED (seeded, schema-faithful). The numbers test orchestration and
governance mechanisms, not LLM quality; the LLM-agent run is a separate stage.
"""

from __future__ import annotations

import argparse
import json
import random
import statistics as st
import subprocess
import sys
import time
from dataclasses import replace
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "laboratory/research/src"))

from paim.governance import (  # noqa: E402
    GovernanceConfig,
    InjectingExecutor,
    PolicyEngine,
    ReleaseManifest,
    distribution_report,
    end_to_end_reliability,
    evaluation_gate,
    expected_calibration_error,
    learn_then_test,
    pass_hat_k,
)
from paim.governance.layer import DEFAULT_POLICY  # noqa: E402
from paim.o3_mncd.execution import SimulatedToolExecutor  # noqa: E402
from paim.pipeline.orchestrator import Ablations, IntegratedPipeline, PipelineConfig  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("--dataset", choices=["toolbench", "kcc"], default="toolbench")
ap.add_argument("--kcc", default="", help="KCC CSV file or directory (KCC Chakshu / AIKosh export)")
ap.add_argument("--limit", type=int, default=20000)
ap.add_argument("--states", default="", help="comma-separated state filter for KCC")
ap.add_argument("--distractors", action="store_true", help="add ToolBench endpoints to the KCC corpus")
ap.add_argument("--smoke", action="store_true", help="KCC synthetic smoke rows (pipeline check only)")
ap.add_argument("--seeds", type=int, default=3)
ap.add_argument("--retriever", default="bm25", choices=["bm25", "dense", "hybrid"])
ap.add_argument("--alphas", default="0.02,0.05,0.10", help="risk levels to certify")
ap.add_argument("--delta", type=float, default=0.05)
ap.add_argument("--attack-rates", default="0,0.15,0.30")
ap.add_argument("--quick", action="store_true", help="skip the objective ablation (section A)")
ap.add_argument("--out", default="")
args = ap.parse_args()

T0 = time.time()
F, T = False, True


# ----------------------------------------------------------------- data
def load():
    if args.dataset == "toolbench":
        from paim.data.toolbench import build_sessions, load_bundle

        b = load_bundle(ROOT / "laboratory/data")
        gold = {frozenset(q["gold_doc_ids"]) for q in b.queries}
        traj = [t for t in b.train_trajectories if frozenset(t) not in gold]
        info = {"name": "ToolBench-Sessions G1", "tools": b.n_tools, "queries": len(b.queries),
                "leakFilteredTrajectories": len(traj)}
        return b.tools, traj, (lambda: build_sessions(b)), info
    from paim.data import kcc

    if args.smoke:
        rows = [{**r, "BlockName": f"{r['BlockName']}-{i}"} for i in range(20) for r in kcc.SYNTHETIC_SMOKE_ROWS]
        print("!! SMOKE RUN on synthetic rows - pipeline check only, never a reported result", flush=True)
    else:
        if not args.kcc:
            sys.exit("--kcc PATH is required (or --smoke). See docs/DATASET_SELECTION.md for the download.")
        states = [s.strip() for s in args.states.split(",") if s.strip()] or None
        rows = kcc.load_kcc(args.kcc, limit=args.limit or None, states=states)
        if not rows:
            sys.exit(f"no usable KCC rows under {args.kcc}")
    tools = {t.doc_id: t for t in kcc.kisan_tools()}
    if args.distractors:
        from paim.data.toolbench import load_bundle

        tools.update(load_bundle(ROOT / "laboratory/data").tools)
    sessions_fn = lambda: kcc.build_kcc_sessions(rows)  # noqa: E731
    info = {"name": "KCC-Sessions" + (" (SMOKE)" if args.smoke else ""), "tools": len(tools),
            **kcc.kcc_report(rows, sessions_fn())}
    return tools, [], sessions_fn, info


TOOLS, TRAJ, SESSIONS, INFO = load()
print("dataset:", json.dumps(INFO)[:1500], flush=True)


def split(sessions, seed):
    idx = list(range(len(sessions)))
    random.Random(seed).shuffle(idx)
    cut = len(idx) // 2
    return [sessions[i] for i in sorted(idx[:cut])], [sessions[i] for i in sorted(idx[cut:])]


def run(abl, seed, attack=0.0, theta=None, sessions=None):
    cfg = PipelineConfig(
        seed=seed, ablations=abl, retriever=args.retriever,
        governance_config=GovernanceConfig(theta=theta),
    )
    ex = None
    if attack > 0:
        ex = InjectingExecutor(
            SimulatedToolExecutor(seed=seed, failure_rate=cfg.tool_failure_rate), rate=attack, seed=seed
        )
    pipe = IntegratedPipeline(TOOLS, TRAJ, cfg, executor=ex)
    recs, metrics = [], []
    for s in sessions if sessions is not None else SESSIONS():
        m = pipe.run(s).metrics
        metrics.append(m)
        for r in pipe.last_records:
            recs.append({**r, "sessionId": s.session_id})
    return pipe, recs, metrics


def summarise(recs, metrics):
    n = len(recs)
    ex = [r for r in recs if r["executed"]]
    g = [m for m in metrics if "ndcg@5" in m]
    return {
        "subGoals": n,
        "ndcg@5": st.mean(m["ndcg@5"] for m in g) if g else float("nan"),
        "executeRate": len(ex) / n,
        "reviewRate": sum(r["disposition"] == "REVIEW" for r in recs) / n,
        "executedErrorRate": sum(r["executedWrong"] for r in recs) / n,
        "executedPrecision": (sum(r["executedCorrect"] for r in ex) / len(ex)) if ex else float("nan"),
        "attackSuccessRate": sum(r["attackSucceeded"] for r in recs) / n,
        "stageFailureRate": sum(r["failed"] for r in recs) / n,
        "costPerSubGoal": sum(r["cost"] for r in recs) / n,
        "latencyP95Ms": sorted(r["latencyMs"] for r in recs)[int(0.95 * (n - 1))],
        "compression": 1 - sum(r["keptTokens"] for r in recs) / max(1, sum(r["originalTokens"] for r in recs)),
        "fidelityFloorMet": st.mean(m["floorSatisfactionRate"] for m in metrics),
    }


def over_seeds(fn):
    per = [fn(20260905 + s) for s in range(args.seeds)]
    keys = per[0].keys()
    return {"perSeed": per, "dist": {k: distribution_report([p[k] for p in per]) for k in keys}}


def fmt(d, keys):
    return "  ".join(f"{k}={d['dist'][k]['median']:.4f}" for k in keys if k in d["dist"])


SHOW = ["ndcg@5", "executeRate", "executedErrorRate", "executedPrecision", "attackSuccessRate",
        "costPerSubGoal", "compression", "fidelityFloorMet", "stageFailureRate"]
R: dict = {"dataset": INFO, "args": vars(args)}

# ----------------------------------------------------------------- A
if not args.quick:
    R["ablation"] = {}
    configs = {
        "SOTA baseline": Ablations(F, F, F, F),
        "+O1 SATR": Ablations(T, F, F, F),
        "+O2 APRR": Ablations(F, T, F, F),
        "+O3 MNCD": Ablations(F, F, T, F),
        "+O4 FCNP": Ablations(F, F, F, T),
        "Full ACRS (O1-O4)": Ablations(T, T, T, T),
        "Full ACRS + G1": Ablations.governed(),
    }
    for name, abl in configs.items():
        t = time.time()
        R["ablation"][name] = over_seeds(lambda sd, abl=abl: summarise(*run(abl, sd)[1:]))
        print(f"[A] {name:22s} {time.time()-t:5.0f}s  {fmt(R['ablation'][name], SHOW)}", flush=True)

# ----------------------------------------------------------------- B
R["attack"] = {}
for rate in [float(x) for x in args.attack_rates.split(",")]:
    for name, abl in {"Full ACRS (O1-O4)": Ablations(), "Full ACRS + G1": Ablations.governed()}.items():
        key = f"{name} @ attack {rate:.2f}"
        t = time.time()
        R["attack"][key] = over_seeds(lambda sd, abl=abl, rate=rate: summarise(*run(abl, sd, rate)[1:]))
        print(f"[B] {key:34s} {time.time()-t:5.0f}s  {fmt(R['attack'][key], SHOW)}", flush=True)

# guard false-positive rate on attack-free traffic
pipe0, recs0, _ = run(Ablations.governed(), 20260905)
gs = pipe0.governance.stats()["guard"]
R["guardFalsePositiveRate"] = gs["quarantined"] / max(1, gs["scanned"])
print(f"[B] guard false-positive rate on clean traffic: {R['guardFalsePositiveRate']:.4f}", flush=True)

# ----------------------------------------------------------------- C + D
R["certified"] = []
ALPHAS = [float(a) for a in args.alphas.split(",")]
# One calibration run and one fixed-theta run per (seed, attack); every alpha
# reuses them, so only the held-out LTT run is repeated per alpha.
for s in range(args.seeds):
    seed = 20260905 + s
    for rate in (0.0, 0.15):
        sessions = SESSIONS()
        cal, test = split(sessions, seed)
        _, cal_recs, _ = run(Ablations.governed(), seed, rate, sessions=cal)
        pool = [r for r in cal_recs if r["certified"] and r["riskClass"] == "informational"
                and r["quarantinedCalls"] == 0]
        scores = [r["weightedShare"] for r in pool]
        wrong = [not r["consensusCorrect"] for r in pool]
        ece = expected_calibration_error(scores, [not w for w in wrong])
        _, test_fix, test_fm = run(Ablations.governed(), seed, rate, theta=0.5, sessions=split(SESSIONS(), seed)[1])
        fixed = summarise(test_fix, test_fm)
        cache = {}
        for alpha in ALPHAS:
            ct = learn_then_test(scores, wrong, alpha=alpha, delta=args.delta)
            theta = ct.threshold if ct.valid else 1.01
            if theta not in cache:
                cache[theta] = run(Ablations.governed(), seed, rate, theta=theta,
                                   sessions=split(SESSIONS(), seed)[1])
            _, test_recs, test_m = cache[theta]
            ex = [r for r in test_recs if r["executed"]]
            risk = (sum(r["executedWrong"] for r in ex) / len(ex)) if ex else 0.0
            row = {
                "seed": seed, "attack": rate, "alpha": alpha, "threshold": ct.to_dict(),
                "calibrationPool": len(pool), "eceWeightedShare": ece,
                "heldOutExecutedRisk": risk, "heldOutExecuted": len(ex),
                "heldOutCoverage": len(ex) / max(1, len(test_recs)),
                "riskWithinAlpha": risk <= alpha,
                "fixedTheta05": fixed, "ltt": summarise(test_recs, test_m),
            }
            R["certified"].append(row)
            fixed_risk = fixed["executedErrorRate"] / max(1e-9, fixed["executeRate"])
            print(f"[C] alpha {alpha:.2f} seed {seed} attack {rate:.2f}: pool={len(pool)} "
                  f"theta*={ct.threshold:.2f} (valid={ct.valid}, UCB={ct.risk_upper:.4f}) "
                  f"held-out executed risk={risk:.4f} coverage={row['heldOutCoverage']:.3f} "
                  f"ECE={ece:.3f} [theta=0.5 risk={fixed_risk:.4f}]", flush=True)

# ----------------------------------------------------------------- E
outcomes: dict[str, list[bool]] = {}
stage_rel = []
for s in range(args.seeds):
    _, recs, _ = run(Ablations.governed(), 20260905 + s)
    for r in recs:
        outcomes.setdefault(f"{r['sessionId']}|{r['subGoalId']}", []).append(bool(r["executedCorrect"]))
    gold = [r for r in recs if r["gold"]]
    per_stage = {
        "S1 gold tool in selected set": st.mean(bool(set(r["selected"]) & set(r["gold"])) for r in gold),
        "S2 fidelity floor met": st.mean(r["fidelity"] >= 0.78 for r in recs if not r["failed"]),
        "S4 certified claim faithful": st.mean(r["consensusCorrect"] for r in recs if r["certified"]),
        "G1 executed | certified": st.mean(r["executed"] for r in recs if r["certified"]),
    }
    stage_rel.append({**per_stage, "product": end_to_end_reliability(per_stage),
                      "observedExecutedCorrect": st.mean(r["executedCorrect"] for r in recs)})
R["passK"] = {f"pass^{k}": pass_hat_k(list(outcomes.values()), k) for k in range(1, args.seeds + 1)}
R["stageReliability"] = stage_rel
print(f"[E] {R['passK']}", flush=True)
print(f"[E] stage reliability (seed 0): {json.dumps(stage_rel[0])}", flush=True)

# ----------------------------------------------------------------- F
try:
    code_ref = subprocess.check_output(["git", "-C", str(ROOT), "rev-parse", "HEAD"], text=True).strip()
except Exception:
    code_ref = "unknown"
manifest = ReleaseManifest.build(
    code_ref=code_ref, config=PipelineConfig(ablations=Ablations.governed()).to_dict(),
    agents=pipe0.pool.to_dicts(), tools=TOOLS.values(),
    models={"dense": args.retriever, "agents": "simulated-v1"},
    policy_path=DEFAULT_POLICY, index_fingerprint=sorted(TOOLS),
)
full = R.get("ablation", {}).get("Full ACRS + G1") or R["attack"]["Full ACRS + G1 @ attack 0.00"]
base = R.get("ablation", {}).get("SOTA baseline") or R["attack"]["Full ACRS (O1-O4) @ attack 0.00"]
gate = evaluation_gate(
    {"executedErrorRate": [p["executedErrorRate"] for p in full["perSeed"]],
     "fidelityFloorMet": [p["fidelityFloorMet"] for p in full["perSeed"]],
     "cost": [p["costPerSubGoal"] for p in full["perSeed"]],
     "latency_p95": [p["latencyP95Ms"] for p in full["perSeed"]]},
    {"cost": [p["costPerSubGoal"] for p in base["perSeed"]],
     "latency_p95": [p["latencyP95Ms"] for p in base["perSeed"]]},
    {"executedErrorRate": ("<=", 0.05), "fidelityFloorMet": (">=", 0.95)},
    flake_tolerance=0,
)
eng = PolicyEngine.from_file(DEFAULT_POLICY)
ci = eng.check_policy({"role": "pipeline", "name": "ci"}, "promote_release",
                      {"gate_passed": gate.passed, "manifest_digest": manifest.digest()}, {})
human = eng.check_policy({"role": "approver", "name": "release-owner"}, "promote_release",
                         {"gate_passed": gate.passed, "manifest_digest": manifest.digest()}, {})
R["release"] = {"manifest": manifest.to_dict(), "gate": gate.to_dict(),
                "ciMayPromote": ci.allow, "namedApproverMayPromote": human.allow}
print(f"[F] manifest {manifest.digest()[:16]}  gate={gate.passed} {list(gate.reasons)}  "
      f"CI may promote={ci.allow}  named approver may promote={human.allow}", flush=True)

R["runtimeSeconds"] = round(time.time() - T0, 1)
out = Path(args.out or ROOT / f"experiments/results/integrated_{args.dataset}{'_smoke' if args.smoke else ''}.json")
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(R, indent=1, default=str))
print(f"wrote {out} in {R['runtimeSeconds']}s", flush=True)
