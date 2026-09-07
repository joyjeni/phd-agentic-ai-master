# 21 Research Objectives — overall

*Research Objectives*

To design and implement Adaptive Context Reasoning System (ACRS) as a closed structural orchestration layer in which SATR (Session-Aware Tool Retrieval), training-free specialist routing (APRR), mesh consensus over tool identifiers (MNCD), and flow-coupled context pruning with write-back (FCNP) execute in that order on one user turn, using live Indian Open Government Data as the only execution corpus. The proposal-stage claim is architectural completeness and live-pipeline integrity — that the four modules form one fail-loud loop — not a retrieval, routing, consensus, or compression score.

- Live execution is Agriculture on verified data.gov.in resource UUIDs only.
- ToolBench / ToolLLM artefacts are a ranking library and protocol family, not an execution corpus. RapidAPI endpoints are never GET.
- SATR is not a new language model. MNCD is not a crop-yield predictor. FCNP is not a tokeniser.
- Skipping MNCD (no live UUID) or FCNP (no write-back) is an incomplete run, not a successful demonstration.

_Source: docs/RESEARCH_OBJECTIVES.md (canonical: lib/research/objectives.ts)._

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
