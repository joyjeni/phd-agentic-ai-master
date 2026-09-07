# 23 Objective 1 — SATR

*Research Objectives*

To design SATR so that tool ranking is conditioned on the current query together with session history and a co-activation cache of tools that succeeded together, and so that SATR never executes live ministry APIs.

- Artefact. Truncated RankedTool shortlist consumed by APRR.
- What will be designed. To design Session-Aware Tool Retrieval: a fused ranker that, given query q, session history H, co-activation cache W_cooc, FCNP memory M, and an Agriculture catalog C, returns a truncated ToolBench-schema shortlist for APRR.
- Gap. SOTA retrievers are turn-amnesic. They do not maintain a success-conditioned co-activation graph or ingest pruned memory from later stages.

Diagram: `compare-satr` — open /architecture in the laboratory.

_Repository: github.com/joyjeni/session-aware-toolbench-rerank_

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
