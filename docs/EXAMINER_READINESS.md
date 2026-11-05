# Examiner readiness (MSRUAS regulations, IISc-calibre review)

## What the regulations require (MSRUAS PhD Regulations 2022, amendments for the 2023 batch)

| Clause | Requirement | Status |
|---|---|---|
| D.2.1 / D.4.10 | "significant and original contributions" | the four contributions in `PUBLICATION_PLAN.md`; claims in `THEORY.md` |
| D.5.1 | ≥ 16 credits; PRP reviews 1–6 passed | track with the supervisor |
| D.8.4 | ≥ 2 refereed journal papers and ≥ 2 reputed conference presentations (in person) | J1, J3 + 2 conferences planned |
| D.8.4 | similarity index < 10% | run the plagiarism check on each chapter as it is written; never paste text from cited papers |
| D.8.5 | three examiners: supervisor, one Indian external, one overseas external; all three must be satisfactory | assume an IISc-level Indian examiner and a foreign IR/MAS examiner |

## Questions an IISc-calibre examiner will ask, and where the answer lives

| Question | Answer location |
|---|---|
| Is this just engineering glue? | Contribution 1 is a statistical guarantee (`governance/conformal.py`, `test_learn_then_test_controls_risk_on_fresh_data`); contribution 2 is a measured failure mode of voting (`integrated_eval.py` §B) |
| Why should I believe simulated agents? | Simulation tests mechanisms; the LLM-agent run on StableToolBench/AgentDojo is the stated next stage. Every table says "simulated". |
| Are your thresholds tuned on test data? | No. θ\* comes from the calibration half; risk is reported on the held-out half (§C). O1 uses 5-fold CV. The leakage audit removes 94/100 leaked gold sets. |
| Is n large enough? | `power_analysis.py` covers O1. For certified execution, the n ≥ log δ / log(1−α) bound is printed, and ToolBench fails it at α = 2%, which is why KCC is the primary dataset. |
| Which decisions does the AI take, and who is accountable? | `ACRS_STAGES` table; `AGENTIC_DESIGN_METHOD.md` §2–3 |
| What happens when a component fails? | fail closed (REVIEW), tested; stage failure rate reported in every table |
| Can it be shut off? Can you prove what it decided? | kill switch (tested); hash-chained decision log (`DecisionLog.verify`) |
| Real public value? | KCC-Sessions; `PRODUCT_BRIEF.md` |
| Reproducible? | `make all`; `experiments/ACRS_v3_gpu.ipynb` on a free T4; pinned manifest digest in every results JSON |

## Remaining gaps (be first to say them)

1. Real LLM agents (open-weight, on a T4/L4) replacing the simulator for O2/O3.
2. AgentDojo instead of the in-house attack harness.
3. A label-noise audit of KCC `QueryType` on about 500 hand-checked rows.
4. Answer faithfulness against `KccAns`: a multilingual judge, validated against human ratings.
5. Live APIs beyond AGMARKNET (IMD, Soil Health Card), which need access requests.
