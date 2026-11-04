# Thesis plan: contributions, claims, evidence

**Thesis statement.** Grounding signals that persist across turns — the API providers a session has used, the
evidence an agent can cite, and the context that survives pruning — make multi-agent tool use measurably more
accurate, cheaper and safer than per-turn optimisation, provided each signal is protected by an explicit
guarantee or abstention rule.

## Contributions (each is falsifiable and has a named experiment)

| # | Contribution | Type | Evidence (file) | Status |
|---|---|---|---|---|
| C1 | Leakage audit of sessionised ToolBench G1 (94/100 test gold sets in training trajectories) and a leak-free protocol | Benchmark / methodology | `results/leakage_audit.json` | Done |
| C2 | SATR v2: session provider memory + provider coherence; training-free, leak-proof | Algorithm (O1) | `results/o1_satr_v2.json`, `results/baselines_sensitivity.json` (interleaved) | Done in simulation |
| C3 | APRR: signed-posture contextual bandit with escalation; regret bound on optimistic rounds (Prop. 2) | Algorithm + theory (O2) | `docs/THEORY.md`, `results/baselines_sensitivity.json` | Theory done; real-LLM run pending |
| C4 | MNCD: evidence-weighted quorum with abstention; safety for b ≤ f, n ≥ 3f+1 (Prop. 3) | Algorithm + theory (O3) | `results/o3_forge.json`, `o3_collude*.json` | Done in simulation |
| C5 | FCNP: typed-block pruning with PI fidelity controller and hard-keep invariant (Prop. 4) | Algorithm (O4) | `results/baselines_sensitivity.json` | Done in simulation |
| C6 | ACRS closed loop with M_t write-back; open, reproducible harness | System | `results/acrs_results.json`, `Makefile`, CI | Done |

## Research questions → experiments

| RQ | Question | Experiment | Primary metric | Current answer |
|---|---|---|---|---|
| RQ1 | Does session state improve tool retrieval over stateless baselines? | `o1_satr_v2.py`, interleaved test | held-out NDCG@5 | Yes: +12.4 %, CI excludes 0; holds with two interleaved providers |
| RQ2 | Does risk-signed routing lower cost without raising errors? | router baselines | cost, accepted errors, regret | See RESULTS.md (router table) |
| RQ3 | Does evidence-weighted quorum resist fabricating agents? | forge / collude / width sweep | accepted-error rate, abstention | Yes for b ≤ f; fails as predicted when b > f |
| RQ4 | Does adaptive pruning keep fidelity at lower token cost than fixed ratios? | pruning baselines, floor sweep | floor satisfaction, tokens removed | See RESULTS.md (pruning table) |
| RQ5 | Does the closed loop beat individually deployed subsystems? | one-at-a-time ablation | all of the above | Yes on accepted errors and cost; abstention is the price |

## Chapter structure

1. Introduction — problem, thesis statement, contributions C1–C6
2. Background and related work — tool learning, LLM routing, multi-agent consensus, prompt compression
3. Evaluation methodology — sessionisation, leakage audit (C1), metrics, statistics, power analysis
4. SATR (O1) — design, ablations, interleaved and topic-switch robustness
5. APRR (O2) — design, Proposition 2, router baselines, sensitivity
6. MNCD (O3) — adversary model, Proposition 3, forge/collude/width experiments
7. FCNP (O4) — design, Proposition 4, pruning baselines, floor sweep
8. ACRS integration — closed loop, ablation, live AGMARKNET case study
9. Real-LLM validation — open-weight agents on StableToolBench / BFCL multi-turn (Year 3)
10. Threats to validity, limitations, ethics — simulation gap, single benchmark, abstention cost, data licences
11. Conclusion and future work

## Remaining work that a panel will require before submission

- Real LLM agents (open-weight, e.g. 7–8B class) replacing the simulator for O2/O3, at least on a 200-task subset.
- External validity for O1: ToolBench G2/G3 (multi-tool) and the ToolRet benchmark; pretrained dense encoders.
- Abstention handling: route abstained turns to a fallback (escalate or ask the user) and report end-to-end success.
- Live AGMARKNET case study with a small human-rated task set (Chapter 8).
