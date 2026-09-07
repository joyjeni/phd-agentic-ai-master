# 09 Literature Review — Evidence 9 & Evidence 10

*Literature Review*

Continuation. Evidence 9 & Evidence 10 in the same Evidence template.

**Evidence 9**

- Author(s): Panda, P., Magazine, R., Devaguptapu, C., Takemori, S., and Sharma, V.
- Year: 2025
- Title: Adaptive LLM Routing under Budget Constraints
- Publication: Findings of the Association for Computational Linguistics: EMNLP 2025, pages 23934–23949. doi:10.18653/v1/2025.findings-emnlp.1301. Method name: PILOT (Preference-prior Informed LinUCB).
- Objective: Treat LLM routing as a contextual bandit under a user budget.
- Methodology: Preference-prior LinUCB in a shared query–LLM embedding space, plus an online cost policy.
- Findings: Bandit routing can adapt without exhaustive inference of every LLM on every query.
- Limitations: Routes foundation-model SKUs under a dollar budget, not tool-specialist agents after a live data.gov.in GET.

**Evidence 10**

- Author(s): Jiang, H., Wu, Q., Lin, C.-Y., Yang, Y., and Qiu, L.
- Year: 2023
- Title: LLMLingua: Compressing Prompts for Accelerated Inference of Large Language Models
- Publication: EMNLP 2023, pages 13358–13376. doi:10.18653/v1/2023.emnlp-main.825
- Objective: Shorten long prompts while keeping task performance.
- Methodology: Budget controller plus token-level iterative compression aligned to the target LLM.
- Findings: Token-importance compression can reduce prompt length with limited quality loss.
- Limitations: Deletes tokens before the LLM. It does not prune a mesh by conductance or write live citations back into retrieval.

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
