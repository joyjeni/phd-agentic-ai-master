# Publication plan (journals only, v3)

**Constraint set:**
- MSRUAS PhD regulations D.8.4 require at least two refereed journal papers *and* two reputed conference presentations before submission.
- The scholar prefers journals over transactions, and quartile-1 venues.
- Nothing below is a promise of acceptance. Each paper is ready to submit only when its "evidence needed" column is green.
- Check the current JCR quartile, APC and scope page for each journal at the time of submission.

| # | Paper (working title) | Objective(s) | Primary journal | Fallback journal | Evidence needed before submission |
|---|---|---|---|---|---|
| J1 | *Certified auto-execution for multi-agent tool pipelines: evidence-weighted consensus with Learn-then-Test risk control and policy-as-code* | O3 + G1 | **Autonomous Agents and Multi-Agent Systems** (Springer) | Knowledge-Based Systems (Elsevier) | ✅ simulated agents; ⬜ real open-weight LLM agents on StableToolBench; ⬜ AgentDojo injection run; ⬜ held-out risk ≤ α on KCC at α = 0.02 |
| J2 | *Session-aware tool retrieval for multi-turn agents* | O1 | **Information Processing & Management** (Elsevier) | Expert Systems with Applications | ✅ ToolBench +12.4% NDCG@5 with a CV CI; ⬜ ToolRet; ⬜ dense GPU encoders (bge) in the hybrid; ⬜ KCC multi-turn queues |
| J3 | *KCC-Sessions: a governed agentic advisory system for Indian farmers on open government data* (flagship, integrated) | O1–O4 + G1 | **Computers and Electronics in Agriculture** (Elsevier) | Engineering Applications of Artificial Intelligence | ⬜ full KCC run (notebook); ⬜ shadow-mode agreement with expert `KccAns`; ⬜ label-noise audit; ⬜ a pilot letter from an FPO or state department if obtainable |
| J4 | *Risk-signed contextual-bandit routing and fidelity-controlled context pruning* | O2 + O4 | **Information Sciences** (Elsevier) | Neural Networks (Elsevier) | ✅ LinUCB/LinTS baselines; ⬜ real-cost LLM tiers; ⬜ LongBench-style fidelity check |

**Conferences (to meet D.8.4, and to get early reviews):** an AAMAS or ECAI workshop paper on J1's core result, and the KCC system at ACM COMPASS or CODS-COMAD (the Indian data-science venue).

**Order:** J1 first (strongest, most novel, simulation results already hold), then J3 (the public-problem flagship) once the KCC notebook results are in, then J2 and J4.

## What makes these publishable rather than incremental

1. **A finite-sample guarantee on auto-executed errors** for a multi-agent tool pipeline (Learn-then-Test over MNCD's weighted share), with the review cost reported. This is not a hand-tuned threshold.
2. **Correlated error is made measurable.** Prompt injection through shared tool evidence defeats evidence-weighted voting on its own. The paper shows that, and shows the governance layer fixing most of it, with the residual reported.
3. **Capability ≠ authority, as testable code.** A stage registry with invariants, and a policy engine whose rules are tested both ways and logged tamper-evidently.
4. **A public-problem benchmark** derived without inventing labels (KCC-Sessions), released as a loader and a protocol.

## Honesty clauses that reviewers will look for

Simulated agents are labelled as simulated. Pseudo-sessions are called pseudo-sessions. The lexical guard's paraphrase residual is reported. ToolBench is too small to certify α = 2%, and the paper says so and shows where KCC fixes it.
