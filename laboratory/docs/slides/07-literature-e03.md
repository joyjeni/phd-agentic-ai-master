# 07 Literature Review — Evidence 3 & Evidence 4

*Literature Review*

Continuation. Evidence 3 & Evidence 4 in the same Evidence template.

**Evidence 3**

- Author(s): Guo, T., Chen, X., Wang, Y., Chang, R., Pei, S., Chawla, N. V., Wiest, O., and Zhang, X.
- Year: 2024
- Title: Large Language Model based Multi-Agents: A Survey of Progress and Challenges
- Publication: Proceedings of the Thirty-Third International Joint Conference on Artificial Intelligence (IJCAI-24), Survey Track, pages 8048–8057. [doi:10.24963/ijcai.2024/890](https://doi.org/10.24963/ijcai.2024/890)
- DOI: https://doi.org/10.24963/ijcai.2024/890
- URL: https://doi.org/10.24963/ijcai.2024/890
- Objective: Survey how LLM-based multi-agent systems are profiled, how they communicate, and how their capacities grow.
- Methodology: IJCAI survey track: domains and environments, agent profiling, communication mechanisms, and capacity-growth methods.
- Findings: Published MAS work clusters on conversation, role profiles, and simulated worlds; live tool-identifier consensus is not the unit of analysis.
- Limitations: Communication is reviewed as natural-language exchange. There is no fail-loud live Open Government Data GET as the coordination object.
- To solve the research gap: O3 MNCD — gossip (toolId, score), score-sum consensus, then a fail-loud live data.gov.in GET.

**Evidence 4**

- Author(s): Chang, E. Y., and Geng, L.
- Year: 2025
- Title: SagaLLM: Context Management, Validation, and Transaction Guarantees for Multi-Agent LLM Planning
- Publication: Proceedings of the VLDB Endowment (PVLDB), 18(12):4874–4886, 2025. [doi:10.14778/3750601.3750611](https://doi.org/10.14778/3750601.3750611)
- DOI: https://doi.org/10.14778/3750601.3750611
- URL: https://doi.org/10.14778/3750601.3750611
- Objective: Give multi-agent LLM planners persistent context, validation, and compensable transactions.
- Methodology: Saga-style checkpointing and compensation around multi-LLM planning, with independent validators and state tracking.
- Findings: Transactional context management can recover multi-agent plans from disruption better than unconstrained chat loops.
- Limitations: Orchestration is a planning/transaction runtime. It does not maintain a training-free specialist posterior over Indian OGD tool families, nor cite a ministry UUID.
- To solve the research gap: O2 APRR plus O3 MNCD — training-free specialist hops, then a verified Agriculture UUID rather than a compensable software saga.

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
