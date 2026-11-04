"""O1 SATR: tune reranker weights on a DEV half, report on held-out TEST half (leak-filtered co-occurrence graph)."""
import argparse, json, sys, itertools, random, statistics as st
from dataclasses import replace
from pathlib import Path
ap = argparse.ArgumentParser(); ap.add_argument("--repo", default="phd-agentic-ai-master"); ap.add_argument("--out", default="o1_results.json")
a = ap.parse_args(); repo = Path(a.repo); sys.path.insert(0, str(repo / "laboratory/research/src"))
from paim.data.toolbench import load_bundle, build_sessions
from paim.o1_sasr.retriever import BM25Retriever
from paim.o1_sasr.reranker import SessionAwareReranker, StatelessReranker, RerankWeights
from paim.o1_sasr.cooccurrence import CooccurrenceGraph
from paim.common.session_state import SessionState
from paim.common.types import UserProfile
from paim.common.metrics import ndcg_at_k, recall_at_k, mrr

b = load_bundle(repo / "laboratory/data")
gold_sets = {frozenset(q["gold_doc_ids"]) for q in b.queries}
graph = CooccurrenceGraph().fit([t for t in b.train_trajectories if frozenset(t) not in gold_sets])
bm = BM25Retriever().fit(b.tools.values())
sessions = build_sessions(b)
rnd = random.Random(7); idx = list(range(len(sessions))); rnd.shuffle(idx)
dev = [sessions[i] for i in idx[:50]]; test = [sessions[i] for i in idx[50:]]
cache = {}
def cands(text):
    if text not in cache: cache[text] = bm.search(text, k=40)
    return cache[text]

def run(rr, sess):
    m = {"ndcg@5": [], "ndcg@10": [], "recall@10": [], "mrr": [], "ndcg@5_later_turns": []}
    for s in sess:
        stt = SessionState()
        for g in s.sub_goals:
            stt.observe_intent(g.text)
            r = rr.rerank(g.text, cands(g.text), b.tools, stt, UserProfile(), top_k=10)
            ids = r.ranked_ids; gold = list(g.gold_doc_ids)
            m["ndcg@5"].append(ndcg_at_k(ids, gold, 5)); m["ndcg@10"].append(ndcg_at_k(ids, gold, 10))
            m["recall@10"].append(recall_at_k(ids, gold, 10)); m["mrr"].append(mrr(ids, gold))
            if g.turn > 0: m["ndcg@5_later_turns"].append(ndcg_at_k(ids, gold, 5))
            for d in r.selected[:3]:
                t = b.tools[d]; stt.observe_selection(d, t.key, t.category_name)
            stt.observe_satisfaction(g.text); stt.advance_turn()
    return {k: round(st.mean(v), 4) for k, v in m.items() if v}, m

grid = list(itertools.product([0.0, 0.25, 0.55], [0.0, 0.1, 0.25], [0.0, 0.2], [0.0, 0.15, 0.35], [0.0, 0.2, 0.4]))
best = None
for se, co, pr, red, sv in grid:
    w = replace(RerankWeights.v1(), session=se, cooccurrence=co, profile=pr, redundancy=red, served=sv)
    score = run(SessionAwareReranker(graph, w), dev)[0]["ndcg@5"]
    if best is None or score > best[0]: best = (score, w)
print("best dev ndcg@5", best[0], best[1].to_dict(), flush=True)

res = {"split": {"dev_sessions": len(dev), "test_sessions": len(test)}, "tuned_weights": best[1].to_dict()}
base, bm_ = run(StatelessReranker(), test)
default, _ = run(SessionAwareReranker(graph, RerankWeights.v1()), test)
tuned, tm = run(SessionAwareReranker(graph, best[1]), test)
d = [x - y for x, y in zip(tm["ndcg@5"], bm_["ndcg@5"])]
r2 = random.Random(0); boots = sorted(st.mean(r2.choice(d) for _ in d) for _ in range(2000))
res.update({"test": {"BM25 stateless": base, "SATR default weights": default, "SATR tuned on dev": tuned},
            "tuned_vs_bm25_ndcg5": {"delta": round(st.mean(d), 4), "ci95": [round(boots[50], 4), round(boots[1949], 4)],
                                    "rel_improvement_pct": round(100 * st.mean(d) / base["ndcg@5"], 2)}})
print(json.dumps(res, indent=1)); Path(a.out).write_text(json.dumps(res, indent=1))
