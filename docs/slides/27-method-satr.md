# 27 Research Methodology — O1 SATR

*Research Methodology*

How session-aware ranking will be designed and later evaluated.

- Design method. Specify a fused session object: query + dialogue turns + last tool traces + co-activation counts. Rank tools with that object, not with the raw utterance alone.
- Ranking library (not live prices). Use ToolBench / ToolLLM artefacts as a public tool-ranking library and protocol family. RapidAPI-style traces are ranking evidence only.
- Live Indian OGD is out of SATR’s ranking path. Mandi and weather rows enter at MNCD. SATR must not invent or cache dummy AGMARKNET prices.
- Implementation path. Persist co-activation in a session store; expose a rank(query, session) API that APRR can call. Fail loud if the session schema is incomplete.
- Future evaluation protocol (not a result). When the protocol is frozen, compare session-fused ranking against query-only ranking on the same ToolBench-style split. Report the protocol, not a pre-committed score.
- Deliverable for the thesis chapter. Algorithm, schema, and ablation plan (with vs without tool-trace fusion).

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
