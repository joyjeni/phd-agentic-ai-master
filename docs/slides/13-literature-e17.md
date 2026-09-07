# 13 Literature Review — Evidence 17 & Evidence 18

*Literature Review*

Continuation. Evidence 17 & Evidence 18 in the same Evidence template.

**Evidence 17**

- Author(s): Guo, H., Woodruff, A., and Yadav, A.
- Year: 2020
- Title: Improving Lives of Indebted Farmers Using Deep Learning: Predicting Agricultural Produce Prices Using Convolutional Neural Networks (PECAD)
- Publication: AAAI 2020. doi:10.1609/aaai.v34i08.7039
- Objective: Use AGMARKNET price series as decision-support input for indebted farmers.
- Methodology: Convolutional networks over scraped agricultural produce prices.
- Findings: AGMARKNET is a real Indian decision-support corpus, not a toy table.
- Limitations: A crop-price CNN is not a multi-agent live-OGD loop. Cited as domain precedent, not as a baseline to beat.
- To solve the research gap: O3 MNCD — live AGMARKNET UUID as a citation. PECAD is domain precedent, not a baseline to beat.

**Evidence 18**

- Author(s): Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K., and Cao, Y.
- Year: 2023
- Title: ReAct: Synergizing Reasoning and Acting in Language Models
- Publication: ICLR 2023
- Objective: Interleave reasoning traces with actions so a language model can use tools.
- Methodology: Thought–action–observation cycles on the already-chosen tool set.
- Findings: Reasoning-and-acting beats reason-only or act-only prompting on several agent tasks.
- Limitations: Assumes the tool set is already determined. It does not fuse session co-activation into the next rank, nor cite a live data.gov.in UUID.
- To solve the research gap: O1 SATR — choose the tool set from session memory before any ReAct-style acting. O3 MNCD cites the UUID.

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
