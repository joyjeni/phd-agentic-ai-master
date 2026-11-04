# Postdoctoral roadmap for ACRS (November 2026)

Written from the stance of a postdoctoral researcher asked to turn the four PhD objectives into journal papers.
Per-repository audits: `docs/POSTDOC_REVIEW.md` in each objective repository.

## Verdict

- **PhD defence:** defensible after the Year-3 items below. Internal validity is now sound (leak-free protocol,
  cross-validation, power analysis, proofs). External validity is not: every agent is simulated and the
  evidence rests on one benchmark.
- **Postdoc readiness:** there is no "postdoc degree"; a postdoc is a research position after the PhD. Hiring
  panels look for 2–3 first-author Q1 journal papers, one released dataset or tool, and an independent research
  line. ACRS can deliver this if O3 and the dataset paper are published first.
- **Strongest contribution:** O3 evidence-weighted quorum (safety proof + 24 % → 2 % accepted errors).
- **Weakest:** O4 as implemented in `fcnp-context-pruning` — the Physarum pruner loses to simple baselines.

## Changes per objective

| Objective | Keep | Change | New experiment | Target journal |
|---|---|---|---|---|
| O1 SATR | Session provider memory (SATR v2, +12.4 % held-out) | Non-oracle history; sessions not built by category; drop the co-occurrence graph (hurts once leakage is removed) | ToolRet + ToolBench G2/G3 + BFCL v3 multi-turn, real dense encoders, ≥ 500 sessions | Information Processing & Management |
| O2 APRR | Risk-signed bandit with escalation; Prop. 2 regret statement | Replace the circular synthetic simulator with real queries; one router (not APRR-core + CTGR + FTDR) | Real routing over open-weight LLM agents on τ-bench / BFCL; RouterBench-style cost–quality frontier | Expert Systems with Applications / IEEE Access |
| O3 MNCD | Evidence-weighted quorum, abstention, Prop. 3 safety | Unify score-sum lab version with the quorum; say "crash-fault" for S3/S4 | Real LLM agents with injected fabricators and colluders; n ≥ 4 peers; AgentHallu-style attribution | Knowledge-Based Systems / IEEE/CAA JAS |
| O4 FCNP | Typed-block knapsack, hard-keep invariant, PI fidelity controller | Retire Physarum as the headline (ablation only); use official LLMLingua-2 | LongBench / ZeroSCROLLS task accuracy vs tokens with a real reader LLM | Engineering Applications of AI |
| Integrated | Closed loop with M_t write-back | Abstention fallback (escalate or ask user) | AgriToolBench-IN end-to-end, human-rated | Computers and Electronics in Agriculture |

## Datasets to add

| Dataset | Use | Why a reviewer will accept it |
|---|---|---|
| ToolRet | O1 | Large heterogeneous tool-retrieval benchmark; shows retrievers are not "tool-savvy" |
| ToolBench G2 / G3 (e.g. `Tool-COLT/ToolBenchG2`) | O1, O2 | Multi-tool sessions answer the single-provider criticism |
| BFCL v3 multi-turn, τ-bench, ToolSandbox, APIGen-MT | O1–O3 | Real multi-turn, stateful tool use with task success |
| AgentHallu; collective-hallucination setups | O3 | Real LLM fabrications instead of simulated ones |
| LongBench, ZeroSCROLLS | O4 | Standard for prompt-compression papers (LLMLingua family) |
| **AgriToolBench-IN (new, yours)** | All | ≥ 500 multi-turn farmer sessions over data.gov.in / AGMARKNET in English + Kannada / Tamil / Hindi, human-labelled; a citable resource paper |

## Order of work (12 months)

1. **M1–M3:** AgriToolBench-IN collection protocol + ethics; real-LLM harness (open-weight models on a T4/A100).
2. **M3–M5:** O3 paper with real agents (strongest result first).
3. **M5–M7:** O1 paper on ToolRet + G2/G3 + BFCL with non-oracle history.
4. **M7–M9:** Dataset paper (AgriToolBench-IN) + integrated system results.
5. **M9–M12:** O2 and O4 papers; thesis write-up.
