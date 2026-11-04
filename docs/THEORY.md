# Formal properties of ACRS (what is proved, what is only measured)

This note states each theoretical claim made in the thesis precisely, with its assumptions, and marks
claims that were **corrected** after the panel review. Notation follows `laboratory/research/src/paim`.

---

## Proposition 1 — SATR greedy ordering has no (1 − 1/e) guarantee (corrected claim)

**Setting.** For a committed set S, SATR scores a candidate d by
s(d | S) = m(d) + w_c·cooc(d, S) + w_f·fam(d, S) − w_x·max_{c∈S} sim(d, c),
where m(d) collects the set-independent terms (relevance, session, served, failure, session provider memory).
Greedy picks argmax_d s(d | S) and appends d to S.

**Claim.** The induced set function F(S) = Σ_{d∈S} s(d | S_{<d}) is not monotone submodular in general, so the
classical (1 − 1/e) bound of Nemhauser et al. (1978) does not apply.

**Proof sketch.** (i) *Supermodularity of coherence.* Let a, b be two endpoints of the same provider and c of
another, with m(a) = m(b) = 0, m(c) = ε > 0, w_f > 0, all other weights 0. The marginal gain of b is 0 given ∅
and w_f given {a}: gains increase with the set, violating diminishing returns. (ii) *Non-monotonicity.* With
w_x > 0 and m small, adding a near-duplicate lowers F. ∎

**Consequence.** Greedy is a heuristic; its quality is established empirically (held-out NDCG, Section O1).
The earlier code comment and proposal slide claiming a (1 − 1/e) guarantee were removed.
Special cases: with w_c = w_f = w_x = 0 the objective is modular and greedy is exactly optimal.

---

## Proposition 2 — APRR regret under a signed risk posture

**Setting.** Disjoint linear contextual bandit, K agents, context x_{t,a} ∈ ℝ^d (d = 13), reward
r_{t,a} = θ_a·x_{t,a} + η_t with η_t conditionally 1-sub-Gaussian and ‖θ_a‖ ≤ S, ‖x‖ ≤ L. Cost, latency and
hallucination penalties c_a are known deterministic offsets, so the learner optimises r' = r − c.
APRR selects a_t = argmax_a [θ̂_a·x − c_a + p_t·σ_{t,a}], with σ_{t,a} = ‖x_{t,a}‖_{A_a^{-1}} and posture
p_t = α − γ_t, γ_t = γ_base(1 − risk_tolerance) + 0.45·risk_t ∈ [0, γ_max].

**Claim.** Let β_T be the self-normalised confidence radius of Abbasi-Yadkori et al. (2011). If p_t ≥ β_T on a set
of rounds O (optimistic rounds), the regret accumulated on O satisfies
R_O(T) ≤ (β_T + p_max) · √(2 d K |O| log(1 + T L² / (d λ))) = Õ(d √(K T)).
On pessimistic rounds P = {t : p_t < β_T} no sublinear bound holds in general; the instantaneous regret is at most
(β_T − p_t)·σ_{t,a*} + (β_T + p_t)·σ_{t,a_t}, and the first term is not controlled by the elliptical-potential lemma.

**Proof sketch.** On the high-probability event |θ̂_a·x − θ_a·x| ≤ β_T σ, optimality of a_t gives
r'(a*) − r'(a_t) ≤ (β_T − p_t) σ_{t,a*} + (β_T + p_t) σ_{t,a_t}. For p_t ≥ β_T the first term is ≤ 0; summing the second
with Cauchy–Schwarz and the elliptical-potential lemma per arm gives the bound. ∎

**Consequence.** APRR inherits LinUCB's Õ(d√T) guarantee whenever it is optimistic (γ_t ≤ α − β_T, which holds
for γ = 0). Pessimism is a deliberate safety trade: it buys fewer exploratory calls to cheap, hallucination-prone
agents during failing sessions and gives up the worst-case guarantee on exactly those rounds. The thesis therefore
(a) reports |P|/T and (b) measures empirical regret against LinUCB and linear Thompson sampling
(`experiments/baselines_sensitivity.py`).

---

## Proposition 3 — MNCD safety: no fabricated claim is certified when b ≤ f and n ≥ 3f + 1

**Adversary model.** A sub-goal is deliberated by n recruited peers. Up to b peers are Byzantine: they may emit any
claim, any confidence, forge citations to real observations, and collude on a common wrong claim. Faithful peers
that succeed emit the same grounded claim key (the digest of the shared observation pool); faithful peers that fail
emit distinct low-confidence keys. The mechanism tolerates f = ⌊(n − 1)/3⌋ faults and certifies a claim only if it
(i) wins the evidence-weighted vote, (ii) has weighted share ≥ θ, and (iii) is backed by ≥ q = min(n, 2f + 1) reports.

**Claim (safety).** If b ≤ f and n ≥ 3f + 1 with f ≥ 1, no claim backed only by Byzantine peers is certified.

**Proof.** A fabricated key is never emitted by a faithful peer, so its backers are a subset of the b ≤ f
Byzantine peers. Condition (iii) needs ≥ 2f + 1 > f backers. ∎

**Claim (liveness, conditional).** If at least q faithful peers succeed and evidence weights satisfy θ-share, the
grounded claim is certified; otherwise the mechanism abstains (never guesses).

**Important caveat found during review.** With the default width n = 3, f = ⌊2/3⌋ = 0 and q = 1, so condition (iii)
is vacuous: safety at n = 3 comes only from evidence weighting and the corroboration gate κ, not from the quorum.
This is exactly why colluding fabricators defeat MNCD at n = 3 in `o3_collude.json`. The quorum guarantee is
operative from n = 4 (f = 1, q = 3); `o3_collude_w4.json` tests it (the 5-agent pool caps n at 4).

---

## Proposition 4 — FCNP hard-keep invariant and bounded controller

**Claim (a).** Blocks of kind `user_query` / `sub_goal` and blocks with criticality ≥ 0.88 are never evicted:
the knapsack admits the hard-keep set first, before any density ordering. (By construction; covered by unit tests.)

**Claim (b).** The keep fraction κ_t produced by the PI controller always lies in [κ_min, 1] and the integral term
is clamped to ±I_max, so the controller is BIBO-stable for bounded fidelity error. No claim is made that the
fidelity floor is met on every turn; it is measured (`floorSatisfactionRate`).

**Terminology fix.** The controller has proportional, integral and a small slope term but no derivative term on the
error; it is a PI controller. "PID-controlled" in the registered title should be read as "PI-controlled".

---

## References
Abbasi-Yadkori, Pál, Szepesvári (2011) *Improved algorithms for linear stochastic bandits*, NeurIPS.
Agrawal & Goyal (2013) *Thompson sampling for contextual bandits with linear payoffs*, ICML.
Lamport, Shostak, Pease (1982) *The Byzantine generals problem*, ACM TOPLAS.
Li, Chu, Langford, Schapire (2010) *A contextual-bandit approach to personalized news article recommendation*, WWW.
Nemhauser, Wolsey, Fisher (1978) *An analysis of approximations for maximizing submodular set functions*, Math. Prog.
