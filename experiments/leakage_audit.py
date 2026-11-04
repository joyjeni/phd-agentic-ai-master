"""Honest offline eval: stateless BM25 vs SATR session-aware rerank on sessionised ToolBench G1 (100 sessions)."""
import json, sys, random, time
import os; sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "laboratory", "research", "src"))
from paim.data.toolbench import load_bundle
from paim.o1_sasr.retriever import BM25Retriever
from paim.o1_sasr.reranker import SessionAwareReranker, StatelessReranker, RerankWeights
from paim.o1_sasr.cooccurrence import CooccurrenceGraph
from paim.common.session_state import SessionState
from paim.common.types import UserProfile
from paim.common.metrics import ndcg_at_k, recall_at_k, mrr
from dataclasses import replace

import os; D = os.path.join(os.path.dirname(__file__), "..", "laboratory", "data")
b = load_bundle(D)
sessions = [json.loads(l) for l in open(D + "/toolbench/sessions.test.jsonl")]
test_gold = {d for s in sessions for g in s["sub_goals"] for d in g["gold_doc_ids"]}
test_sets = [frozenset(g["gold_doc_ids"]) for s in sessions for g in s["sub_goals"]]
# leakage check: train trajectories identical to a test gold set
tr_sets = set(frozenset(t) for t in b.train_trajectories)
exact = sum(1 for t in set(frozenset(q["gold_doc_ids"]) for q in b.queries) if t in tr_sets)
print(f"tools={b.n_tools} train_traj={len(b.train_trajectories)} test_queries={len(b.queries)} exact-gold-set-in-train={exact}")

bm = BM25Retriever().fit(b.tools.values())
g_all = CooccurrenceGraph().fit(b.train_trajectories)
# leak-free graph: drop any train trajectory that equals a test query's full gold set
qsets = set(frozenset(q["gold_doc_ids"]) for q in b.queries)
g_clean = CooccurrenceGraph().fit([t for t in b.train_trajectories if frozenset(t) not in qsets])

def run(reranker, K=30, label=""):
    res = {"ndcg@5": [], "ndcg@10": [], "recall@10": [], "mrr": []}
    res_t = {0: [], 1: []}
    for s in sessions:
        st = SessionState(); prof = UserProfile()
        for g in sorted(s["sub_goals"], key=lambda x: x["turn"]):
            st.observe_intent(g["text"])
            cands = bm.search(g["text"], k=K)
            r = reranker.rerank(g["text"], cands, b.tools, st, prof, top_k=10)
            ranked = r.ranked_ids
            gold = g["gold_doc_ids"]
            n10 = ndcg_at_k(ranked, gold, 10)
            res["ndcg@5"].append(ndcg_at_k(ranked, gold, 5)); res["ndcg@10"].append(n10)
            res["recall@10"].append(recall_at_k(ranked, gold, 10)); res["mrr"].append(mrr(ranked, gold))
            res_t[min(g["turn"], 1)].append(n10)
            # commit system's OWN top-3 (no gold feedback -> no label leakage)
            for d in r.selected[:3]:
                t = b.tools[d]; st.observe_selection(d, t.key, t.category_name)
            st.observe_satisfaction(g["text"]); st.advance_turn()
    avg = lambda v: sum(v)/len(v)
    out = {k: round(avg(v), 4) for k, v in res.items()}
    out["ndcg@10_turn0"] = round(avg(res_t[0]), 4); out["ndcg@10_turn1+"] = round(avg(res_t[1]), 4)
    out["n_subgoals"] = len(res["mrr"])
    print(label.ljust(34), out, flush=True); return out, res

W = RerankWeights.v1()
results = {}
t=time.time(); print("graphs built", flush=True)
results["BM25 (stateless, SOTA-style)"], base = run(StatelessReranker(), label="BM25 stateless")
results["SATR full (graph incl. all train)"], full = run(SessionAwareReranker(g_all, W), label="SATR full")
results["SATR full (leak-filtered graph)"], fullc = run(SessionAwareReranker(g_clean, W), label="SATR full leak-filtered")
for term in ["session","cooccurrence","profile","redundancy","served","failure"]:
    results[f"SATR −{term}"], _ = run(SessionAwareReranker(g_clean, replace(W, **{term:0.0})), label=f"  ablate {term}")
# paired bootstrap on ndcg@10 base vs full-clean
a, c = base["ndcg@10"], fullc["ndcg@10"]; n=len(a); rnd=random.Random(0); wins=0
diffs=[]
for _ in range(2000):
    idx=[rnd.randrange(n) for _ in range(n)]; d=sum(c[i]-a[i] for i in idx)/n; diffs.append(d)
diffs.sort(); p=sum(1 for d in diffs if d<=0)/len(diffs)
results["bootstrap"]={"mean_delta_ndcg10": round(sum(c[i]-a[i] for i in range(n))/n,4),"ci95":[round(diffs[50],4),round(diffs[1949],4)],"p_le_0":p}
print(results["bootstrap"], f"{time.time()-t:.0f}s")
os.makedirs(os.path.join(os.path.dirname(__file__), "results"), exist_ok=True); json.dump(results, open(os.path.join(os.path.dirname(__file__), "results", "leakage_audit.json"),"w"), indent=1)
