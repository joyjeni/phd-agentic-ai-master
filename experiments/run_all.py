"""ACRS executable benchmark: runs all four objectives (O1-O4) and the integrated loop.

Usage:  python run_all.py --repo <path to phd-agentic-ai-master> [--seeds 3] [--out results.json]
Runs on CPU in a few minutes (Colab / Kaggle / any laptop). Only dependency: numpy.

Protocol
- Data: sessionised ToolBench G1 retrieval split shipped in the repo (100 queries -> 174 sub-goals, 10,439 APIs).
- Leakage control: training trajectories whose tool set equals any test query's gold set are removed
  before fitting the O1 co-occurrence graph (94/100 test gold sets were present verbatim).
- One-at-a-time ablation: SOTA baseline (all four mechanisms replaced by their SOTA analogue), +O1, +O2, +O3, +O4, full ACRS.
  SOTA analogues: O1 stateless BM25 (ToolRetriever-style); O2 static heavy-tier routing; O3 majority vote; O4 fixed 50% keep ratio.
- O3 stress test: agent hallucination rates scaled x1..x8; evidence-weighted quorum vs majority vote.
- Agent execution is SIMULATED (seeded, schema-faithful); results are about orchestration mechanisms, not LLM quality.
"""
import argparse, json, sys, time, statistics as st
from dataclasses import replace
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument("--repo", default="phd-agentic-ai-master")
ap.add_argument("--seeds", type=int, default=3)
ap.add_argument("--out", default="acrs_results.json")
args = ap.parse_args()
repo = Path(args.repo)
sys.path.insert(0, str(repo / "laboratory/research/src"))

from paim.data.toolbench import load_bundle, build_sessions
from paim.pipeline.orchestrator import IntegratedPipeline, PipelineConfig, Ablations
from paim.o2_aprr.agents import AgentPool, DEFAULT_AGENTS

bundle = load_bundle(repo / "laboratory/data")
gold_sets = {frozenset(q["gold_doc_ids"]) for q in bundle.queries}
leaked = sum(1 for t in {frozenset(t) for t in bundle.train_trajectories} if t in gold_sets)
clean_traj = [t for t in bundle.train_trajectories if frozenset(t) not in gold_sets]
print(f"tools={bundle.n_tools} test_queries={len(bundle.queries)} train={len(bundle.train_trajectories)} "
      f"leaked_gold_sets={leaked} removed={len(bundle.train_trajectories)-len(clean_traj)}", flush=True)

KEYS = ["ndcg@5", "recall@5", "mrr", "selectionF1", "sessionSuccessRate", "consensusAccuracy",
        "abstentionRate", "escalationRate", "totalCost", "totalWallLatencyMs", "compression",
        "meanFidelity", "floorSatisfactionRate", "regret_avgRegret", "regret_oracleAgreement"]

def evaluate(abl, traj, seeds, pool=None, label=""):
    t0 = time.time(); per_seed = []
    for s in range(seeds):
        cfg = PipelineConfig(seed=20260905 + s, ablations=abl)
        pipe = IntegratedPipeline(bundle.tools, traj, cfg, pool=pool)
        rows = [pipe.run(sess).metrics for sess in build_sessions(bundle)]
        per_seed.append({k: st.mean(r[k] for r in rows if k in r) for k in KEYS if any(k in r for r in rows)})
    for p in per_seed:
        p["acceptedErrorRate"] = p["sessionSuccessRate"] - p["consensusAccuracy"]   # certified but not backed by a faithful peer
        p["certifiedPrecision"] = p["consensusAccuracy"] / p["sessionSuccessRate"] if p["sessionSuccessRate"] else 0.0
    out = {k: round(st.mean(p[k] for p in per_seed), 4) for k in per_seed[0]}
    out["_sd"] = {k: round(st.pstdev(p[k] for p in per_seed), 4) for k in per_seed[0]}
    print(f"{label:28s} {time.time()-t0:5.0f}s  " + "  ".join(f"{k}={out[k]}" for k in
          ["ndcg@5","acceptedErrorRate","certifiedPrecision","abstentionRate","totalCost","totalWallLatencyMs","compression","floorSatisfactionRate"] if k in out), flush=True)
    return out

R = {"protocol": {"tools": bundle.n_tools, "testQueries": len(bundle.queries), "leakedGoldSets": leaked,
                  "seeds": args.seeds, "trainTrajectoriesClean": len(clean_traj)}}
F, T = False, True
configs = {
    "SOTA baseline": Ablations(F, F, F, F),
    "+O1 SATR": Ablations(T, F, F, F),
    "+O2 APRR": Ablations(F, T, F, F),
    "+O3 MNCD": Ablations(F, F, T, F),
    "+O4 FCNP": Ablations(F, F, F, T),
    "Full ACRS": Ablations(T, T, T, T),
    "Full ACRS minus O1": Ablations(F, T, T, T),
}
R["ablation"] = {name: evaluate(a, clean_traj, args.seeds, label=name) for name, a in configs.items()}
R["ablation_leaky_graph"] = {"Full ACRS (leaky graph)": evaluate(Ablations(), bundle.train_trajectories, args.seeds, label="Full ACRS leaky")}

# O3 stress test: scale every agent's hallucination rate
R["o3_stress"] = {}
for f in [1, 3, 5, 8]:
    pool = AgentPool(tuple(replace(a, hallucination_rate=min(0.9, a.hallucination_rate * f)) for a in DEFAULT_AGENTS))
    R["o3_stress"][f"x{f}"] = {
        "majority": evaluate(Ablations(T, T, F, T), clean_traj, args.seeds, pool=pool, label=f"stress x{f} majority"),
        "evidence_quorum": evaluate(Ablations(T, T, T, T), clean_traj, args.seeds, pool=pool, label=f"stress x{f} MNCD"),
    }
Path(args.out).write_text(json.dumps(R, indent=1))
print("wrote", args.out)
