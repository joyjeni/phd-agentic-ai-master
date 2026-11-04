"""O1 SATR v2 evaluation: 5-fold cross-validated weights, held-out NDCG on all 100 sessions,
ablations, BM25 vs hybrid (BM25 + LSA) first stage, and a topic-switch robustness test.

Usage: python experiments/o1_satr_v2.py --repo . --out experiments/results/o1_satr_v2.json
Leak-free: the co-occurrence graph is fit only on training trajectories whose tool set is not a test gold set,
and the new v2 signals (provider coherence, session provider memory, sibling expansion) use no training data.
"""
import argparse, json, random, sys, statistics as st, time
from dataclasses import replace, asdict
from multiprocessing import Pool
from pathlib import Path

ap = argparse.ArgumentParser(); ap.add_argument("--repo", default="."); ap.add_argument("--out", default="o1_satr_v2.json")
ap.add_argument("--k", type=int, default=40); ap.add_argument("--folds", type=int, default=5)
A = ap.parse_args(); REPO = Path(A.repo).resolve(); sys.path.insert(0, str(REPO / "laboratory/research/src"))
from paim.data.toolbench import load_bundle, build_sessions
from paim.o1_sasr.retriever import BM25Retriever, HybridRetriever
from paim.o1_sasr.lsa import LSARetriever
from paim.o1_sasr.reranker import SessionAwareReranker, StatelessReranker, RerankWeights
from paim.o1_sasr.cooccurrence import CooccurrenceGraph
from paim.common.session_state import SessionState
from paim.common.types import UserProfile, SubGoal, Session
from paim.common.metrics import ndcg_at_k, recall_at_k, mrr

B = load_bundle(REPO / "laboratory/data")
GOLD = {frozenset(q["gold_doc_ids"]) for q in B.queries}
GRAPH = CooccurrenceGraph().fit([t for t in B.train_trajectories if frozenset(t) not in GOLD])
SESS = build_sessions(B)
BM = BM25Retriever().fit(B.tools.values())
LSA = LSARetriever().fit(B.tools.values())
HYB = HybridRetriever(BM, LSA)
CACHE = {}
def cands(stage, text):
    key = (stage, text)
    if key not in CACHE:
        CACHE[key] = (BM if stage == "bm25" else HYB).search(text, A.k)
    return CACHE[key]

def run(weights, sessions, stage="bm25"):
    """Returns per-sub-goal records."""
    rr = StatelessReranker() if weights is None else SessionAwareReranker(GRAPH, weights)
    out = []
    for s in sessions:
        stt = SessionState()
        for g in s.sub_goals:
            stt.observe_intent(g.text)
            r = rr.rerank(g.text, cands(stage, g.text), B.tools, stt, UserProfile(), top_k=10)
            ids, gold = r.ranked_ids, list(g.gold_doc_ids)
            out.append({"sid": s.session_id, "turn": g.turn, "ndcg@5": ndcg_at_k(ids, gold, 5), "ndcg@10": ndcg_at_k(ids, gold, 10),
                        "recall@10": recall_at_k(ids, gold, 10), "mrr": mrr(ids, gold)})
            for d in r.selected[:3]:  # commit the system's OWN picks, never gold
                t = B.tools[d]; stt.observe_selection(d, t.key, t.category_name)
            stt.observe_satisfaction(g.text); stt.advance_turn()
    return out

def mean(rows, k="ndcg@5"): return st.mean(r[k] for r in rows) if rows else 0.0
GRID = {"session": [0.0, 0.25, 0.55], "cooccurrence": [0.0, 0.1], "profile": [0.0, 0.2], "redundancy": [0.0, 0.15],
        "served": [0.0, 0.2], "family": [0.0, 0.3, 0.6, 1.0], "session_family": [0.0, 0.3, 0.6, 1.0], "expand_seed": [0.0, 2.0, 3.0, 5.0]}

def tune(train):
    w = RerankWeights.v2(); best = mean(run(w, train))
    for _ in range(1):
        changed = False
        for name, opts in GRID.items():
            for v in opts:
                cand = replace(w, **{name: v}); sc = mean(run(cand, train))
                if sc > best + 1e-6: best, w, changed = sc, cand, True
        if not changed: break
    return w, best

def fold_job(f):
    test = [s for i, s in enumerate(SESS) if i % A.folds == f]; train = [s for i, s in enumerate(SESS) if i % A.folds != f]
    w, dev = tune(train)
    return f, asdict(w), dev

def boot(a, b, n=4000, seed=0):
    d = [x - y for x, y in zip(a, b)]; r = random.Random(seed)
    bs = sorted(st.mean(r.choice(d) for _ in d) for _ in range(n))
    return {"delta": round(st.mean(d), 4), "ci95": [round(bs[int(.025 * n)], 4), round(bs[int(.975 * n)], 4)],
            "p_le_0": round(sum(1 for x in bs if x <= 0) / n, 4)}

if __name__ == "__main__":
    t0 = time.time(); random.Random(1).shuffle(SESS)
    print(f"sessions={len(SESS)} subgoals={sum(len(s.sub_goals) for s in SESS)} lsa={LSA.available}", flush=True)
    with Pool(2) as pool: folds = sorted(pool.map(fold_job, range(A.folds)))
    print("fold weights:", [(f, {k: v for k, v in w.items() if v}) for f, w, _ in folds], f"{time.time()-t0:.0f}s", flush=True)
    W = {f: RerankWeights(**w) for f, w, _ in folds}
    def cv(make, stage="bm25"):
        rows = []
        for f in range(A.folds):
            test = [s for i, s in enumerate(SESS) if i % A.folds == f]
            rows += run(make(W[f]), test, stage)
        return rows
    R = {"protocol": {"folds": A.folds, "candidatePool": A.k, "sessions": len(SESS), "foldWeights": {f: w for f, w, _ in folds}}}
    configs = {
        "BM25 (stateless)": (lambda w: None, "bm25"),
        "SATR v1 (default weights)": (lambda w: RerankWeights.v1(), "bm25"),
        "SATR v2 (CV-tuned)": (lambda w: w, "bm25"),
        "  v2 minus provider coherence": (lambda w: replace(w, family=0.0), "bm25"),
        "  v2 minus session provider memory": (lambda w: replace(w, session_family=0.0), "bm25"),
        "  v2 minus sibling expansion": (lambda w: replace(w, expand_seed=0.0), "bm25"),
        "  v2 minus all session terms": (lambda w: replace(w, session=0.0, session_family=0.0, served=0.0, cooccurrence=0.0), "bm25"),
        "Hybrid BM25+LSA (stateless)": (lambda w: None, "hybrid"),
        "SATR v2 + hybrid first stage": (lambda w: w, "hybrid"),
    }
    rows = {}
    for name, (mk, stage) in configs.items():
        rows[name] = cv(mk, stage)
        later = [r for r in rows[name] if r["turn"] > 0]; first = [r for r in rows[name] if r["turn"] == 0]
        R.setdefault("heldout", {})[name] = {k: round(mean(rows[name], k), 4) for k in ["ndcg@5", "ndcg@10", "recall@10", "mrr"]} | {
            "ndcg@5_turn1": round(mean(first), 4), "ndcg@5_later_turns": round(mean(later), 4)}
        print(f"{name:38s}", R["heldout"][name], flush=True)
    base = [r["ndcg@5"] for r in rows["BM25 (stateless)"]]
    R["significance_vs_bm25"] = {n: boot([r["ndcg@5"] for r in rows[n]], base) for n in ["SATR v2 (CV-tuned)", "SATR v2 + hybrid first stage", "SATR v1 (default weights)"]}
    R["relative_gain_pct"] = {n: round(100 * (R["heldout"][n]["ndcg@5"] / R["heldout"]["BM25 (stateless)"]["ndcg@5"] - 1), 1) for n in R["heldout"]}
    # topic-switch robustness: session A (provider X) followed by session B (provider Y != X)
    fam = lambda s: B.tools[s.sub_goals[0].gold_doc_ids[0]].tool_name
    sw = {"BM25 (stateless)": [], "SATR v2": []}
    for i in range(len(SESS)):
        a, b = SESS[i], SESS[(i + 1) % len(SESS)]
        if fam(a) == fam(b): continue
        f = i % A.folds; goals = [replace(g, turn=j) for j, g in enumerate(list(a.sub_goals) + list(b.sub_goals))]
        combo = Session(session_id=f"switch-{i}", profile=UserProfile(), query=a.query + " " + b.query, sub_goals=goals)
        n_a = len(a.sub_goals)
        for name, w in [("BM25 (stateless)", None), ("SATR v2", W[f])]:
            sw[name].append(run(w, [combo])[n_a]["ndcg@5"])  # first sub-goal after the switch
    R["topic_switch_first_turn_after_switch"] = {k: round(st.mean(v), 4) for k, v in sw.items()} | {"pairs": len(sw["SATR v2"]),
        "delta": boot(sw["SATR v2"], sw["BM25 (stateless)"])}
    print("topic switch", R["topic_switch_first_turn_after_switch"], f"{time.time()-t0:.0f}s", flush=True)
    Path(A.out).parent.mkdir(parents=True, exist_ok=True); Path(A.out).write_text(json.dumps(R, indent=1))
