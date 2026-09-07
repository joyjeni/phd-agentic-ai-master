"""O1 - Session-Aware Sequential Tool Retrieval and Reranking (SASR).

Positioning
-----------
============================  ==========================================================
SOTA                          Limitation this objective attacks
============================  ==========================================================
ToolRetriever (ToolBench,      Stateless bi-encoder. One embedding of the whole
Qin et al. 2023)               instruction, one ANN lookup, no notion of what the
                               session has already retrieved or already satisfied.
ToolRerank (2024)              Adds a cross-encoder reranker, but the reranking features
                               are (query, api) only - still turn-independent.
API-Bank / ToolLLM planners    Track dialogue history in the *prompt*, so history
                               competes with tool schemas for context budget and is
                               never used as an explicit ranking feature.
MMR / submodular diversity     Diversifies against other *candidates*, not against
                               intents the session has already served.
============================  ==========================================================

Proposed
--------
Rank each candidate endpoint by its **marginal utility to the open sub-goal
given the session state**, decomposed into six inspectable terms:

.. math::

    s(d) = w_r\\,\\mathrm{rel}(d,q)
         + w_s\\,\\mathrm{sess}(d,M_t)
         + w_c\\,\\mathrm{cooc}(d,C)
         + w_p\\,\\mathrm{prior}(d,u)
         - w_x\\,\\mathrm{red}(d,C)
         - w_v\\,\\mathrm{served}(d,S_t)
         - w_f\\,\\mathrm{fail}(d)

* ``rel``     stateless first-stage relevance (BM25 / bi-encoder), min-max normalised
* ``sess``    cosine against the decayed session intent memory :math:`M_t` - **novel**
* ``cooc``    PPMI co-occurrence affinity to endpoints already committed - **novel**
* ``prior``   requester-profile / sector prior (e.g. ``sector=Agriculture``) - **novel**
* ``red``     redundancy against committed endpoints (diversity)
* ``served``  overlap with intents the session already satisfied :math:`S_t` - **novel**
* ``fail``    per-endpoint failure and saturation penalty from this session - **novel**

Selection is **greedy over marginal gain**: after each pick, ``cooc`` and
``red`` are recomputed against the enlarged committed set. Because ``red``
enters with a negative sign and is monotone in the committed set, the induced
set objective is submodular, so the greedy order is the standard
:math:`(1-1/e)` approximation to the best set of size *k* - and it also yields a
full permutation of the candidate pool, so the run is directly scorable with
NDCG/Recall against the official ToolBench qrels.

``StatelessReranker`` is the ablation with :math:`w_s=w_c=w_p=w_x=w_v=w_f=0`,
i.e. the SOTA behaviour, kept in the same file so the comparison is honest.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Mapping, Sequence

from paim.common.session_state import SessionState
from paim.common.text import bag, cosine, tokenize
from paim.common.types import Tool, UserProfile
from paim.o1_sasr.cooccurrence import CooccurrenceGraph
from paim.o1_sasr.retriever import Candidate


@dataclass(frozen=True)
class RerankWeights:
    """Scoring weights. Every ablation in the report is a variant of this."""

    relevance: float = 1.0
    session: float = 0.55
    cooccurrence: float = 0.45
    profile: float = 0.20
    redundancy: float = 0.35
    served: float = 0.40
    failure: float = 0.30

    @staticmethod
    def stateless() -> "RerankWeights":
        return RerankWeights(
            relevance=1.0,
            session=0.0,
            cooccurrence=0.0,
            profile=0.0,
            redundancy=0.0,
            served=0.0,
            failure=0.0,
        )

    def to_dict(self) -> dict[str, float]:
        return asdict(self)


@dataclass
class ScoredCandidate:
    doc_id: str
    score: float
    terms: dict[str, float] = field(default_factory=dict)
    first_stage_rank: int = -1
    tool_key: str = ""

    def explain(self) -> str:
        parts = [f"{k}={v:+.3f}" for k, v in self.terms.items() if abs(v) > 1e-9]
        return f"{self.tool_key or self.doc_id} -> {self.score:+.3f} ({', '.join(parts)})"


@dataclass
class RerankResult:
    ranked: list[ScoredCandidate]
    selected: list[str]
    first_stage: list[str]
    weights: dict[str, float]
    n_candidates: int

    @property
    def ranked_ids(self) -> list[str]:
        return [c.doc_id for c in self.ranked]

    def explanations(self, top: int = 5) -> list[str]:
        return [c.explain() for c in self.ranked[:top]]


def _min_max(scores: Sequence[float]) -> list[float]:
    if not scores:
        return []
    lo, hi = min(scores), max(scores)
    if hi - lo < 1e-12:
        return [1.0 for _ in scores]
    return [(s - lo) / (hi - lo) for s in scores]


class SessionAwareReranker:
    """The O1 contribution: a session-conditioned marginal-utility reranker."""

    objective = "O1"
    name = "SASR"

    def __init__(
        self,
        graph: CooccurrenceGraph | None = None,
        weights: RerankWeights | None = None,
    ) -> None:
        self.graph = graph or CooccurrenceGraph()
        self.weights = weights or RerankWeights()

    # -- helpers -----------------------------------------------------------
    @staticmethod
    def _profile_prior(tool: Tool, profile: UserProfile, state: SessionState) -> float:
        """Sector / interest prior in [0, 1].

        With ``sector="Agriculture"`` this is what floats commodity-price,
        weather and geocoding endpoints above generic data endpoints before any
        session history exists - the cold-start half of session awareness.
        """
        profile_terms = set(tokenize(" ".join((profile.sector, *profile.interests))))
        if not profile_terms:
            lexical = 0.0
        else:
            doc_terms = set(tokenize(tool.document_text()))
            lexical = len(profile_terms & doc_terms) / len(profile_terms)
        return 0.6 * lexical + 0.4 * state.category_prior(tool.category_name)

    # -- main --------------------------------------------------------------
    def rerank(
        self,
        sub_goal_text: str,
        candidates: Sequence[Candidate],
        tools: Mapping[str, Tool],
        state: SessionState,
        profile: UserProfile,
        committed: Sequence[str] | None = None,
        top_k: int = 10,
    ) -> RerankResult:
        candidates = [c for c in candidates if c.doc_id in tools]
        if not candidates:
            return RerankResult([], [], [], self.weights.to_dict(), 0)

        w = self.weights
        norm_rel = _min_max([c.score for c in candidates])
        first_stage = [c.doc_id for c in candidates]

        goal_bag = bag(sub_goal_text)
        doc_bags = {c.doc_id: bag(tools[c.doc_id].document_text()) for c in candidates}

        # Static (committed-set independent) part of the score.
        static: dict[str, dict[str, float]] = {}
        for rel, c in zip(norm_rel, candidates):
            tool = tools[c.doc_id]
            doc_text = tool.document_text()
            terms = {
                "relevance": w.relevance * rel,
                "session": w.session * state.intent_affinity(doc_text),
                "profile": w.profile * self._profile_prior(tool, profile, state),
                "served": -w.served * state.redundancy(doc_text),
                "failure": -w.failure
                * (state.failure_penalty(tool.key) + 0.5 * state.saturation(tool.key)),
            }
            # A candidate that lexically matches the *open* sub-goal directly is
            # boosted a little; this keeps ``relevance`` from being the only
            # query-conditioned signal when the first stage is poorly calibrated.
            terms["goalMatch"] = 0.25 * w.relevance * cosine(goal_bag, doc_bags[c.doc_id])
            static[c.doc_id] = terms

        pool = {c.doc_id: c for c in candidates}
        working = list(committed or state.selected_doc_ids)
        ranked: list[ScoredCandidate] = []
        remaining = set(pool)

        # Greedy marginal-gain ordering over the whole candidate pool.
        while remaining:
            best_id: str | None = None
            best_score = float("-inf")
            best_terms: dict[str, float] = {}
            for doc_id in sorted(remaining):
                terms = dict(static[doc_id])
                terms["cooccurrence"] = w.cooccurrence * self.graph.affinity(doc_id, working)
                terms["redundancy"] = -w.redundancy * max(
                    (cosine(doc_bags[doc_id], doc_bags[c]) for c in working if c in doc_bags),
                    default=0.0,
                )
                total = sum(terms.values())
                if total > best_score:
                    best_id, best_score, best_terms = doc_id, total, terms
            assert best_id is not None
            remaining.discard(best_id)
            working.append(best_id)
            ranked.append(
                ScoredCandidate(
                    doc_id=best_id,
                    score=round(best_score, 8),
                    terms={k: round(v, 6) for k, v in best_terms.items()},
                    first_stage_rank=pool[best_id].rank,
                    tool_key=tools[best_id].key,
                )
            )

        return RerankResult(
            ranked=ranked,
            selected=[c.doc_id for c in ranked[:top_k]],
            first_stage=first_stage,
            weights=w.to_dict(),
            n_candidates=len(candidates),
        )


class StatelessReranker(SessionAwareReranker):
    """SOTA ablation: first-stage order only, no session conditioning."""

    name = "Stateless (ToolRetriever-style)"

    def __init__(self) -> None:
        super().__init__(graph=CooccurrenceGraph(), weights=RerankWeights.stateless())


__all__ = [
    "RerankResult",
    "RerankWeights",
    "ScoredCandidate",
    "SessionAwareReranker",
    "StatelessReranker",
]
