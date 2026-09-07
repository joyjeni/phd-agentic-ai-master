# 37 Research Methodology — ToolBench walkthrough

*Research Methodology*

One ToolBench-schema datum, processed by all four objectives. RapidAPI is never GET. Numbers are a 07 September 2026 lab trace, not a metric claim.

- Intake. Bundled G1 jsonl qid=6491 is a RapidAPI aircraft query (gold docs 4308–4317). Off-sector flights are stripped. The ranking-library analogue walked here is tb.agri.soil_health with q = “What is the soil pH and recommended fertilizer dose for a farm village?”
- O1 SATR. Cold start so s=z(s_base). tb.agri.soil_health s_base=18.08 → s=5.40 (rank 1, ranking-only). karnataka::shc_karnataka s=1.40. datagov.fertilizer s=0.60 (live, rank 4).
- O2 APRR. Path agriculture_analyst → schema_planner (p=0.73) → retrieval_specialist (p=0.95). Non-Agriculture specialists fall back to SATR #1 = soil_health.
- O3 MNCD. Agent score s=0.45 score/(|score|+2)+0.35 overlap. soil_health 0.5995; tally=3·0.7407·0.5995=1.332. Not liveExecutable. preferredLiveToolId matches fertilizer → GET UUID 2e0e6c04-97f2-456b-9309-bf605650cb11 (44 live subsidy rows, e.g. 2002-03 Indigenous Urea 7790 Rs crore).
- O4 FCNP. 10 spans → keep 6 / drop 4; pin query + live fertilizer observation + citation. Memory written back to SATR.

_ToolBench = ranking library. Live evidence is always a verified data.gov.in Agriculture UUID._

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
