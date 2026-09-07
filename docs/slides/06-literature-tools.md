# 06 Literature Review — tools, routing, and compression

*Literature Review*

Tool learning, learned routers, and prompt compression are real literatures. They are not substitutes for the four ACRS modules.

Qin et al., ToolLLM / ToolBench (ICLR 2024): SBERT API retriever, DFSDT planner, ToolEval. Zheng et al., ToolRerank (LREC-COLING 2024): contrastive rerank of ToolLLM candidates. Gap: both are turn-amnesic; they do not fuse which tools actually fired into the next rank.

Ong et al., RouteLLM (2024); Yue et al., MasRouter (ACL 2025); Panda et al., PILOT (Findings of EMNLP 2025): learned or bandit routers over LLM SKUs or collaboration modes. Gap: they do not maintain a training-free Dirichlet–Thompson posterior over named tool specialists.

Jiang et al., LLMLingua (EMNLP 2023): token-importance prompt compression. Gap: compression does not prune a mesh by conductance or write a residue back into retrieval.

Guo, Woodruff & Yadav, PECAD (AAAI 2020): AGMARKNET as a decision-support input for price prediction. Gap: a crop-yield / price CNN is not a multi-agent live-OGD loop. Cited as domain precedent, not as a baseline to beat.

Source of truth: `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
