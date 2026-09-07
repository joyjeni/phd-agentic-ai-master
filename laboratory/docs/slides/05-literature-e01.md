# 05 Literature Review

*Literature Review*

FET template. Each paper is one Evidence block: Author(s), Year, Title, Publication, Objective, Methodology, Findings, Limitations.

**Evidence 1**

- Author(s): Wu, Q., Bansal, G., Zhang, J., Wu, Y., Li, B., Zhu, E., Jiang, L., Zhang, X., Zhang, S., Liu, J., Awadallah, A. H., White, R. W., Burger, D., and Wang, C.
- Year: 2024
- Title: AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversations
- Publication: Conference on Language Modeling (COLM) 2024; ICLR 2024 Workshop on LLM Agents (Best Paper). arXiv:2308.08155
- Objective: Program LLM applications by composing multiple conversable agents.
- Methodology: Agents exchange natural-language messages until a stopping condition; modes mix LLMs, humans, and tools.
- Findings: Conversation is a working programming model for multi-agent LLM applications.
- Limitations: The unit of coordination is a chat message, not a live (toolId, score, citation) on Indian Open Government Data.

**Evidence 2**

- Author(s): Hong, S., Zhuge, M., Chen, J., Zheng, X., Cheng, Y., Wang, J., Zhang, C., Wang, Z., Yau, S. K. S., Lin, Z., Zhou, L., Ran, C., Xiao, L., Wu, C., and Schmidhuber, J.
- Year: 2024
- Title: MetaGPT: Meta Programming for A Multi-Agent Collaborative Framework
- Publication: ICLR 2024
- Objective: Reduce role drift in multi-agent software workflows by encoding human SOPs.
- Methodology: Standard Operating Procedures are written into prompt sequences; an assembly-line assigns roles.
- Findings: Authored SOPs produce more coherent software artefacts than unconstrained chat agents.
- Limitations: Who speaks next is designed in advance. The graph is not updated from session-local affinity after a live tool call.

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
