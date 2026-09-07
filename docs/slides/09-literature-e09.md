# 09 Literature Review — Evidence 9 & Evidence 10

*Literature Review*

Continuation. Evidence 9 & Evidence 10 in the same Evidence template.

**Evidence 9**

- Author(s): Qin, Y., Liang, S., Ye, Y., Zhu, K., Yan, L., Lu, Y., Lin, Y., Cong, X., Tang, X., Qian, B., Zhao, S., Hong, L., Tian, R., Xie, R., Zhou, J., Gerstein, M., Li, D., Liu, Z., and Sun, M.
- Year: 2024
- Title: ToolLLM: Facilitating Large Language Models to Master 16000+ Real-world APIs
- Publication: ICLR 2024
- Objective: Give open LLMs general tool-use over a large real-world API catalogue.
- Methodology: ToolBench: 16,464 RapidAPI REST endpoints; SBERT retriever; DFSDT planner; ToolEval protocol.
- Findings: A public ranking library and planner exist for large-scale tool use.
- Limitations: Retrieval is turn-amnesic. RapidAPI keys are not redistributable, so this lab cannot execute ToolBench endpoints live.
- To solve the research gap: O1 SATR uses ToolBench as a ranking library only. O3 MNCD executes live Indian OGD, never RapidAPI replay.

**Evidence 10**

- Author(s): Zheng, Y., Li, P., Liu, W., Liu, Y., Luan, J., and Wang, B.
- Year: 2024
- Title: ToolRerank: Adaptive and Hierarchy-Aware Reranking for Tool Retrieval
- Publication: LREC-COLING 2024, pages 16263–16273. ACL Anthology 2024.lrec-main.1413
- Objective: Refine ToolLLM-style retrieval for seen versus unseen APIs and for tool-library hierarchy.
- Methodology: Adaptive truncation of seen/unseen APIs plus hierarchy-aware concentration or diversity.
- Findings: Reranking the SBERT shortlist improves downstream tool execution quality.
- Limitations: Still query-only. Session co-activation and later write-back from a pruned mesh are unused.
- To solve the research gap: O1 SATR — fuse co-activation after ToolRerank-style truncation. O4 FCNP writes the residue back.

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
