"""Panel-requested baselines and sensitivity analyses (O1-O4), 3 seeds, leak-filtered.

O1  interleaved two-provider sessions (A1 B1 A2 B2 ...): does session provider memory break when a
    session mixes providers?  BM25 vs SATR v2.
O2  router baselines inside the full loop: static heavy, round robin, capability match, LinUCB,
    linear Thompson sampling, APRR; plus an (alpha, gamma_base) sensitivity grid.
O3  consensus baselines: majority vote, highest confidence, MNCD; and a (theta, kappa) sensitivity grid
    giving the accepted-error vs abstention trade-off.
O4  pruning baselines: no pruning, recency (tail truncation), fixed ratios 0.3/0.5/0.7, FCNP + PI controller;
    and a fidelity-floor sensitivity sweep.
Session-level paired bootstrap 95% CIs are reported for the headline comparisons.
Usage: python experiments/baselines_sensitivity.py --repo . --seeds 3 --out experiments/results/baselines_sensitivity.json
"""
import argparse, json, random, sys, statistics as st, time
from dataclasses import replace
from pathlib import Path
ap = argparse.ArgumentParser(); ap.add_argument("--repo", default="."); ap.add_argument("--seeds", type=int, default=3)
ap.add_argument("--out", default="baselines_sensitivity.json"); A = ap.parse_args()
REPO = Path(A.repo).resolve(); sys.path.insert(0, str(REPO / "laboratory/research/src"))
from paim.data.toolbench import load_bundle, build_sessions
from paim.pipeline.orchestrator import IntegratedPipeline, PipelineConfig, Ablations
from paim.o2_aprr.router import APRRRouter, StaticHeavyRouter, RoundRobinRouter, CapabilityMatchRouter, RoutingConfig
from paim.o2_aprr.baselines import LinUCBRouter, LinTSRouter
from paim.o3_mncd.consensus import EvidenceWeightedConsensus, MajorityVoteConsensus, HighestConfidenceConsensus, ConsensusConfig
from paim.o4_fcnp.controller import FidelityController, FixedBudgetController, ControllerConfig
from paim.o4_fcnp.pruner import FCNPPruner, FixedRatioPruner, TailTruncationPruner, NoPruner
from paim.o1_sasr.retriever import BM25Retriever
from paim.o1_sasr.reranker import SessionAwareReranker, StatelessReranker, RerankWeights
from paim.common.session_state import SessionState
from paim.common.types import UserProfile
from paim.common.metrics import ndcg_at_k

B = load_bundle(REPO / "laboratory/data")
GOLD = {frozenset(q["gold_doc_ids"]) for q in B.queries}
TRAJ = [t for t in B.train_trajectories if frozenset(t) not in GOLD]
SESS = build_sessions(B)

def session_rows(customise=None, cfg_kw=None, seeds=A.seeds):
    """Per-session metric rows averaged over seeds (keeps sessions paired for bootstrap)."""
    acc = {}
    for s in range(seeds):
        cfg = PipelineConfig(seed=20260905 + s, **(cfg_kw or {}))
        pipe = IntegratedPipeline(B.tools, TRAJ, cfg)
        if customise: customise(pipe, cfg)
        for sess in build_sessions(B):
            m = pipe.run(sess).metrics
            m["acceptedError"] = m["sessionSuccessRate"] - m["consensusAccuracy"]
            acc.setdefault(sess.session_id, []).append(m)
    keys = ["ndcg@5", "acceptedError", "abstentionRate", "totalCost", "totalWallLatencyMs", "compression",
            "meanFidelity", "floorSatisfactionRate", "regret_avgRegret", "regret_oracleAgreement", "escalationRate"]
    return {sid: {k: st.mean(r[k] for r in rs if k in r) for k in keys} for sid, rs in acc.items()}

def summary(rows):
    keys = next(iter(rows.values())).keys()
    return {k: round(st.mean(r[k] for r in rows.values()), 4) for k in keys}

def boot(a, b, key, n=3000):
    ids = sorted(a); d = [a[i][key] - b[i][key] for i in ids]; r = random.Random(0)
    bs = sorted(st.mean(r.choice(d) for _ in d) for _ in range(n))
    return {"delta": round(st.mean(d), 4), "ci95": [round(bs[int(.025 * n)], 4), round(bs[int(.975 * n)], 4)]}

R = {"seeds": A.seeds}; t0 = time.time()
def log(name, s): print(f"{time.time()-t0:5.0f}s {name:42s}", {k: s[k] for k in ['ndcg@5','acceptedError','abstentionRate','totalCost','compression','floorSatisfactionRate','regret_avgRegret'] if k in s}, flush=True)

# ---------------- O1 interleaved two-provider sessions ----------------
bm = BM25Retriever().fit(B.tools.values())
fam = lambda s: B.tools[s.sub_goals[0].gold_doc_ids[0]].tool_name
def interleave(a, b):
    out, ia, ib = [], list(a.sub_goals), list(b.sub_goals)
    while ia or ib:
        if ia: out.append(ia.pop(0))
        if ib: out.append(ib.pop(0))
    return out
res = {"BM25 (stateless)": [], "SATR v2": []}
for i in range(len(SESS)):
    a, b = SESS[i], SESS[(i + 7) % len(SESS)]
    if fam(a) == fam(b): continue
    goals = interleave(a, b)
    for name, rr in [("BM25 (stateless)", StatelessReranker()), ("SATR v2", SessionAwareReranker(weights=RerankWeights.v2()))]:
        stt = SessionState()
        for g in goals:
            stt.observe_intent(g.text)
            r = rr.rerank(g.text, bm.search(g.text, 40), B.tools, stt, UserProfile())
            res[name].append(ndcg_at_k(r.ranked_ids, list(g.gold_doc_ids), 5))
            for d in r.selected[:3]: stt.observe_selection(d, B.tools[d].key, B.tools[d].category_name)
            stt.advance_turn()
d = [x - y for x, y in zip(res["SATR v2"], res["BM25 (stateless)"])]; rr_ = random.Random(0)
bs = sorted(st.mean(rr_.choice(d) for _ in d) for _ in range(3000))
R["O1_interleaved_two_provider"] = {k: round(st.mean(v), 4) for k, v in res.items()} | {"subgoals": len(d), "delta": round(st.mean(d), 4), "ci95": [round(bs[75], 4), round(bs[2924], 4)]}
print("O1 interleaved", R["O1_interleaved_two_provider"], flush=True)

# ---------------- O2 routing baselines ----------------
def router(cls, **kw):
    def f(pipe, cfg): pipe.router = cls(pipe.pool, RoutingConfig(**kw) if kw else cfg.routing)
    return f
O2 = {}
for name, cls in [("Static heavy", StaticHeavyRouter), ("Round robin", RoundRobinRouter), ("Capability match", CapabilityMatchRouter),
                  ("LinUCB", LinUCBRouter), ("Linear Thompson sampling", LinTSRouter), ("APRR (proposed)", APRRRouter)]:
    O2[name] = session_rows(router(cls)); log("O2 " + name, summary(O2[name]))
R["O2_routers"] = {k: summary(v) for k, v in O2.items()}
R["O2_ci_APRR_vs_LinUCB"] = {k: boot(O2["APRR (proposed)"], O2["LinUCB"], k) for k in ["totalCost", "acceptedError", "regret_avgRegret"]}
R["O2_ci_APRR_vs_StaticHeavy"] = {k: boot(O2["APRR (proposed)"], O2["Static heavy"], k) for k in ["totalCost", "acceptedError", "totalWallLatencyMs"]}
R["O2_sensitivity"] = {}
for a in [0.15, 0.35, 0.6]:
    for g in [0.0, 0.3, 0.6]:
        s = summary(session_rows(router(APRRRouter, alpha=a, gamma_base=g), seeds=1))
        R["O2_sensitivity"][f"alpha={a},gamma={g}"] = s; log(f"O2 sens a={a} g={g}", s)

# ---------------- O3 consensus baselines + sensitivity ----------------
def cons(cls, **kw):
    def f(pipe, cfg): pipe.mesh.consensus = cls(ConsensusConfig(**kw)) if kw else cls(cfg.consensus)
    return f
O3 = {}
for name, cls in [("Majority vote", MajorityVoteConsensus), ("Highest confidence (LLM-as-judge proxy)", HighestConfidenceConsensus), ("MNCD (proposed)", EvidenceWeightedConsensus)]:
    O3[name] = session_rows(cons(cls)); log("O3 " + name, summary(O3[name]))
R["O3_consensus"] = {k: summary(v) for k, v in O3.items()}
R["O3_ci_MNCD_vs_majority"] = {k: boot(O3["MNCD (proposed)"], O3["Majority vote"], k) for k in ["acceptedError", "abstentionRate"]}
R["O3_sensitivity"] = {}
for th in [0.4, 0.5, 0.6, 0.7]:
    for kap in [0.2, 0.35, 0.5]:
        s = summary(session_rows(cons(EvidenceWeightedConsensus, certification_threshold=th, corroboration_penalty=kap), seeds=1))
        R["O3_sensitivity"][f"theta={th},kappa={kap}"] = s; log(f"O3 sens th={th} k={kap}", s)

# ---------------- O4 pruning baselines + floor sweep ----------------
def ctl(make):
    def f(pipe, cfg): pipe.controller = make(cfg)
    return f
O4 = {}
for name, mk in [("No pruning", lambda c: FixedBudgetController(NoPruner(), 1.0, c.controller.fidelity_floor)),
                 ("Recency truncation 50%", lambda c: FixedBudgetController(TailTruncationPruner(), 0.5, c.controller.fidelity_floor)),
                 ("Fixed ratio 30%", lambda c: FixedBudgetController(FixedRatioPruner(keep_ratio=0.3), 0.3, c.controller.fidelity_floor)),
                 ("Fixed ratio 50%", lambda c: FixedBudgetController(FixedRatioPruner(keep_ratio=0.5), 0.5, c.controller.fidelity_floor)),
                 ("Fixed ratio 70%", lambda c: FixedBudgetController(FixedRatioPruner(keep_ratio=0.7), 0.7, c.controller.fidelity_floor)),
                 ("FCNP + PI controller (proposed)", lambda c: FidelityController(FCNPPruner(), c.controller))]:
    O4[name] = session_rows(ctl(mk)); log("O4 " + name, summary(O4[name]))
R["O4_pruning"] = {k: summary(v) for k, v in O4.items()}
R["O4_floor_sweep"] = {}
for fl in [0.6, 0.7, 0.78, 0.85, 0.9]:
    s = summary(session_rows(ctl(lambda c, fl=fl: FidelityController(FCNPPruner(), ControllerConfig(fidelity_floor=fl))), seeds=1))
    R["O4_floor_sweep"][f"floor={fl}"] = s; log(f"O4 floor {fl}", s)

Path(A.out).parent.mkdir(parents=True, exist_ok=True); Path(A.out).write_text(json.dumps(R, indent=1)); print("wrote", A.out)
