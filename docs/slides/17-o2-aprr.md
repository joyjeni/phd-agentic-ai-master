# 17 Objective 2 — APRR

*Research Objectives*

The routing chapter: a training-free posterior over tool-specialist agents, updated from SATR scores and from live MNCD observations. The unit of publication is the Bayesian controller, not a Pareto chart.

SOTA. Yue et al., MasRouter (ACL 2025, doi:10.18653/v1/2025.acl-long.757): trained neural controller over multi-agent topologies. Ong et al., RouteLLM (ICLR 2025, arXiv:2406.18665): routers among LLMs. Panda et al., Adaptive LLM Routing under Budget Constraints (PILOT; Findings of EMNLP 2025, doi:10.18653/v1/2025.findings-emnlp.1301): preference-prior LinUCB for budget-constrained LLM routing. Hong et al., MetaGPT (ICLR 2024): authored SOP workflows. Pipeline: query → trained controller or difficulty model → choose one LLM/agent → execute

Gap. SOTA either trains a neural router, picks a model, or follows an authored SOP. It does not maintain a training-free affinity matrix over Indian OGD tool families.

Novelty. Training-free online W versus MasRouter's learned controller. Implemented update is κ·reward·1/L²·1/lat_norm with negative reward on failure. CTGR and FTDR remain in the GitHub repo; this lab runs core APRR hops. W is session state, so routing can adapt across farmer turns.

Diagram: `compare-aprr` — open /architecture in the laboratory.

_Repository: github.com/joyjeni/aprr-multi-agent-routing_

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
