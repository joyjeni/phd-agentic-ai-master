# 38 Research Methodology — data.gov.in walkthrough

*Research Methodology*

The same four objectives on live AGMARKNET. Query: “What is the current mandi price of wheat in Punjab?” Fail-loud: no invented Punjab-wheat modal.

- Intake. extractToolArguments → state=Punjab, commodity=Wheat. preferredLiveToolId → datagov.mandi_prices (UUID 9ef84268-d588-465a-a308-a864a43d0070). Limit capped at 10 000.
- O1 SATR. karnataka::agmarknet_ka s=3.73 (rank 1, same UUID); datagov.mandi_prices s=3.05 (rank 2, preferred); datagov.msp s=2.31 (ranking-only).
- O2 APRR. Path agriculture_analyst → schema_planner (p=0.54) → tool_executor (p=0.66, terminal stop). Hop 0: Karnataka mandi, national mandi, MSP. Hop 2 live leftover: crop_production.
- O3 MNCD. mandi_prices agent-score 0.787 (liveBoost 0.45); karnataka 0.7789. Score-sum winner karnataka::agmarknet_ka tally=1.154. Live GET: 10 000 arrivals; 0 Wheat in Punjab today; 479 other live Punjab rows; Wheat in 133 live rows from MP, Rajasthan, UP, Gujarat, Maharashtra, West Bengal, Chhattisgarh. Shown mean modal Rs 2593/quintal (e.g. Bhindi, Dera Baba Nanak APMC, Rs 828, 07/09/2026).
- O4 FCNP. 10 spans → keep 7; pin the AGMARKNET citation. W ← (1-λ)W + κ·1/L²/lat on the hop path. Next SATR is session-conditioned.

_Lab trace 07 September 2026. Re-run on /walkthrough; rows change daily. No dummy prices._

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
