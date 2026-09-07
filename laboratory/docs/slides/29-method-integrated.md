# 29 Research Methodology — integrated loop

*Research Methodology*

Closed contract SATR → APRR → MNCD → FCNP → SATR. The novelty is the loop and the data contract, not a claimed accuracy.

- Closed-loop protocol. One user turn must traverse all four modules in order. Skipping MNCD (no live UUID) or FCNP (no write-back) is treated as an incomplete run, not a successful demo.
- Two evidence regimes. (1) ToolBench-style ranking traces for SATR. (2) Live data.gov.in Agriculture rows for MNCD. Do not mix dummy prices into (1) or RapidAPI tools into (2).
- Independent variables (future experiments). Session fusion on/off; Dirichlet routing vs static roles; score-sum vs majority; FCNP write-back on/off.
- Dependent measures (to be frozen later). Citation completeness, fail-loud correctness, rank stability across turns, qualitative specialist-choice logs.
- Domain lock. Agriculture on Indian OGD for the live path. Other sectors are out of scope until a later amendment.
- Ethics / data. Public government catalogues only; no personal data; API keys stay in the environment, never in the thesis text.

Diagram: `integrated` — open /architecture in the laboratory.

_Master repository: github.com/joyjeni/phd-agentic-ai-master_

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
