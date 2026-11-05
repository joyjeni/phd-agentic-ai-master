# ACRS executable results

## v3 (5 November 2026): O1–O4 integrated + G1 governance

Source of truth:
- `results/integrated_toolbench.json` (local CPU, reproduced on a Colab T4);
- `results/integrated_kcc.json` (Colab run on the KCC sample).

Rendered tables are in `thesis/tables_toolbench.tex`.

- **Ablation:** the full loop cuts executed errors from 24.1 % to 1.15 %. G1 costs 1.7 points of auto-execution coverage when there is no attack.
- **Injection:** at 15 % poisoned endpoints, attack success falls from 29.3 % to 5.7 % with G1; at 30 %, from 45.4 % to 6.3 %. The guard has a 0 false-positive rate on clean traffic. The residual comes from the paraphrased payload.
- **Certified execution (Learn-then-Test, δ = 0.05):**
  - α = 0.05: certified 3/3 seeds, θ\* 0.30–0.55, held-out risk ≤ 3.0 %, coverage 73.6 %.
  - α = 0.10: certified 3/3, held-out risk ≤ 7.4 %.
  - α = 0.02: not certifiable (fewer than 149 executions per calibration half).
  - Under attack: never certified, so every sub-goal goes to REVIEW.
- **Reliability:** pass^1/2/3 = 0.749 / 0.588 / 0.466. The product of stage reliabilities is 0.598, against 0.718 observed.
- **Release:** gate passed; CI cannot promote; a named approver can.

Threats to validity:
- agents are simulated;
- the injection harness is in-house (AgentDojo next);
- KCC uses pseudo-sessions and noisy QueryType labels;
- most KCC services are simulated.

# ACRS executable results (v2, 3 November 2026 — SATR v2)

All four objectives and the integrated loop run end to end on CPU. Reproduce in ~15 min on free Colab/Kaggle with
[`ACRS_benchmark.ipynb`](ACRS_benchmark.ipynb), or locally:

```bash
cd laboratory/research && python -m pytest -q && cd ../..
python experiments/run_all.py --repo . --seeds 3 --out experiments/results/acrs_results.json
python experiments/o1_satr_v2.py --repo . --out experiments/results/o1_satr_v2.json   # ~20 min, 5-fold CV
python experiments/o3_forge.py --repo . --out experiments/results/o3_forge.json
COLLUDE=1 python experiments/o3_collude.py --repo . --out experiments/results/o3_collude.json
python experiments/leakage_audit.py
```

**Protocol.** Sessionised ToolBench G1 (100 queries → 174 sub-goals, 10,439 APIs). 3 seeds. One-at-a-time ablation:
each objective is swapped for its SOTA analogue (O1 stateless BM25 · O2 static heavy-tier routing · O3 majority vote ·
O4 fixed 50 % keep ratio). **Agent execution is simulated** (seeded, schema-faithful) — these numbers test the
orchestration mechanisms, not LLM quality.

**Leakage control.** 94/100 test gold tool sets appear verbatim in `train_trajectories.jsonl`. They are removed
(5,476 trajectories) before fitting the O1 co-occurrence graph. With leakage, NDCG@5 is inflated from 0.482 to 0.577.

## Ablation (mean of 3 seeds)

| Configuration | NDCG@5 | Accepted-error rate ↓ | Certified precision ↑ | Abstention | Cost / session ↓ | Latency ms ↓ | Fidelity-floor met ↑ | Compression |
|---|---|---|---|---|---|---|---|---|
| SOTA baseline | 0.519 | 24.0 % | 75.9 % | 0.5 % | 0.0309 | 3,172 | 11 % | 51.0 % |
| + O1 SATR v2 | 0.584 | 24.6 % | 75.4 % | 0.3 % | 0.0308 | 3,161 | 13 % | 51.2 % |
| + O2 APRR | 0.519 | 30.5 % | 69.5 % | 0.1 % | 0.0080 | 1,233 | 11 % | 51.0 % |
| + O3 MNCD | 0.519 | 0.6 % | 99.2 % | 23.1 % | 0.0321 | 3,166 | 11 % | 51.0 % |
| + O4 FCNP | 0.519 | 21.6 % | 78.4 % | 0.0 % | 0.0306 | 3,266 | 100 % | 47.2 % |
| **Full ACRS** | 0.587 | 2.0 % | 97.4 % | 21.3 % | 0.0141 | 1,828 | 100 % | 47.1 % |

Accepted-error rate = share of turns where the system certified an answer not produced by a faithful agent.

## Findings by objective

- **O1 SATR v2 — target (≥10 % NDCG@5) met.** 5-fold cross-validated, every number held out: BM25 0.517 →
  SATR v2 0.581 (+12.4 %, Δ = +0.064, 95 % CI +0.036 to +0.094).
  Later turns gain most: 0.547 → 0.655. v1 (co-occurrence graph) lost 6.6 %.
  v2 adds provider coherence and a decayed session provider memory — neither uses training data, so they cannot leak.
  Ablation: removing provider coherence → +6.0 %, removing session provider memory → +9.2 %.
  Topic-switch test (session switches provider): no harm (0.509 vs 0.494).
  Negative results: sibling expansion adds nothing; an LSA (TF-IDF+SVD) hybrid first stage hurts (−30 %) — pretrained dense
  encoders could not be downloaded in this sandbox and remain to be tested (the notebook installs them on Colab).
  Limit: ToolBench G1 sessions use one provider each; multi-tool G2/G3 sessions are the next test.
- **O2 APRR — strong efficiency gain.** −74 % cost, −61 % latency, mean regret 0.338 → 0.027, oracle agreement 4 % → 34 %.
  Alone it raises accepted errors (cheaper agents hallucinate more); O3 compensates in the full loop.
- **O3 MNCD — strongest result.** Accepted errors 24 % → 0.6 %. Holds when fabricators forge citations (0 %).
  Against colluding fabricators it degrades as the Byzantine bound predicts: 6.2 % vs 28.6 % for majority at base
  rates, but ≈ majority (31.8 % vs 37.9 %) once colluders exceed f. Cost: 23–24 % abstention.
- **O4 FCNP — target met.** Fidelity floor Φ* = 0.78 met on 100 % of turns (vs 11 % at a fixed ratio), mean Φ 0.26 → 0.87,
  while still removing 47 % of context tokens (target ≥ 30 %).
- **Integrated loop.** Versus SOTA baseline: accepted errors −91 %, cost −56 %, latency −44 %, at 24 % abstention.

## Threats to validity

Simulated agents; 100-query test set; G1 single-provider sessions; O3 adversarial tests were run with SATR v1; hand-set O2–O4 parameters; abstentions are not yet routed to a fallback.
Next step is running the same harness with real open-weight LLM agents on StableToolBench / BFCL multi-turn.

## Panel-requested baselines (3 seeds, full loop, leak-filtered)

### O2 routing

| Router | Cost / session | Latency ms | Accepted errors | Mean regret | Oracle agreement |
|---|---|---|---|---|---|
| Static heavy | 0.0319 | 3,258 | 0.2 % | 0.333 | 7.3 % |
| Round robin | 0.0153 | 1,916 | 1.4 % | 0.155 | 27.3 % |
| Capability match | 0.0281 | 3,010 | 0.2 % | 0.205 | 19.8 % |
| LinUCB | 0.0160 | 2,032 | 1.6 % | 0.124 | 29.1 % |
| Linear Thompson sampling | 0.0115 | 1,608 | 2.0 % | 0.111 | 38.8 % |
| APRR (proposed) | 0.0141 | 1,828 | 2.0 % | 0.079 | 52.1 % |

APRR vs LinUCB: regret Δ -0.045 (CI [-0.0501, -0.041]), cost Δ -0.0019 (CI [-0.0035, -0.0002]), accepted errors Δ +0.004 (CI [-0.0128, 0.0206], n.s.).
APRR vs static heavy: cost Δ -0.0177, latency Δ -1,430 ms, but accepted errors Δ +0.018 (CI [0.0061, 0.0328]) — a cost–quality trade-off, not a free win. Linear Thompson sampling is cheaper than APRR (0.0115) with higher regret.

### O3 consensus

| Consensus | Accepted errors | Abstention |
|---|---|---|
| Majority vote | 31.6 % | 0.0 % |
| Highest confidence (LLM-as-judge proxy) | 27.1 % | 0.0 % |
| MNCD (proposed) | 2.0 % | 21.3 % |

MNCD vs majority: accepted errors Δ -0.296 (CI [-0.3456, -0.2483]); abstention Δ +0.213. θ ≥ 0.6 gives 0 accepted errors at 22 % abstention; θ = 0.4 gives 4 % errors at 9 % abstention (1 seed).
Width n = 4 (f = 1) with colluding, citation-forging fabricators: base rate MNCD 2.0 % vs majority 17.4 %; at 3× rate 11.8 % vs 29.3 %. Pool size caps n at 4 (width 5 is identical).

### O4 pruning

| Pruner | Tokens removed | Φ-floor met | Mean Φ | NDCG@5 |
|---|---|---|---|---|
| No pruning | 0.0 % | 100.0 % | 1.000 | 0.587 |
| Recency truncation 50% | 51.1 % | 9.8 % | 0.308 | 0.587 |
| Fixed ratio 30% | 71.0 % | 3.0 % | 0.153 | 0.580 |
| Fixed ratio 50% | 51.2 % | 13.6 % | 0.286 | 0.580 |
| Fixed ratio 70% | 31.7 % | 27.8 % | 0.506 | 0.584 |
| FCNP + PI controller (proposed) | 47.1 % | 99.7 % | 0.873 | 0.587 |

FCNP is the only method that removes a substantial share of tokens while meeting the Φ* = 0.78 floor on almost every turn. Floor sweep 0.6→0.9 trades compression 48 %→43 %.

### O1 interleaved two-provider sessions

BM25 0.517 → SATR v2 0.562 (Δ +0.045, CI [0.0297, 0.0623], 348 sub-goals).

## Is the sample large enough? (power analysis, `power_analysis.py`)

- **O1:** unit = session (n = 100). Mean Δ NDCG@5 = 0.069, d_z = 0.436, achieved power = 0.9919, paired t p = 3.16e-05, Wilcoxon p = 4e-05. Minimum detectable effect at 80 % power = 0.0443 (8.5 % of BM25). Sessions needed for Δ = 0.03 / 0.02 / 0.01: 219 / 492 / 1965. Empirical power by subsample size: {'20': 0.492, '40': 0.873, '60': 0.963, '80': 0.995, '100': 1.0}. 38 sessions gain, 12 lose, 50 tie (mostly single-turn).
- **O3:** Cohen's h = 0.868, power ≈ 1.0 with 174 sub-goals; zero observed errors bound the true rate below 1.7 % (95 %, rule of three).
- **Verdict:** sufficient for internal validity of every headline claim. Not sufficient for generalisation: one benchmark, simulated agents. Effects smaller than ~0.04 NDCG@5 (e.g. dense vs hybrid comparisons) need ≥ 220 sessions.
