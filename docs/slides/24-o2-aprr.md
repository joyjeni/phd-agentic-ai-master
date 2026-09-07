# 24 Objective 2 — APRR

*Research Objectives*

To design APRR so that routing samples a training-free path among tool-specialist agents (agriculture_analyst, schema_planner, tool_executor, mesh_critic, retrieval_specialist) rather than choosing a foundation-model SKU or following an authored SOP.

- Artefact. Hop path A_t and per-hop tool assignments consumed by MNCD.
- What will be designed. To design training-free hop sampling over named tool-specialist agents that takes the SATR shortlist and produces a hop path and per-hop tool assignments for MNCD.
- Gap. SOTA either trains a neural router, picks a model, or follows an authored SOP. It does not maintain a training-free affinity matrix over Indian OGD tool families.

Diagram: `compare-aprr` — open /architecture in the laboratory.

_Repository: github.com/joyjeni/aprr-multi-agent-routing_

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
