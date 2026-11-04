"""O3 adversarial test: hallucinating agents FORGE citations (cite the real observation tokens with a wrong claim).
This removes the simulator's built-in advantage (fabrications citing nothing) and tests the corroboration gate + quorum."""
import argparse, json, sys, statistics as st
from dataclasses import replace
from pathlib import Path
ap = argparse.ArgumentParser(); ap.add_argument("--repo"); ap.add_argument("--seeds", type=int, default=3); ap.add_argument("--out", default="o3_forge.json")
a = ap.parse_args(); repo = Path(a.repo); sys.path.insert(0, str(repo / "laboratory/research/src"))
import paim.o3_mncd.execution as ex
from paim.data.toolbench import load_bundle, build_sessions
from paim.pipeline.orchestrator import IntegratedPipeline, PipelineConfig, Ablations
from paim.o2_aprr.agents import AgentPool, DEFAULT_AGENTS
orig = ex.AgentRuntime.form_claim
def forged(self, agent, sub_goal_id, sub_goal_text, pool, tools, own_invocations=(), nonce=""):
    r = orig(self, agent, sub_goal_id, sub_goal_text, pool, tools, own_invocations, nonce)
    if r.hallucinated:
        r.evidence = tuple(ex.evidence_token(i.doc_id, i.observation) for i in pool if i.ok)
    return r
b = load_bundle(repo / "laboratory/data")
gs = {frozenset(q["gold_doc_ids"]) for q in b.queries}
traj = [t for t in b.train_trajectories if frozenset(t) not in gs]
def ev(abl, pool):
    P = []
    for s in range(a.seeds):
        pipe = IntegratedPipeline(b.tools, traj, PipelineConfig(seed=20260905 + s, ablations=abl), pool=pool)
        rows = [pipe.run(x).metrics for x in build_sessions(b)]
        succ = st.mean(r["sessionSuccessRate"] for r in rows); acc = st.mean(r["consensusAccuracy"] for r in rows)
        P.append({"acceptedErrorRate": succ - acc, "certifiedPrecision": acc / succ if succ else 0, "abstentionRate": st.mean(r["abstentionRate"] for r in rows)})
    return {k: round(st.mean(p[k] for p in P), 4) for k in P[0]}
R = {}
for forge in [False, True]:
    ex.AgentRuntime.form_claim = forged if forge else orig
    for f in [1, 3, 8]:
        pool = AgentPool(tuple(replace(x, hallucination_rate=min(0.9, x.hallucination_rate * f)) for x in DEFAULT_AGENTS))
        key = f"{'forged' if forge else 'no-cite'} x{f}"
        R[key] = {"majority": ev(Ablations(True, True, False, True), pool), "MNCD": ev(Ablations(), pool)}
        print(key, R[key], flush=True)
Path(a.out).write_text(json.dumps(R, indent=1))
