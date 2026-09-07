# 08 Literature Review — Evidence 5 & Evidence 6

*Literature Review*

Continuation. Evidence 5 & Evidence 6 in the same Evidence template.

**Evidence 5**

- Author(s): Wu, Q., Bansal, G., Zhang, J., Wu, Y., Li, B., Zhu, E., Jiang, L., Zhang, X., Zhang, S., Liu, J., Awadallah, A. H., White, R. W., Burger, D., and Wang, C.
- Year: 2024
- Title: AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversations
- Publication: Proceedings of the First Conference on Language Modeling (COLM 2024)
- Objective: Program LLM applications by composing multiple conversable agents.
- Methodology: Agents exchange natural-language messages until a stopping condition; modes mix LLMs, humans, and tools.
- Findings: Conversation is a working programming model for multi-agent LLM applications.
- Limitations: The unit of coordination is a chat message, not a live (toolId, score, citation) on Indian Open Government Data.
- To solve the research gap: O3 MNCD — gossip (toolId, score), score-sum consensus, then a fail-loud live data.gov.in GET.

**Evidence 6**

- Author(s): Hong, S., Zhuge, M., Chen, J., Zheng, X., Cheng, Y., Wang, J., Zhang, C., Wang, Z., Yau, S. K. S., Lin, Z., Zhou, L., Ran, C., Xiao, L., Wu, C., and Schmidhuber, J.
- Year: 2024
- Title: MetaGPT: Meta Programming for A Multi-Agent Collaborative Framework
- Publication: Proceedings of the Twelfth International Conference on Learning Representations (ICLR 2024)
- Objective: Reduce role drift in multi-agent software workflows by encoding human SOPs.
- Methodology: Standard Operating Procedures are written into prompt sequences; an assembly-line assigns roles.
- Findings: Authored SOPs produce more coherent software artefacts than unconstrained chat agents.
- Limitations: Who speaks next is designed in advance. The graph is not updated from session-local affinity after a live tool call.
- To solve the research gap: O2 APRR — training-free specialist posterior updated after live outcomes, not an authored SOP graph.

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
