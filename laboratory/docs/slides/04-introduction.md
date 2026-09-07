# 04 Introduction

*Introduction*

This proposal treats multi-agent LLM systems as a computer-science systems problem: not a new foundation model, but a missing orchestration layer between session memory, specialist routing, live tools, and context growth.

Wu et al. introduce AutoGen as a conversation-driven programming framework in which agents exchange messages until a stopping condition (ICLR 2024 LLM Agents Workshop; COLM 2024, arXiv:2308.08155). Hong et al. encode Standard Operating Procedures into MetaGPT so that a software-company metaphor produces structured artefacts (ICLR 2024). Qian et al. organise ChatDev as a chat-chain of organisational roles (ACL 2024). Li et al. study communicative agents in CAMEL (NeurIPS 2023).

Tool use is a parallel line. Qin et al. release ToolLLM / ToolBench: 16k+ REST APIs, a DFSDT planner, and ToolEval (ICLR 2024). Zheng et al. add ToolRerank over ToolLLM candidates (LREC-COLING 2024). Learned routers (RouteLLM, MasRouter, PILOT) pick models or collaboration modes. LLMLingua shortens prompts by token importance (EMNLP 2023).

Those stacks still leave four operational surfaces underspecified as one contract: session–tool fusion, a training-free specialist posterior, fail-loud live Indian Open Government Data, and a mesh prune that writes a residue back into retrieval. The next slides record that literature as Evidence 1, Evidence 2, … in the FET template.

ACRS is proposed as that missing layer. The integration order is SATR → APRR → MNCD → FCNP. The live demonstration corpus is Agriculture on data.gov.in. This deck does not claim a leaderboard number.

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
