# 18 Identified Research Problem

*Identified Research Problem*

Five architectural gaps. Four named objectives. One integration contract. The previous slide maps each gap onto the module that closes it. Closing a gap is evidenced by a runnable loop and citable equations, not by a promised leaderboard number.

- G1 — Turn-amnesic retrieval. ToolLLM SBERT (Qin et al., ICLR 2024) and ToolRerank (Zheng et al., LREC-COLING 2024) score each query independently. Session co-activation is unused. → Objective 1 SATR.
- G2 — Routers pick models or authored SOPs, not tool-specialist agents with a training-free posterior. RouteLLM / PILOT / MasRouter / MetaGPT. → Objective 2 APRR.
- G3 — MAS communication is star, SOP, or chat. No mesh vote whose object is a live tool identifier. AutoGen, MetaGPT, ChatDev, CAMEL. → Objective 3 MNCD.
- G4 — Prompt compressors (LLMLingua, EMNLP 2023) do not write live citations back into retrieval. → Objective 4 FCNP.
- G5 — No closed four-stage contract executed on journal-publishable Indian OGD (data.gov.in / AGMARKNET / IMD / DES), with ToolBench used only as a ranking library. → Integrated ACRS.

_Gaps are architectural. This deck does not convert them into NDCG, latency, or accuracy targets._

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
