# 22 Objective 1 — SATR

*Research Objectives*

SATR is Session-Aware Tool Retrieval — Objective 1 of ACRS. Given the current query q and the session history H (dialogue turns, last tool traces, and a co-activation cache of tools that succeeded together), SATR returns a ranked shortlist of ToolBench-schema tools. Semantic rank is fused with session scores; λ may grow with session length. SATR is not a new language model. Live mandi and weather rows are not SATR’s job; they enter at MNCD. The shortlist is the input to APRR. FCNP writes surviving live citations back into the next SATR prior, so retrieval is closed-loop.

SOTA. Qin et al., ToolLLM / ToolBench (ICLR 2024): Sentence-BERT API retriever over 16,464 RapidAPI tools, then ToolLLaMA + DFSDT. Zheng et al., ToolRerank (LREC-COLING 2024): adaptive truncation of seen vs unseen APIs and hierarchy-aware concentration/diversity. Pipeline: instruction → SBERT retrieve top-k APIs → (optional ToolRerank truncate/rerank) → LLM DFSDT/ReAct planner

Gap. SOTA retrievers are turn-amnesic. They do not maintain a success-conditioned co-activation graph or ingest pruned memory from later stages.

Novelty. Session co-activation cache as a first-class prior over tool pairs. Convex fusion of semantic and session scores; λ may grow with session length. ToolRerank-style seen/unseen truncation kept, then applied after session scoring. FCNP memory mixed into the next SATR prior so retrieval is closed-loop.

Diagram: `compare-satr` — open /architecture in the laboratory.

_Repository: github.com/joyjeni/session-aware-toolbench-rerank_

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
