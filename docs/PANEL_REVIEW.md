# Mock panel review of ACRS and point-by-point response

Five reviewer roles were simulated to stress-test the thesis before the doctoral committee. Each concern is
answered with a change and the evidence file that supports it. Status: **Resolved** (change made and measured),
**Partly** (change made, external validation still needed), **Open** (planned, Year 3–4). Tally: 13 resolved, 4 partly, 2 open.

| # | Reviewer | Concern | Response / change | Evidence | Status |
|---|---|---|---|---|---|
| 1 | R1 IR | O1 gain came from test labels leaking into the co-occurrence graph (94/100 gold sets in training) | Leak-filtered protocol; leakage audit published; SATR v2 uses no training data | `results/leakage_audit.json` | Resolved |
| 2 | R1 IR | Hand-set weights; no held-out evaluation | 5-fold cross-validation; all O1 numbers held out; bootstrap CI | `results/o1_satr_v2.json` | Resolved |
| 3 | R1 IR | Gain may be specific to single-provider G1 sessions | Topic-switch and interleaved two-provider tests; SATR v2 still +0.045 NDCG@5 (CI +0.030 to +0.062) | `results/baselines_sensitivity.json` | Partly (G2/G3 pending) |
| 4 | R1 IR | No dense retriever baseline | LSA hybrid tested (hurts, reported); pretrained encoders blocked offline, enabled in notebook | `results/o1_satr_v2.json` | Partly |
| 5 | R2 ML theory | "(1 − 1/e) submodular" claim is false with coherence and redundancy terms | Claim withdrawn; Proposition 1 gives a counter-example; greedy treated as heuristic | `docs/THEORY.md` | Resolved |
| 6 | R2 ML theory | APRR regret guarantee for the risk-signed variant is asserted, not shown | Proposition 2: Õ(d√T) on optimistic rounds; no guarantee on pessimistic rounds (stated as a safety trade) | `docs/THEORY.md` | Resolved |
| 7 | R2 ML theory | No comparison with standard bandits | LinUCB and linear Thompson sampling baselines; APRR has lowest regret (0.079 vs 0.124 / 0.111) | `results/baselines_sensitivity.json` | Resolved |
| 8 | R3 Distributed systems | "Byzantine" used loosely; no adversary model | Adversary model and safety proof for b ≤ f, n ≥ 3f + 1 (Proposition 3); unit test | `docs/THEORY.md`, `tests/` | Resolved |
| 9 | R3 Distributed systems | With 3 peers, f = 0 — the quorum is vacuous | Acknowledged; width-4 experiment (f = 1): colluders at base rate 2.0 % vs 17.4 % majority | `results/o3_collude_w4.json` | Resolved |
| 10 | R3 Distributed systems | Simulator lets fabrications cite nothing — result is circular | Forged-citation and colluding-fabricator adversaries added | `results/o3_forge.json`, `o3_collude.json` | Resolved |
| 11 | R3 Distributed systems | 21 % abstention is a usability cost | θ/κ sensitivity gives the error–abstention frontier; fallback routing planned | `results/baselines_sensitivity.json` | Partly |
| 12 | R4 Systems/SE | Three diverging implementations; inconsistent acronyms | `paim` is canonical; README and deck aligned; old deck versions still to be moved to an archive folder | repo | Partly |
| 13 | R4 Systems/SE | Not reproducible by a third party | `Makefile`, `requirements.txt`, CI workflow, seeds, CITATION, MIT licence, Colab notebook | repo root | Resolved |
| 14 | R4 Systems/SE | O4 compared only with a fixed ratio | Baselines: no pruning, recency truncation, fixed 30/50/70 %; floor sweep 0.6–0.9 | `results/baselines_sensitivity.json` | Resolved |
| 15 | R4 Systems/SE | "PID" controller has no derivative term | Renamed PI in theory and slides; registered title noted | `docs/THEORY.md` | Resolved |
| 16 | R5 Methodology | Is n = 100 sessions enough? | Power analysis: O1 power 0.99 (d_z = 0.44), MDE 0.044 NDCG@5; O3 power 1.0; sessions needed for smaller effects reported | `results/power_analysis.json` | Resolved (internal validity) |
| 17 | R5 Methodology | All agents are simulated — external validity | Stated as main threat; real open-weight LLM agents scheduled (Year 3) | `docs/THESIS_PLAN.md` | Open |
| 18 | R5 Methodology | Single benchmark | ToolBench G2/G3 (Tool-COLT/ToolBenchG2 on HF), ToolRet, live AGMARKNET case study planned | `docs/THESIS_PLAN.md` | Open |
| 19 | R5 Methodology | Multiple comparisons across many configurations | Headline claims limited to one pre-declared comparison per objective; others reported as exploratory | `experiments/RESULTS.md` | Resolved |
