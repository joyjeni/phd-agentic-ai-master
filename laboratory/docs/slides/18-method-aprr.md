# 18 Research Methodology — O2 APRR

*Research Methodology*

How the specialist posterior will be designed. No win-rate or millisecond target is claimed at proposal stage.

- Design method. Maintain a Dirichlet–Thompson posterior over named specialists. Sample or take the MAP specialist given SATR’s fused session.
- Allocation rule (proposal form). P(agent | context) ∝ W^α · η^β · ψ^γ, with W = session-matched specialist weight, η = reliability, ψ = cost/risk. Exponents are design knobs, not fitted claims.
- Training-free stance. Do not train a MasRouter- or RouteLLM-style classifier as the primary method. Learned routers remain a future bake-off class, not the implementation.
- What is being routed. Specialists in the ACRS mesh — not LLM SKUs (GPT-4 vs Mixtral) and not AutoGen conversation modes as the object of routing.
- Update rule. After MNCD returns verified or failed evidence, update η (and optionally W) so the next turn’s posterior is not identical to a cold start.
- Future evaluation protocol (not a result). Log specialist choice vs task type on held-out session traces; compare against a static role graph. No pre-committed accuracy.

Source of truth: `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
