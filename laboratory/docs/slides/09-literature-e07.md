# 09 Literature Review — Evidence 7 & Evidence 8

*Literature Review*

Continuation. Evidence 7 & Evidence 8 in the same Evidence template.

**Evidence 7**

- Author(s): Qian, C., Liu, W., Liu, H., Chen, N., Dang, Y., Li, J., Yang, C., Chen, W., Su, Y., Cong, X., Xu, J., Li, D., Liu, Z., and Sun, M.
- Year: 2024
- Title: ChatDev: Communicative Agents for Software Development
- Publication: Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 15174–15186. doi:10.18653/v1/2024.acl-long.810
- Objective: Organise specialised LLM agents as a chat-chain for software design, coding, and testing.
- Methodology: Chat chain (what to communicate) plus communicative dehallucination (how to communicate).
- Findings: Natural-language design talk and code-level debug talk can be unified in one multi-agent loop.
- Limitations: The environment is a codebase, not a ministry API with a fail-loud live GET.
- To solve the research gap: O3 MNCD — the environment is a verified ministry UUID; empty filters fail loud instead of inventing rows.

**Evidence 8**

- Author(s): Li, G., Hammoud, H. A. A. K., Itani, H., Khizbullin, D., and Ghanem, B.
- Year: 2023
- Title: CAMEL: Communicative Agents for “Mind” Exploration of Large Language Model Society
- Publication: Advances in Neural Information Processing Systems 36 (NeurIPS 2023)
- Objective: Enable autonomous cooperation among communicative agents with minimal human steering.
- Methodology: Role-playing with inception prompting to keep agents on a human-specified task.
- Findings: Inception prompting yields scalable multi-agent conversational data and cooperative behaviour.
- Limitations: No first-class vote over tool identifiers backed by Open Government Data.
- To solve the research gap: O3 MNCD — the vote object is a tool identifier backed by Open Government Data, not a role-play utterance.

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
