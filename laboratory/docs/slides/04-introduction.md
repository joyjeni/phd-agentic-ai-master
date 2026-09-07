# 04 Introduction

*Introduction*

This proposal treats multi-agent LLM systems as a computer-science systems problem: not a new foundation model, but a missing orchestration layer between session memory, specialist routing, live tools, and context growth.

Wang et al. survey LLM-based autonomous agents as a construction problem in Frontiers of Computer Science (2024, doi:10.1007/s11704-024-40231-1). He, Treude and Lo review LLM-based multi-agent systems for software engineering in ACM TOSEM (2025, doi:10.1145/3712003). Guo et al. survey LLM multi-agent profiling and communication at IJCAI-24 (doi:10.24963/ijcai.2024/890). Chang and Geng give transactional context management for multi-agent LLM planning in PVLDB 2025 (doi:10.14778/3750601.3750611).

Wu et al. introduce AutoGen as a conversation-driven programming framework in which agents exchange messages until a stopping condition (COLM 2024). Hong et al. encode Standard Operating Procedures into MetaGPT so that a software-company metaphor produces structured artefacts (ICLR 2024). Qian et al. organise ChatDev as a chat-chain of organisational roles (ACL 2024). Li et al. study communicative agents in CAMEL (NeurIPS 2023).

Tool use is a parallel line. Qin et al. release ToolLLM / ToolBench: 16k+ REST APIs, a DFSDT planner, and ToolEval (ICLR 2024). Zheng et al. add ToolRerank over ToolLLM candidates (LREC-COLING 2024). Learned routers (RouteLLM, MasRouter, PILOT) pick models or collaboration modes. LLMLingua shortens prompts by token importance (EMNLP 2023).

Those stacks still leave four operational surfaces underspecified as one contract: session–tool fusion, a training-free specialist posterior, fail-loud live Indian Open Government Data, and a mesh prune that writes a residue back into retrieval. The next slides record that literature as Evidence 1, Evidence 2, … in the FET template. Every Evidence block is a journal article or a top international conference paper.

ACRS is proposed as that missing layer. The integration order is SATR → APRR → MNCD → FCNP. The live demonstration corpus is Agriculture on data.gov.in. This deck does not claim a leaderboard number.

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
