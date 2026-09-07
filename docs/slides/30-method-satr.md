# 30 Research Methodology — O1 SATR

*Research Methodology*

How session-aware ranking will be designed. Computational retrieval scores are not part of this objective.

- Design method. Specify a fused session object: query + dialogue turns + last successful tool traces + co-activation counts. Rank tools with that object, not with the raw utterance alone.
- Ranking library. Use ToolBench / ToolLLM artefacts as a public tool-ranking library. RapidAPI-style traces are ranking evidence only and are never GET.
- Live Indian OGD is out of SATR’s path. Mandi and weather rows enter at MNCD. SATR must not invent or cache dummy AGMARKNET prices.
- Implementation path. Persist co-activation in a session store; expose a rank(query, session) API that APRR can call. Fail loud if the session schema is incomplete.
- Deliverable for the thesis chapter. Algorithm, schema, and the fusion rule. Comparison protocols, if any, are named later and are not this objective.

Diagram: `satr` — open /architecture in the laboratory.

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
