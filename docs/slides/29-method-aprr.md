# 29 Research Methodology — O2 APRR

*Research Methodology*

How specialist hops will be designed. Computational routing scores are not part of this objective.

- Design method. Maintain an affinity matrix W over named specialists. Sample the next hop from the normalised product of affinity, pairwise similarity, and query fit.
- Allocation rule. P(a_j | a_i, q) ∝ W_ij^α · η_ij^β · ψ_j(q)^γ. Exponents are design knobs, not fitted claims.
- Training-free stance. Do not train a MasRouter- or RouteLLM-style classifier as the primary method. Learned routers remain a later comparison class, not this objective.
- What is being routed. Specialists in the ACRS mesh — not LLM SKUs and not AutoGen conversation modes.
- Update rule. After MNCD returns verified or failed evidence, update W so the next turn’s path is not identical to a cold start.
- Deliverable for the thesis chapter. Sampling rule, agent set, assignment gate, and the delayed W update. No routing score is part of this objective.

Diagram: `aprr` — open /architecture in the laboratory.

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
