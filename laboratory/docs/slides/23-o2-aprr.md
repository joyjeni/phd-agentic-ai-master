# 23 Objective 2 — APRR

*Research Objectives*

To design training-free hop sampling over named tool-specialist agents that takes the SATR shortlist and produces a hop path and per-hop tool assignments for MNCD.

SOTA. Yue et al., MasRouter (ACL 2025, doi:10.18653/v1/2025.acl-long.757): trained neural controller over multi-agent topologies. Ong et al., RouteLLM (ICLR 2025): routers among LLMs. Panda et al., Adaptive LLM Routing under Budget Constraints (PILOT; Findings of EMNLP 2025, doi:10.18653/v1/2025.findings-emnlp.1301): preference-prior LinUCB for budget-constrained LLM routing. Hong et al., MetaGPT (ICLR 2024): authored SOP workflows. Pipeline: query → trained controller or difficulty model → choose one LLM/agent → execute

Gap. SOTA either trains a neural router, picks a model, or follows an authored SOP. It does not maintain a training-free affinity matrix over Indian OGD tool families.

Novelty. Training-free online affinity W versus a learned controller. Hop 0 is agriculture_analyst; later hops are sampled from P(a_j|a_i,q) ∝ W_ij^α · η_ij^β · ψ_j(q)^γ. assignTools is a category gate with fallback to SATR rank 1, not a second ranker. W is updated after MNCD returns, so the next turn is not a cold start.

Diagram: `compare-aprr` — open /architecture in the laboratory.

_Repository: github.com/joyjeni/aprr-multi-agent-routing_

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
