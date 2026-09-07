# 11 Literature Review — Evidence 13 & Evidence 14

*Literature Review*

Continuation. Evidence 13 & Evidence 14 in the same Evidence template.

**Evidence 13**

- Author(s): Panda, P., Magazine, R., Devaguptapu, C., Takemori, S., and Sharma, V.
- Year: 2025
- Title: Adaptive LLM Routing under Budget Constraints
- Publication: Findings of the Association for Computational Linguistics: EMNLP 2025, pages 23934–23949. doi:10.18653/v1/2025.findings-emnlp.1301. Method name: PILOT (Preference-prior Informed LinUCB).
- Objective: Treat LLM routing as a contextual bandit under a user budget.
- Methodology: Preference-prior LinUCB in a shared query–LLM embedding space, plus an online cost policy.
- Findings: Bandit routing can adapt without exhaustive inference of every LLM on every query.
- Limitations: Routes foundation-model SKUs under a dollar budget, not tool-specialist agents after a live data.gov.in GET.
- To solve the research gap: O2 APRR — specialist hops after SATR, updated from live MNCD outcomes, not SKU bandits under a dollar budget.

**Evidence 14**

- Author(s): Jiang, H., Wu, Q., Lin, C.-Y., Yang, Y., and Qiu, L.
- Year: 2023
- Title: LLMLingua: Compressing Prompts for Accelerated Inference of Large Language Models
- Publication: Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing, pages 13358–13376. doi:10.18653/v1/2023.emnlp-main.825
- Objective: Shorten long prompts while keeping task performance.
- Methodology: Budget controller plus token-level iterative compression aligned to the target LLM.
- Findings: Token-importance compression can reduce prompt length with limited quality loss.
- Limitations: Deletes tokens before the LLM. It does not prune a mesh by conductance or write live citations back into retrieval.
- To solve the research gap: O4 FCNP — prune the mesh by conductance and pin live citations into SATR, not token deletion.

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
