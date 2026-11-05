# Agentic design method applied to ACRS (v3)

This document records the design method the thesis follows and where each step lives in code.
It answers the examiner question *"why is each component built the way it is, and who is allowed to decide what?"*

## 1. Four phases

| Phase | Question | ACRS answer |
|---|---|---|
| **Understand** | What does the symptom trace back to? | The stated metric (NDCG, cost) is not the problem. The root cause is that multi-agent tool pipelines **act on answers they cannot vouch for**: retrieval forgets the session (G1), routing ignores risk (G2), voting counts correlated peers as independent (G3), compression has no fidelity floor (G4), and no stage owns the decision to act (G5). |
| **Define** | What outcome matters, apart from the metric you were asked to move? | *Every auto-executed answer is grounded, cheap enough to serve, and within a certified error bound. Everything else reaches a named human with its evidence attached.* Moving NDCG or cost while letting accepted errors rise is a net loss, not a partial win (the +O2-alone ablation row shows exactly that). |
| **Decompose** | Per step: is there judgment, are the steps knowable, must a model choose? | Table §2. Deterministic components come first; models appear only where judgment exists. |
| **Sequence & validate** | What evidence earns the next stage? | Shadow, then live with approval, then a separately reviewed path for scope changes (§6). |

## 2. Decision sequence and component types (`paim.governance.authority.ACRS_STAGES`)

| Stage | Component type | Pattern | Model? | May recommend | May decide | Oversight | Fails by | Detected by |
|---|---|---|---|---|---|---|---|---|
| S0 session state | ingestion/normalisation | plain code | no | – | yes (deterministic) | none | stale memory after a topic switch | topic-switch test |
| S1 O1 SATR | matching/rules | plain code | no | yes | no | none | turn-amnesic ranking | held-out NDCG@5 per turn, CI |
| S2 O4 FCNP | matching/rules | plain code (PI controller) | no | yes | no | none | pruning a needed block | Φ\*-floor satisfaction |
| S3 O2 APRR | model-assisted recommendation | routing | yes | yes | bounded | sample audit | front-door misroute | regret and oracle agreement, measured separately |
| S4 O3 MNCD | model-assisted recommendation | parallelisation (voting) | yes | yes | bounded | escalate on uncertainty | **correlated error** (colluding or injected peers) | agreement against labels; ECE of weighted share |
| **G1 governance** | **human approval gate** | **plain code** | **no** | – | yes (deterministic) | approve before execute | rule skipped | transition refused without a recorded decision id |
| S5 write-back | publish/write-back | plain code | no | – | deterministic after approval | review after execute | poisoned memory | R-MEM-01 decisions |

`registry_violations()` asserts the invariants: no model-based stage decides outright, every model-based stage names a failure mode and a detector, the approval gate is not a model, and all five component types are present.

**Reliability compounds.** Ten stages at 95% give about 60% end to end. `integrated_eval.py` reports each stage's reliability and their product next to the observed end-to-end rate.

## 3. Capability is not authority: four oversight designs

"Human in the loop" is a placeholder. It resolves to one of four designs, chosen per decision:

| Design | Used in ACRS for | Why |
|---|---|---|
| Approve before execute | state-changing tools (R-EXEC-02); agronomic-dose and entitlement answers (R-COMMIT-01 `risk_class`) | irreversible, or someone's name is on the outcome |
| Review after execute | memory write-back, bandit reward | reversal is cheap |
| Sample audit | APRR routing | error cost is measurable, so it sets the audit rate |
| Escalate on uncertainty | MNCD certification below θ\* | **only valid when confidence is calibrated**, so θ\* is set by Learn-then-Test, and ECE is reported |

**The 99-of-100 argument.** A high aggregate approval rate does not license auto-execution. Disagreements cluster on hard, high-consequence cases. ACRS therefore auto-executes a *narrow category* (informational, read-only, uncontaminated, certified at θ\*) chosen on measured error, never on an aggregate approval figure.

## 4. Policy as code (`policies/acrs_policies.json`, `paim.governance.policy`)

The guardrail sits **outside** the agents, as plain code, so it cannot be argued with. `check_policy(subject, action, resource, state)` returns allow or deny with a reason, in microseconds, and appends to a SHA-256 hash-chained log.

Every rule:
1. denies by default;
2. requires all of its conditions to hold;
3. names who, what, on what, and in what state;
4. is traced to a source; and
5. is tested both ways (`PolicyEngine.self_test`, which runs at start-up).

| Rule | Enforces | Where it is called |
|---|---|---|
| R-COMMIT-01 | EXECUTE only if certified, share ≥ θ\*, quorum met, **no quarantined evidence**, read-only, informational, no stage failure, kill switch off | G1, after S4 |
| R-EXEC-01/02 | peers call only SATR-committed tools; writes need a named approval | tool boundary |
| R-MEM-01 | quarantined or failed observations never enter the next turn or SATR's prior | S5 |
| R-REL-01 | only a named approver promotes a release, after the gate passes on a pinned manifest | release |

`to_rego()` exports the same rules to OPA Rego for deployments that run an OPA sidecar.

## 5. Four build constraints

1. **A failure never executes.** Any exception in a governed turn yields REVIEW (`test_fail_closed_on_stage_exception`).
2. **Everything traces to evidence.** Certificates carry evidence tokens, and decisions carry rule ids.
3. **Tool output is data.** `InjectionGuard` neutralises instruction-shaped text at the executor boundary. It is a lexical baseline; the paraphrase residual is measured, not assumed away.
4. **No silent divergence.** Every place the build differs from the design is listed in `experiments/RESULTS.md` under "threats to validity".

## 6. Release discipline (`paim.governance.release`)

- A release is seven pinned parts (code, config, agents, tools, models, policy, index): `ReleaseManifest` and `diff()`.
- A build has a distribution, not a score: median, p10 and p90 over seeds, plus τ-bench pass^k.
- Gates block on quality (with a flake tolerance), cost and p95 latency. CI cannot promote; a named approver can (R-REL-01).
- The kill switch (`ACRS_KILL_SWITCH=1` or a flag file) makes every turn BLOCK, and it is tested on every CI run.
- Roll-out for a deployment: **shadow** (replay historical KCC queues, write nothing, compare with the expert `KccAns`), then **live with approval** (every EXECUTE is shown to a Farm Tele Advisor), then a **separately reviewed path** for any new query type or risk class.

## References (public)

- Anthropic (2024). *Building effective agents*: augmented LLM; the five workflow patterns; agents versus workflows.
- Angelopoulos, Bates, Candès, Jordan, Lei (2025). Learn then Test. *Annals of Applied Statistics*, doi:10.1214/24-AOAS1998.
- Greshake et al. (2023). Not what you've signed up for: indirect prompt injection. *AISec@CCS*.
- Debenedetti et al. (2024). AgentDojo. *NeurIPS Datasets & Benchmarks*.
- Hines et al. (2024). Defending against indirect prompt injection with spotlighting. arXiv:2403.14720.
- Yao et al. (2024). τ-bench (pass^k). arXiv:2406.12045.
- Open Policy Agent, Rego language reference.
