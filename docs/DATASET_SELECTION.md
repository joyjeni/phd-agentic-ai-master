# Dataset selection (v3)

Rule: **one public-problem dataset that all four objectives run on together, plus standard benchmarks for comparability.**
A thesis evaluated only on a simulator, or only on a bespoke dataset, fails review on one side or the other.

## Primary: KCC-Sessions (the public problem)

| | |
|---|---|
| Problem | Farmers call Kisan Call Centres (1800-180-1551) for weather, pest, nutrient, market, variety and scheme advice. 35.22 lakh calls were received and 33.53 lakh answered in 2022-23 (Lok Sabha reply, 2023). The Ministry has announced chatbot and AI/ML decision-support upgrades. Kisan e-Mitra handles about 13,000 PM-KISAN queries a day and is being extended to PMFBY, KCC and Soil Health Card. |
| Data | **KCC transcripts**: real queries with expert answers (ICAR-IASRI KCC Chakshu, 2006–2022; also listed on data.gov.in and IndiaAI AIKosh). The download used is a 1.0M-row 2023 export with the official 11-field schema on Hugging Face (`Omegaindebt/Kisan_Call_Centre_Transcripts`). |
| Loader | `paim.data.kcc` (CSV, CSV.gz or parquet) |
| Gold for O1 | KCC's own `QueryType`, mapped once to the service that answers it (`QUERY_TYPE_TOOLS`, a reviewable table, not a learned label) |
| Sessions | pseudo-sessions: one block, one day, one crop, in time order (KCC has no caller id) |
| Risk class | from `QueryType`: agronomic-dose and entitlement queries are recommend-only |
| Distractors | `--distractors` adds the 10,439 ToolBench endpoints, so retrieval is non-trivial |
| Tools | 3 live data.gov.in resources (AGMARKNET mandi prices, crop production, IMD rainfall) and 8 national services as typed specs (`live=False`, simulated) |
| Why examiners accept it | real users, real queries, government expert answers as reference, multilingual (Hindi, Tamil, ...), and a buyer that exists |

**Known limitations, stated in the thesis:**
- `QueryType` label noise (for example, a weather question filed under Post Harvest Preservation). It is used as recorded and its rate is measured on a hand-checked sample.
- Pseudo-sessions are not true caller sessions.
- Most services are simulated until API access is granted.
- The mirror's licence should be confirmed against the original government release (GODL-India) before redistribution. The repository ships only the loader, not the data.

## Comparability: ToolBench-Sessions G1 (already in the repo)

The ToolBench G1 retrieval split (10,439 endpoints, 100 queries, 174 sub-goals), sessionised and label-preserving, with the leakage audit. This keeps every v1/v2 number comparable.

## External validity (next runs, in order of value)

| Benchmark | Tests | Objective | Status |
|---|---|---|---|
| **ToolRet** (Shi et al., 2025; 7.6k tasks, 43k tools; `mangopy/ToolRet-*` on HF) | heterogeneous tool retrieval at scale | O1 | loader to add; addresses "one benchmark" |
| **StableToolBench** (Guo et al., ACL Findings 2024) | stable virtual-API execution of ToolBench tasks | O2, O3 with real LLM agents | planned |
| **AgentDojo** (Debenedetti et al., NeurIPS D&B 2024) | indirect prompt injection against tool agents | G1 guard + R-COMMIT-01 | planned; replaces the simulated attack |
| **τ-bench** (Yao et al., 2024) | policy-following tool agents, pass^k | G1 policy layer, reliability | planned |
| **BFCL v3** multi-turn | function-calling accuracy, multi-turn | O1/O2 | optional |

Scale target for the certified-execution claim: certifying α = 2% at δ = 0.05 needs ≥ 149 executed sub-goals per calibration split, and ToolBench G1 has only 87. KCC-Sessions (thousands of sub-goals) is where that claim is made.
