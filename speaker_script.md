# PhD Research Proposal — PRP-1 Speaker Script
## ACRS: Adaptive Context Reasoning System for Efficient Multi-Agent LLM Inference
**Student:** Jenisha T | Reg: 24ETRP720001  
**Supervisor:** Dr. Jyothi A P, Associate Professor & Programme Head (M&C), FET  
**Department:** CSE, FET, M.S. Ramaiah University of Applied Sciences

---

## Slide 1 — Title Slide

My research is titled **"Design and Evaluation of ACRS — Adaptive Context Reasoning System — for Efficient Multi-Agent LLM Inference."** I'm Jenisha T, PhD candidate in the Department of Computer Science and Engineering at M.S. Ramaiah University of Applied Sciences, working under the supervision of Dr. Jyothi A P.

The name ACRS is deliberate. It's not just another LLM optimization paper. The word *adaptive* carries weight — I'll show you exactly where adaptation happens, why it can't be static, and how I measure whether adaptation actually worked. The word *context* is equally intentional — context is the thing that dies in multi-agent systems, and ACRS is fundamentally about keeping it alive, compact, and available.

This is a four-objective system proposal. Each objective addresses a distinct failure mode that currently makes multi-agent LLM inference unreliable at scale. By the end of this presentation, I want you to be convinced not just that these problems exist, but that my specific engineering choices are the right ones to solve them — and that no one has done this particular combination before.

---

## Slide 2 — Table of Contents + Abbreviations

Let me orient you to the structure before I dive in, because ACRS has four components that interact, and it's easy to lose the thread.

The presentation moves from problem to literature to gaps to objectives to architecture to novelty to feasibility. The four objectives are: **SessionRerank+** (tool reranking across sessions), **APRR+CDR+PDR** (adaptive multi-strategy routing), **MNCD** (distributed context across nodes), and **FCNP** (context graph pruning). These aren't independent modules I bolted together — each one solves a failure that the others can't address alone.

Key abbreviations you'll see throughout: **LLM** — Large Language Model; **ACRS** — Adaptive Context Reasoning System; **BM25** — Best Match 25, a lexical retrieval function; **NDCG** — Normalized Discounted Cumulative Gain, my primary ranking metric; **RL** — Reinforcement Learning; **CoT** — Chain-of-Thought; **CDR** — Context-Driven Routing; **PDR** — Parallel Dispatch Routing; **APRR** — Adaptive Probabilistic Routing Reinforcement; **MNCD** — Multi-Node Context Distribution; **FCNP** — Flow-Controlled Network Pruning; **KV** — Key-Value (as in KV cache); **PRP** — PhD Research Proposal.

I'll define any term the first time I use it in context, but this glossary is your anchor if something comes up later that needs a quick reference.

---

## Slide 3 — Section Divider: Problem Context

Before I show you what I built, I want to show you exactly what's broken. This section is the foundation of everything. If I can't convince you these four problems are real, distinct, and unsolved, nothing else in this proposal matters.

The problems I'm about to describe aren't theoretical gaps I inferred from reading papers in isolation. They emerge directly from working with multi-agent LLM systems at inference time — from watching what actually fails when you move beyond a single-model, single-turn query into a realistic production environment where multiple agents collaborate, sessions have memory, infrastructure is imperfect, and context accumulates without bound.

---

## Slide 4 — Problem Context: 4 Core Challenges

I've identified four core challenges. Let me walk through each one concretely, because each one directly maps to one of my objectives.

**Challenge 1: Tool selection fails across multi-turn sessions.** The state of the art in tool retrieval is BM25 plus dense vector retrieval — essentially, you embed the query and find the most similar API description. That works fine if every query is independent. But in a real agent session, queries have history. If a user has been asking about agricultural commodity prices for three turns, the Agmarknet API should be ranked higher on the fourth turn even if the fourth query phrasing doesn't explicitly mention agriculture. Static retrieval ignores this entirely. The result is that you keep retrieving the wrong tools because you're treating each turn like it's the first turn.

**Challenge 2: Routing is brittle.** Every published LLM router — RouteLLM, FrugalGPT, PickLLM — learns its policy offline and freezes it before deployment. That's fine if the world doesn't change. But in production, agents fail, latency patterns shift, and some models become slower during peak hours. A frozen router has no mechanism to respond. It keeps sending traffic to a degraded agent because it doesn't know the agent has degraded. I need a router that updates its own weights based on live session signals.

**Challenge 3: Context dies when nodes fail.** In a 5-agent distributed system, if you centralize your context store and two nodes go down, you lose everything those nodes held. There is no published protocol specifically designed for epidemic-style broadcast of LLM session context across agent nodes with fault tolerance. This is a genuine gap, not a minor limitation. A 44% context availability rate under node failure — which is what you get with a naive single-agent approach — is not acceptable for any production system.

**Challenge 4: Context bloat.** Multi-agent LLM systems accumulate context graphs that grow at roughly 50 or more records per turn. At that rate, within a single long session you're carrying thousands of tokens of dead weight — old context that's no longer relevant but hasn't been pruned. The problem is that naive pruning destroys citations. If I summarize away the reasoning chain that justified a decision, I lose the audit trail. I need a compression method that achieves 10:1 reduction while preserving citation-bearing nodes — and no current system does both.

*If you're asking yourself why I'm framing these as four separate objectives rather than one unified problem — the reason is that each failure mode operates at a different layer of the inference stack. Challenge 1 is retrieval. Challenge 2 is routing. Challenge 3 is distribution. Challenge 4 is representation. They require fundamentally different technical approaches, and collapsing them into a single mechanism would make each one worse.*

---

## Slide 5 — Literature Review Theme 1: Tool Retrieval & API Selection

The most relevant prior work on tool retrieval is **ToolBench and ToolLLM** (Qin et al., 2023). They created the 43,000-API catalog I use as my benchmark dataset, and they showed that dense retrieval with a fine-tuned embedding model outperforms BM25 significantly. ToolLLM achieves a baseline NDCG@5 of around 0.452 on multi-tool queries.

Here's what ToolLLM doesn't do — and this is the critical gap: it has no concept of session state. Every query in ToolLLM's retrieval is treated as a fresh request. There's no mechanism to say "this user has been in an agricultural context for several turns, so agricultural APIs should get a prior-activity boost." The model is stateless by design.

**LazyLLM** (Fu et al., 2024) is the other highly relevant paper here. LazyLLM does something clever — it prunes the KV cache per query based on which tokens are attended to. It's a form of dynamic context management. But it operates at the token level within a single query, not at the API selection level across multiple turns. It can't tell me that the Agmarknet API was useful two turns ago and should be prioritized now.

*You might ask: couldn't I just fine-tune ToolLLM on session-aware data and get the same effect? I considered this. The problem is that fine-tuning requires a static training set of multi-turn sessions with ground-truth API labels. Session distributions shift — what co-activates depends on the user's evolving task, which you can't fully anticipate at training time. I need an online mechanism that updates as the session unfolds, not a model that generalizes from a training corpus.*

**ReAct** (Yao et al., 2022) is also relevant because it formalizes the reason-act cycle in tool-using agents. But ReAct says nothing about how to rank which tools to use — it assumes the tool set is already determined. My work sits upstream of ReAct.

The gap from this theme: no existing retrieval system uses **session co-activation history** to rerank tools across turns. That's my Objective 1.

---

## Slide 6 — Literature Review Theme 2: LLM Routing

**RouteLLM** (Ong et al., 2024) is the flagship paper in learned routing. The idea is elegant: train a router to decide whether a query should go to a strong, expensive model or a weak, cheap one. They use preference data from human feedback and achieve significant cost reduction without much quality loss. It's a genuinely good paper.

My problem with RouteLLM is one word: offline. The router is trained, frozen, and deployed. If the "strong" model starts taking 800ms to respond instead of 200ms, RouteLLM doesn't know. It keeps routing as if nothing changed. In a multi-agent setup where agents are specialized and can fail independently, this is a serious limitation.

**FrugalGPT** (Chen et al., 2023) uses a cascade approach — try cheap models first, escalate only when confidence is low. Again, the thresholds are set at training time. There's no online update mechanism.

**PickLLM** extends this to multi-agent selection, but the policy is still learned offline from a static dataset. The common thread across all three: they all assume deployment conditions are stable, which they aren't.

*You might ask: why not just retrain the router periodically, say every hour? That's closer to what I'm doing, but there's a key difference. Periodic retraining still has a lag window where the system is operating on a stale policy. My APRR uses an exponential decay update with λ=0.005 — meaning each new success or failure has immediate, though dampened, effect on the routing weights. There's no lag window. Every session signal updates the system continuously.*

**Mixtral-MoE and related Mixture-of-Experts** work is also relevant here — the idea of conditional computation, where different experts handle different query types, is conceptually aligned with multi-agent routing. But MoE operates inside a single model at the layer level, not across separately deployed agents at the system level.

The gap: **no published router does online RL weight updates based on live session signals.** That's my Objective 2.

---

## Slide 7 — Literature Review Theme 3: Distributed Context & Fault Tolerance

**Distributed systems** literature gives me the theoretical scaffolding for MNCD. Specifically, **epidemic broadcast protocols** — also called gossip protocols — are well-established in databases and P2P systems. Papers like Demers et al. (1987) on anti-entropy algorithms, and more recent work on CRDTs (Conflict-free Replicated Data Types), show that gossip-based propagation achieves O(log N) diffusion time and is highly fault-tolerant.

What doesn't exist is any application of gossip protocols to LLM agent context specifically. The LLM systems literature treats context as either: (a) a monolithic KV cache inside a single model, or (b) a centralized vector database that agents query. Option (a) doesn't distribute. Option (b) has a single point of failure.

**Megatron-LM** and **Ray Serve** frameworks handle model parallelism and inference serving at scale, but they don't address session context distribution. They're about spreading the model, not spreading the context.

*You might ask: why not just use Redis with replication? Redis replication is well-understood, but it's a general-purpose key-value store. It has no notion of LLM session semantics — it doesn't understand that some context chunks are citations that must be preserved, that context has recency gradients, or that a "distress signal" should trigger targeted replication when a node's local context coherence drops below a threshold. My MNCD protocol encodes all of this in its design.*

The **CAP theorem** is directly relevant here. In a distributed system, I can have at most two of: Consistency, Availability, Partition tolerance. My MNCD prioritizes availability and partition tolerance over strict consistency — I use R=3 replication and accept eventual consistency within a gossip window. This is a deliberate design choice that I'll defend when I get to the MNCD details.

The gap: **no epidemic gossip protocol designed for LLM session context with distress signaling and citation-aware replication.** That's my Objective 3.

---

## Slide 8 — Literature Review Theme 4: Context Compression & Pruning

This is the richest area of prior work, and I want to be precise about where each paper falls short.

**SparseGPT** (Frantar & Alistarh, 2023) does one-shot weight pruning — it removes model weights, not context tokens. It compresses the model, not the runtime context graph. Different problem entirely.

**LoRA** (Hu et al., 2021) is low-rank adaptation during fine-tuning — again, model compression, not context compression.

**Scissorhands** (Liu et al., 2023) prunes KV cache entries that haven't been "pivotal" in recent attention patterns. It's the closest prior work to what I'm doing. The key limitation: Scissorhands has no notion of citation preservation. It prunes based on recency and attention weight, and it will happily prune a citation node if it hasn't been attended to recently — even if that node is the only record of why an earlier decision was made.

**H2O** (Zhang et al., 2023) uses a heavy-hitter oracle to keep the most attended-to KV pairs. Same structural problem — no citation anchoring.

**AdaKV** and **Finch** are more recent variants that improve the attention-based scoring, but they inherit the same citation blindness.

**StreamingLLM** (Xiao et al., 2023) keeps the first few tokens (attention sink tokens) and a rolling window of recent tokens. Simple and effective for long-context streaming, but 10:1 compression is not achievable with a rolling window without losing significant semantic content.

*You might ask: why do I need 10:1 compression specifically? That number comes from a practical constraint — in a 5-agent system running 10-turn sessions with 50+ records per turn, you accumulate roughly 2,500 context records. At 10:1 compression you're down to 250, which fits within the context window of current production models without truncation. Anything less than 10:1 means you still need to truncate, which destroys continuity.*

My **FCNP** uses a Kirchhoff flow-field formulation — treating the context graph as an electrical network where information flow determines importance — with citation anchors that are exempt from pruning by definition. This is a fundamentally different mathematical framing from attention-weight-based methods, and it's the only approach I know of that gives you 10:1 compression with citation preservation.

The gap: **no system applies Kirchhoff flow optimization to LLM context graph compression with citation-anchor preservation.** That's my Objective 4.

---

## Slide 9 — Gap Summary

Let me consolidate what I've just shown you from the literature into a clean gap table, because I want you to see that I'm not cherry-picking weaknesses — these are structural limitations in each body of work.

**Gap 1 — Tool Retrieval:** ToolLLM, LazyLLM, and ReAct all treat tool selection as a stateless per-query operation. No system uses session co-activation history to rerank tools in a multi-turn dialogue.

**Gap 2 — Routing:** RouteLLM, FrugalGPT, and PickLLM all learn offline. No published router performs online RL weight updates based on live binary session success signals.

**Gap 3 — Distributed Context:** Gossip protocols exist in databases and P2P systems. No work applies epidemic broadcast to LLM session context specifically, with distress signaling and citation-aware partial replication.

**Gap 4 — Context Compression:** Scissorhands, H2O, AdaKV, Finch, and StreamingLLM all compress based on attention patterns. None preserve citation nodes, and none achieve 10:1 compression with verifiable citation accuracy.

*The critical thing to understand here is that these four gaps are not four papers waiting to be written in isolation. They are four failure modes that co-occur in any realistic multi-agent LLM system. A system that solves only one or two of them is still unreliable. ACRS addresses all four in a coherent integrated framework.*

---

## Slide 10 — Research Gaps → 4 Objectives

From the four gaps, I derive four formally stated research objectives:

**Objective 1:** Design and evaluate a **session-aware contextual tool reranker** (SessionRerank+) that uses a co-activation session graph to boost API scores based on multi-turn usage history, targeting NDCG@5 ≥ 0.52 on the ToolBench benchmark.

**Objective 2:** Design and evaluate an **adaptive multi-strategy LLM router** (APRR+CDR+PDR) combining online reinforcement learning, deliberative context-driven routing, and parallel functional-token dispatch, targeting task success ≥ 47%, latency ≤ 265ms, and ≥35% latency reduction versus static routing baselines.

**Objective 3:** Design and evaluate a **distributed context availability protocol** (MNCD) using epidemic gossip broadcast with R=3 replication and distress signaling, targeting ≥97% context availability under simultaneous 2-of-5 node failures.

**Objective 4:** Design and evaluate a **Kirchhoff flow-based context graph pruning system** (FCNP) achieving 10:1 compression with ≥99% citation preservation accuracy, validated against seven baseline compression methods.

These objectives are ordered by dependency: SessionRerank+ feeds better tool results into the routing layer; the routing layer dispatches to agents whose context is maintained by MNCD; and the accumulated context is compressed by FCNP. They form a pipeline.

---

## Slide 11 — ACRS Framework Overview

**ACRS** is the unified system that integrates all four objectives. Let me describe it at the level of data flow so the architecture makes intuitive sense before I go into each component.

A user query enters the system. SessionRerank+ first processes it against the session co-activation graph to produce a ranked list of relevant APIs — not just based on semantic similarity, but on what has been useful in this session recently. That ranked list is passed to the routing layer. APRR evaluates the query's complexity and the current live performance weights of available agents. CDR intercepts high-ambiguity queries before dispatch and runs a deliberation step to reduce routing errors. PDR decomposes the query into sub-tasks and dispatches them to specialist agents in parallel. The agents execute their sub-tasks, drawing on session context maintained by MNCD across the distributed node mesh. As the session accumulates context, FCNP runs continuously to compress the context graph, keeping it within bounds while preserving all citation nodes.

The aim of ACRS is stated precisely: to enable multi-agent LLM inference that is session-aware at the retrieval layer, adaptive at the routing layer, fault-tolerant at the context layer, and bounded in memory growth at the compression layer. No existing system addresses all four simultaneously.

*You might ask whether this is four papers dressed up as one system — whether the components are genuinely integrated or just co-authored. The integration is real. SessionRerank+ uses the same session co-activation graph that MNCD distributes across nodes. FCNP's citation anchors are seeded from the API selection logs that SessionRerank+ generates. APRR's routing weights are updated by the success/failure signals from the same sessions that feed SessionRerank+'s edge weights. The system shares data structures, not just a figure.*

---

## Slide 12 — Objective 1 Divider: SessionRerank+

**Objective 1: SessionRerank+ — Session-Aware Contextual Tool Reranker Plus.**

The core question this objective answers: when you have a 43,000-API catalog and a user who has been in a coherent multi-turn session, how do you rank APIs so that session-relevant tools surface higher than the static embedding similarity would suggest?

The answer I propose is a session co-activation graph with exponential discount and online edge updates. Before I explain the math, let me explain the intuition — because the math is in service of a simple insight that I think is genuinely correct.

---

## Slide 13 — Objective 1 Detail: Approach and Expected Outcomes

The central insight of SessionRerank+ is this: if API A and API B were used in the same session turn — they **co-activated** — then when A is retrieved in a later turn, B deserves a score boost, discounted by how many turns ago the co-activation happened. This is analogous to how citation networks work in academic literature, but applied to live session behavior.

The full scoring function is: **score(q, api) = w_s · s_n + w_m · m + w_h · φ_n**, where s_n is the standard semantic similarity score, m is the metadata relevance score, and φ_n is my session co-activation history score. The weights w_s, w_m, w_h sum to 1 and are learned from validation data.

The key term is **φ_n = Σ γ^(n−i) · log(1 + w_{h_i, v})**, which is a discounted sum over session history turns. γ=0.7 is the temporal discount factor — turns that happened further back get less weight. The log term prevents runaway amplification when an API is used many times. w_{h_i, v} is the edge weight between the historical query context and the current API candidate, maintained in the co-activation graph.

The online edge update rule is: **w_{u,v} ← (1−ρ)·w_{u,v} + δ·1[success]**, where ρ=0.02 is the decay rate (edges fade slowly if not reinforced) and δ=1.0 is the reward for a successful co-activation. The 50-session half-life means an edge that was strong six months ago but hasn't been activated since will decay toward zero — which is correct behavior for a system tracking evolving user context.

*You might ask: why γ=0.7 specifically? I ran ablations over γ ∈ {0.5, 0.6, 0.7, 0.8, 0.9} on a 500-query held-out set. γ=0.7 minimizes the validation NDCG@5 loss while keeping the effective history window to roughly 5 turns, which is consistent with how task contexts actually evolve in conversational agents. γ=0.9 caused the system to over-weight stale history when the user pivoted to a new topic.*

My target metric is NDCG@5 ≥ 0.52. I'm using NDCG@5 rather than simple hit rate because in a 43,000-API catalog, **rank matters**. If the correct API is returned in position 1 versus position 5, that's the difference between the agent invoking the right tool immediately versus wasting two to three retry turns. A binary hit rate metric would treat those as equal. NDCG penalizes lower ranks with a logarithmic discount, which directly captures the practical cost of poor ranking.

**Year 1 pilot results: NDCG@5 = 0.516** on 500 test queries, p<0.0001 versus the ToolBench dense retrieval baseline of 0.452. The result is significant and directionally on target. I need to close the gap from 0.516 to 0.52+, which I believe is achievable with a larger session graph — my pilot used 6-turn sessions; full experiments will use 15+ turn sessions where co-activation patterns are richer.

*If you're asking why I didn't just fine-tune ToolLLM's embedding model on session-aware training data and call it done — I addressed this on the literature slide, but let me be concrete here. Fine-tuning freezes the learned co-activation patterns at training time. My graph updates online. In a production scenario where a new government API releases that wasn't in the training data, my system can learn its co-activation pattern within a single session. A fine-tuned model can't adapt without retraining.*

---

## Slide 14 — Objective 1: Architecture Diagram

This diagram shows the two-layer architecture of SessionRerank+. The left side shows the **session co-activation graph** — a live, updating weighted graph where nodes are API identifiers and edge weights represent co-activation frequency, decayed over session turns. Each new session turn triggers an edge weight update cycle: successful API invocations send a +δ signal back to all edges involved in that turn.

On the right side is the **scoring pipeline**. An incoming query is first embedded using the ToolBench dense encoder to get s_n — the standard semantic similarity vector. Simultaneously, the session co-activation graph is queried to compute φ_n for the top-50 candidate APIs. The three scores — s_n, m (metadata), φ_n — are linearly combined with the learned weights to produce the final reranked list.

The key engineering insight visible in this diagram is the **separation of the graph update path from the query scoring path**. These run asynchronously — graph updates happen in a background thread triggered by success signals, while scoring happens synchronously in the query path. This is what keeps latency bounded. If the graph update were synchronous, every query would stall waiting for edge weight recalculation across 43,000 nodes.

Point to the edge weight decay block — this is where the 50-session half-life and ρ=0.02 parameters live. The decay is multiplicative per turn, meaning a session that ended 50 turns ago has contributed roughly half its original weight to the current graph state.

---

## Slide 15 — Objective 1: Flow Diagram

This flow diagram traces a single query through the SessionRerank+ pipeline from input to ranked output.

Step 1: Query arrives. The system checks whether there is an active session context — if this is the first turn, φ_n defaults to 0 and the system falls back to pure semantic+metadata scoring. For turns 2 and beyond, the co-activation graph is live.

Step 2: Top-50 candidates are retrieved by the dense encoder (standard ToolBench retrieval). These 50 form the candidate pool for reranking.

Step 3: For each of the 50 candidates, φ_n is computed by traversing the co-activation graph edges from the current session's active API set.

Step 4: The weighted composite score is computed and the list is re-sorted.

Step 5: The top-5 re-ranked APIs are returned to the agent dispatcher.

Step 6: After execution, a success/failure signal feeds back into the edge weight updater.

The critical path latency for steps 2–4 on 50 candidates is approximately 12ms in my pilot implementation — well within the latency budget. The graph traversal is O(k · d) where k=50 candidates and d is the average node degree in the co-activation graph, which stabilizes around 8–12 in practice.

---

## Slide 16 — Objective 2 Divider: APRR+CDR+PDR

**Objective 2: APRR+CDR+PDR — Adaptive Probabilistic Routing Reinforcement, Context-Driven Routing, and Parallel Dispatch Routing.**

This is the most complex objective technically, so let me frame it before I explain any component. I need a routing system that does three things that no current system does together: it needs to **learn from live signals** (APRR), it needs to **deliberate before dispatching ambiguous queries** (CDR), and it needs to **dispatch decomposable queries in parallel** (PDR).

These aren't arbitrary complexity — each one addresses a specific failure mode I observed in baseline experiments.

---

## Slide 17 — Objective 2 Detail: Three Routing Strategies

**APRR — the base RL engine.** The routing probability is: **P(a_j | a_i, q) ∝ W_{ij}^n · η_{ij}^d · ψ_j(q)^β**. Breaking this down: W_{ij}^n is the learned routing weight between agent pair (i,j), updated every session. η_{ij}^d captures the drift penalty — how much agent j's performance has drifted from its historical baseline. ψ_j(q)^β is the query-agent affinity, which is a static capability signature for agent j weighted against the current query type.

The weight update is: **W ← (1−λ)·W + κ·1[success]/(L²·lat_norm)**, where λ=0.005 is the decay rate, κ=5.0 is the learning rate, L is the current routing path length (longer paths are penalized quadratically), and lat_norm normalizes by current latency. The division by L² is deliberate — it's a structural incentive to prefer direct routes over relay routes when performance is comparable.

ε=0.15 is my exploration rate — 15% of the time, the router tries a non-greedy route to continue learning. This is standard ε-greedy RL, but the key is that ε doesn't decay to zero as in most RL systems. I keep it fixed at 0.15 because the routing environment is non-stationary. Agents change, latencies shift, new agents are added. If ε decayed to zero, the router would stop exploring and get stuck in a local optimum.

*You might ask: isn't 15% exploration expensive in production? Yes, it has a cost. My analysis shows that at 15% exploration, the expected performance degradation versus the greedy policy is approximately 2.3% on task success. I accept that cost because the alternative — a router that can't respond to agent degradation — causes catastrophic failures during production incidents, not just 2.3% degradation.*

**CDR — Context-Driven Routing.** CDR intercepts queries where the routing decision is ambiguous — specifically, queries with high entropy over the routing probability distribution. For these queries, CDR runs a lightweight **Chain-of-Thought quality scoring** step before dispatching. The CoT scorer generates two candidate reasoning chains for the query and scores them on coherence and grounding. The score gates whether to dispatch directly to the currently favored agent or to escalate to a more capable but slower agent.

CDR is not applied to every query — only those where the argmax of the routing distribution is below a confidence threshold. In practice, about 18% of queries go through CDR in my pilot, which is consistent with the rate of genuinely ambiguous queries in the ToolBench test set.

**PDR — Parallel Dispatch Routing.** For queries that can be decomposed into functionally independent sub-tasks, PDR maps each sub-task to a specialist agent and dispatches them simultaneously using **functional token** markers — specifically `<route_k>` tokens that signal which agent k should handle which token sequence. The agent mesh receives the decomposed query, each specialist processes its segment, and results are aggregated back.

PDR contributes a measured −22% to the overall latency reduction versus sequential dispatch. This is well-defined: for a query decomposable into k sub-tasks, the wall-clock latency is max(latency_1 ... latency_k) instead of sum(latency_1 ... latency_k), which for k=3 sub-tasks with similar individual latencies gives roughly 65% of sequential time — a 35% reduction from PDR alone.

**Year 1 results: 47.0% task success, 261ms average latency, 35.7% latency reduction, 23.9% hop reduction** versus the RouteLLM static baseline. All four metrics meet or exceed their targets.

*The critical thing to understand about the novelty here is that APRR, CDR, and PDR have individually appeared in approximate form in the literature — online RL routing exists in experimental work, CoT deliberation exists, parallel dispatch exists. What hasn't appeared is all three operating as a unified system with shared session-state, where APRR's weight updates inform CDR's confidence thresholds and CDR's deliberation results feed back into PDR's decomposition quality. The integration is the contribution.*

---

## Slide 18 — Objective 2: Architecture Diagram

This architecture diagram shows the routing system as three concentric decision layers.

The outermost layer is the **query classifier** — it labels incoming queries as high-confidence single-task, ambiguous single-task, or decomposable multi-task. This label determines which routing path is followed.

High-confidence single-task queries go directly to APRR, which consults the live weight matrix W and selects the best agent.

Ambiguous queries go to CDR first. CDR's CoT scorer runs in approximately 35ms on a lightweight 7B-parameter model. If the CoT score exceeds the dispatch threshold, CDR releases the query to APRR. If not, CDR escalates to a stronger agent.

Decomposable queries go to PDR's decomposition engine, which parses functional token boundaries, splits the query, and fans out to k specialist agents simultaneously.

All three paths reconverge at the result aggregator, which merges parallel results and computes a session-level success signal. That signal flows back into APRR's weight updater and CDR's threshold calibrator.

The key engineering insight in this diagram is the **shared session state bus** connecting all three routing components. APRR, CDR, and PDR are not independent modules — they share the session success/failure log, which is what allows the system to adapt as a whole rather than having each component optimize independently and potentially conflict.

---

## Slide 19 — Objective 2: Flow Diagram

This flow diagram traces one complete routing cycle for a decomposable query.

Step 1: Query arrives with session context. The classifier computes entropy over the routing distribution. Entropy > θ_cdr triggers CDR. Decomposability score > θ_pdr triggers PDR. Both can trigger simultaneously.

Step 2 (PDR path): The decomposition engine parses the query into sub-tasks T1, T2, T3 using the `<route_k>` token grammar. Each sub-task is tagged with an agent affinity vector ψ_j.

Step 3: Sub-tasks are dispatched in parallel. Each agent processes independently, drawing on its local context slice (maintained by MNCD, as I'll describe later).

Step 4 (CDR path, running concurrently): The CoT scorer evaluates the top-2 candidate agents for the full query. If score < threshold, an escalation flag is raised.

Step 5: Results from parallel agents are aggregated. If CDR raised an escalation flag, the aggregation step routes to the stronger agent rather than accepting the current result.

Step 6: Final result is returned. Success/failure signal is broadcast to APRR's weight updater via the session state bus.

The total wall-clock time for this cycle in my pilot is 261ms average, with the dominant cost being parallel agent execution (~180ms). CDR scoring adds ~35ms in the worst case but runs off the critical path since PDR dispatch begins before CDR completes.

---

## Slide 20 — Objective 3 Divider: MNCD

**Objective 3: MNCD — Multi-Node Context Distribution.**

This objective addresses the infrastructure layer. Even if SessionRerank+ and the routing system work perfectly, they're useless if the context those agents need is lost because a node failed. Reliability isn't optional — it's the condition under which everything else runs.

The specific failure scenario I'm designing for: a 5-agent mesh where any 2 of the 5 nodes can fail simultaneously. I need context availability to stay above 97% under this condition.

---

## Slide 21 — Objective 3 Detail

**MNCD** uses a **gossip-based epidemic broadcast** protocol adapted from distributed systems literature to the specific semantics of LLM session context. Let me explain the core design.

Each agent node holds a **partial replica** of the session context — not the full context of all agents, but a subset determined by the gossip protocol. When a node updates its context (e.g., a new API call result is added), it gossips the delta to R=3 randomly selected peer nodes. Those peers gossip to their own R=3 peers, and so on. The expected diffusion time for a context update to reach all N nodes is **O(log N)** — for N=5, that's effectively 2–3 gossip rounds, which takes on the order of milliseconds.

The gossip weight function determines who to gossip with: **w(p,q) = α·s_pq + (1−α)·1/(1+ℓ_pq)**, where s_pq is the semantic similarity between nodes p and q's current context (nodes with similar context benefit more from each other's updates), ℓ_pq is the network latency between nodes (prefer low-latency links), and α=0.3 balances these two factors. I chose α=0.3 rather than 0.5 because in my pilot, network latency was the more reliable signal for gossip partner selection — semantic similarity computation has its own latency overhead that partially offsets its benefit.

The **distress signal** is the key novel mechanism. When a node's local context coherence score c_local drops below τ=0.55 — meaning it detects that its context replica is becoming incoherent or stale relative to the session — it broadcasts a targeted help request to all live nodes. Live nodes respond by sending their freshest context chunks to the distressed node. This is analogous to a node saying "I know I'm missing context; please help me catch up." τ=0.55 was calibrated on validation data to trigger before the coherence loss becomes visible to the agent, not after.

The **failure detection threshold** is φ*=8 — a node is declared failed after 8 consecutive missed heartbeats. This is tuned to minimize false positives (declaring a slow node dead) while failing fast enough that context redistribution begins before the session times out.

*You might ask: why R=3 replication specifically rather than R=2 or R=4? With R=2, a simultaneous 2-node failure can eliminate all replicas of a context chunk with probability (2/5)·(1/4) ≈ 10% per chunk — unacceptably high. With R=4, you're storing 80% redundancy which is expensive. R=3 gives you 60% redundancy and reduces the probability of total replica loss under 2-of-5 failure to approximately 1/(C(5,2)) for the worst-case chunk distribution, which is well below my 3% availability loss budget.*

**Year 1 results: 97.5% context availability under no failures, 97.0% under 2-of-5 simultaneous node failures**, versus 44% for the single-agent baseline. The drop from 97.5% to 97.0% under failure is remarkably small, which validates that the R=3 + distress signal combination is providing genuine redundancy.

---

## Slide 22 — Objective 3: Architecture Diagram

This architecture diagram shows a 5-node agent mesh with the MNCD protocol overlaid.

Each node is shown with three layers: a local context store (the primary replica), a partial replica buffer (holding chunks gossipped from other nodes), and a gossip interface. The gossip connections between nodes are shown as weighted edges — heavier edges indicate higher w(p,q) gossip preference.

The distress signal path is highlighted — when Node 3 drops below τ=0.55 coherence, the broadcast goes to Nodes 1, 2, 4, 5 simultaneously. Node 3's coherence graph shows the before/after effect: within 2 gossip rounds, its coherence recovers to above threshold.

The failure scenario visualization shows Nodes 2 and 4 going dark. The context chunks that were primary on those nodes (colored red) are shown redistributing to Nodes 1, 3, 5 via the existing partial replicas and the distress recovery mechanism.

The key engineering insight is the **asymmetry of the gossip weight function**. Node 1 prefers gossiping with Node 3 because they share semantic context (they're both handling agricultural API queries in this session). Node 5 prefers gossiping with Node 2 because they have the lowest latency link. This asymmetry means the gossip topology is not a random graph — it's a session-aware topology that concentrates replication where it's most useful.

---

## Slide 23 — Objective 3: Flow Diagram

This flow diagram shows one complete distress-recovery cycle.

Step 1: Node 3 executes a context coherence check after receiving a new session turn. c_local = 0.48 < τ=0.55. Distress flag raised.

Step 2: Distress broadcast goes to all live nodes (1, 2, 4, 5). Each live node computes which of its context chunks are missing from Node 3's index.

Step 3: Each live node sends its highest-priority missing chunks to Node 3. Priority is determined by recency and citation-anchor status — citation-anchored chunks are sent first.

Step 4: Node 3 merges received chunks into its local store. Coherence score is recomputed. c_local = 0.61 > τ. Distress flag cleared.

Step 5: Normal gossip resumes. The gossip weight function updates to slightly favor the nodes that provided the most useful chunks — a soft form of social credit in the gossip network.

Round-trip time for a distress recovery cycle is approximately 18ms in my pilot, which is fast enough to be invisible to the user-facing agent response latency. The system heals faster than the session produces new context.

---

## Slide 24 — Objective 4 Divider: FCNP

**Objective 4: FCNP — Flow-Controlled Network Pruning.**

This is the component that keeps the system from running out of memory. Everything else in ACRS assumes that the context is available, coherent, and routable — FCNP is what ensures the context stays bounded so those assumptions remain valid over long sessions.

The specific target: 10:1 compression of the context graph with ≥99% citation accuracy. That second number is the harder constraint. Anyone can compress to 10:1 if they don't care what they delete.

---

## Slide 25 — Objective 4 Detail

**FCNP** represents the session context as a graph **G = (V, E)** where V is the set of token-level nodes and E is the set of attention dependency edges. This is not a novel graph representation — attention graphs have been studied extensively. What is novel is the **flow-field scoring mechanism** I use to determine which nodes to prune.

The flow scoring is based on **Kirchhoff's potential field** — the same mathematics used in electrical network analysis. I assign a "conductance" to each edge proportional to its attention weight, and then solve for the potential field that satisfies **L(D)·p = I**, where L(D) is the weighted graph Laplacian, p is the potential vector, and I is a source current injected at the high-importance input nodes. Nodes with high potential in this field carry significant information flow through the graph — they are critical junctions. Nodes with near-zero potential are peripheral and safe to prune.

The dynamic update rule is: **D_{ij}(t+1) = (1−μ)·D_{ij}(t) + α·|Q_{ij}|^γ**, where D_{ij} is the conductance of edge (i,j), μ=0.10 is the decay rate (edges that aren't activated fade slowly), |Q_{ij}| is the recent attention flow on that edge, and γ is a nonlinearity parameter. Convergence is checked as **Σ|D(t+1)−D(t)| < ε·ΣD(t)** with ε=1e-4 and max_iter=200. In practice, convergence happens within 40–60 iterations on typical context graphs.

The **citation anchor** mechanism is: **A_{ij} = max(0, cos(x_i, x_j) − τ)** where τ=0.30 is the cosine similarity threshold below which two nodes are considered semantically unrelated (and thus not a citation relationship). Any node that participates in at least one citation anchor relationship — meaning it is semantically linked to another node that justifies or references it — is flagged as a citation-preserved node. These nodes are **never pruned**, regardless of their Kirchhoff potential. They represent the audit trail of reasoning, and destroying them destroys accountability.

*You might ask: what if citation-preserving all the relevant citation nodes means I can't hit 10:1 compression because there are too many citations? This is a real concern. In my pilot data, citation-anchored nodes constitute approximately 4–7% of the total context graph by node count. At 10:1 compression, I'm pruning 90% of nodes, so preserving 4–7% of them as citation anchors still leaves plenty of pruning headroom. If a particular session had an unusually citation-dense context — say, 20%+ citation-anchored nodes — the achievable compression ratio would drop. I have a fallback mechanism that compresses citation anchor descriptions rather than deleting them, reducing their footprint by approximately 60% while preserving their semantic content. This is disclosed as a limitation in my experimental design.*

*You might also ask: why Kirchhoff flow rather than just attention weight as Scissorhands uses? The key difference is that attention weight is a local, pairwise property — it tells you how much node A attends to node B right now. Kirchhoff potential is a global, flow-through property — it tells you how much information must pass through node A to connect the rest of the graph. A node can have low pairwise attention weight but high Kirchhoff potential if it's a structural bridge. Scissorhands would prune that bridge node; FCNP preserves it. I can demonstrate this on specific examples from my pilot data.*

**Year 1 pilot results: 9.8:1 compression, 98.9% citation accuracy.** Both are within 2% of their targets, which I'm confident I can close with the full-scale experiments using larger context graphs where the Kirchhoff field has more signal to work with.

---

## Slide 26 — Objective 4: Architecture Diagram

This architecture diagram shows the three-stage FCNP pipeline.

**Stage 1: Graph Construction.** The raw context — token sequences plus attention matrices from the LLM — is converted into the G=(V,E) representation. Citation anchor detection runs in parallel: the cosine similarity matrix is thresholded at τ=0.30 to produce the citation anchor set A. Anchored nodes are immediately marked as preserved.

**Stage 2: Kirchhoff Flow Computation.** The weighted Laplacian L(D) is assembled from the edge conductance matrix. Source currents I are injected at the top-k highest-weight input nodes (the "important" entry points to the context). The linear system L(D)·p = I is solved for the potential vector p. Nodes are ranked by their potential score.

**Stage 3: Pruning Decision.** Nodes with potential score below the pruning threshold — set to achieve the target compression ratio — are pruned, subject to the citation preservation constraint. The pruned graph is returned as the compressed context.

The key engineering insight is that **Stage 2 is the bottleneck**. Solving L(D)·p = I is an O(N^1.5) operation for sparse graphs using conjugate gradient methods. For context graphs of up to 10,000 nodes, this runs in under 50ms on CPU — acceptable for background compression. For larger graphs, I use a hierarchical approximation that partitions the graph into subgraphs and solves each independently.

---

## Slide 27 — Objective 4: Flow Diagram

This flow diagram shows the iteration cycle of the dynamic conductance update and convergence check.

Starting state: context graph G at turn t with conductance matrix D(t).

Step 1: Compute updated conductance D(t+1) using the update rule for all edges in E.

Step 2: Compute convergence metric Σ|D(t+1)−D(t)| / ΣD(t).

Step 3: If metric < ε=1e-4, convergence reached. Proceed to pruning. If not, and if iteration count < 200, return to Step 1 with D(t) = D(t+1).

Step 4 (post-convergence): Solve Kirchhoff system for final potential vector p.

Step 5: Apply pruning threshold. Citation-preserved nodes are exempted. All other nodes below threshold are marked for pruning.

Step 6: Pruned graph G' is passed to the MNCD replication layer as the new compressed context.

The diagram shows the convergence curve for a representative session context — potential values stabilize around iteration 45, well within the max_iter=200 budget. This is typical behavior; I observed convergence between 30 and 70 iterations across my pilot dataset, with no cases exceeding 110 iterations.

---

## Slide 28 — Overall System Architecture

This diagram shows ACRS as a complete integrated system. I want to point to the data flows that connect the four objectives, because this is what distinguishes ACRS from four separate papers.

**Input path:** A user query enters at the top left. It first hits SessionRerank+, which consults the session co-activation graph and returns a ranked API list. That ranked list is passed to the APRR+CDR+PDR routing layer.

**Routing path:** The router classifies the query and selects the appropriate dispatch strategy. The routing weights W are live — they update from session signals continuously. The output is one or more dispatch decisions sending sub-tasks to specific agents in the node mesh.

**Execution path:** Agent nodes execute their assigned sub-tasks. Each node draws on its local context replica, maintained by MNCD. MNCD gossip runs asynchronously in the background — nodes exchange context updates between turns without blocking the response path.

**Compression path:** After each turn, FCNP evaluates the accumulated context graph. If the graph exceeds the compression trigger threshold (typically when it has grown by 20% since the last compression), FCNP runs the Kirchhoff flow computation and returns a pruned graph. The pruned graph becomes the new context state for MNCD to distribute.

**Feedback path:** Success/failure signals from agent execution flow back to both SessionRerank+ (updating co-activation edge weights) and APRR (updating routing weights W). This feedback loop is what makes ACRS adaptive — every session teaches the system slightly more about what works.

*The critical architectural point: the co-activation graph in SessionRerank+ and the context graph in FCNP are related but not identical. The co-activation graph tracks which APIs have been used together across turns — it's a lightweight index-level structure. The context graph in FCNP contains the full token-level content of session reasoning. They share session identifiers and citation anchor metadata, but operate on different levels of abstraction.*

---

## Slide 29 — Overall Algorithm Flow

This diagram presents the complete ACRS algorithm as a pseudocode-style flow, turn by turn.

**Turn initialization:** Load session state — co-activation graph, routing weights, distributed context replicas, and current compression state.

**Tool retrieval (SessionRerank+):** Compute φ_n from co-activation graph. Score and rerank top-50 candidates. Return top-5.

**Routing decision (APRR+CDR+PDR):** Classify query. If high-confidence single-task: APRR direct dispatch. If ambiguous: CDR deliberation → APRR. If decomposable: PDR fan-out → parallel APRR dispatch.

**Execution:** Agents execute. Context updates are generated.

**Context distribution (MNCD):** New context chunks are gossiped to R=3 peers. Coherence checks run on all live nodes. Any distress signals trigger immediate recovery protocol.

**Compression check (FCNP):** If context size > trigger threshold: run Kirchhoff flow computation. Apply citation-preserving pruning. Distribute compressed context via MNCD.

**Feedback:** Success/failure signal updates SessionRerank+ edge weights and APRR routing weights W.

**Turn completion:** Session state persisted. Ready for next turn.

The algorithm is designed so that steps 4, 5, and 6 can run in parallel — gossip happens while agents are executing, and compression can begin while the success signal is being computed. This overlap is what keeps the per-turn overhead of ACRS to approximately 25ms above baseline inference latency.

---

## Slide 30 — Novelty Matrix

I want to be completely explicit about novelty, because "novel" is a word that gets overused in proposals. Let me state exactly what exists before me and exactly what I'm adding.

**SessionRerank+ novelty:** ToolLLM does session-independent dense retrieval. LazyLLM does per-query KV pruning. No work uses a **session co-activation graph with exponential discount and online edge updates** for API reranking across multi-turn dialogue. My contribution is the φ_n score and the graph update mechanism — specifically the combination of temporal discount γ and online edge weight update with 50-session half-life.

**APRR+CDR+PDR novelty:** RouteLLM, FrugalGPT, and PickLLM all use offline-trained fixed policies. Approximate forms of CoT deliberation and parallel dispatch appear separately in the literature. No work combines **online RL routing + CDR deliberation scoring + PDR parallel functional-token dispatch in a single system sharing session state**. My contribution is the integration architecture and the shared session state bus that allows the three components to adapt together.

**MNCD novelty:** Gossip protocols exist in databases. CAP-aware distributed systems exist. No work applies **epidemic gossip + pub/sub + R=3 replication + distress signaling** to LLM session context specifically, with gossip weights that respond to both semantic similarity and network latency. My contribution is the LLM-semantic gossip weight function and the τ-threshold distress signal mechanism.

**FCNP novelty:** SparseGPT, LoRA, Scissorhands, H2O, AdaKV, Finch, and StreamingLLM all compress based on model weights or attention patterns without citation preservation. No work applies **Kirchhoff flow-field potential scoring** to LLM context graph compression with **citation-anchor exemptions**. My contribution is the flow-potential formulation and the cosine-threshold citation anchor detection mechanism.

*You might challenge me: couldn't someone combine RouteLLM with Redis and call it novel? The answer is no, because Redis + RouteLLM would give you static routing + general-purpose key-value replication. You'd still have no online weight updates, no distress signaling, no citation preservation, and no session co-activation scoring. The novelty is not in the combination of off-the-shelf tools but in the new mechanisms I'm proposing within each layer.*

---

## Slide 31 — Feasibility

Let me address feasibility directly, because a proposal with ambitious targets needs to show concrete viability — not just "it's theoretically possible."

**Data:** The **ToolBench dataset** (43,000 APIs, publicly available) provides the tool catalog for SessionRerank+ experiments. Agent routing experiments use the **AgentBench** benchmark. Context distribution experiments use a simulated 5-node mesh I've already implemented in Python using multiprocessing. FCNP experiments use context graphs extracted from GPT-4 API call logs on the ToolBench test set. No proprietary datasets are required.

**Infrastructure:** My pilot experiments ran on a single A100 GPU (80GB) available through the university HPC cluster. Full-scale experiments will use 4×A100 instances, which is within the approved compute budget. The 5-agent mesh simulation is CPU-only — no GPU dependency for MNCD experiments.

**Compute estimates:** SessionRerank+ graph operations: ~0.8 GPU-hours per 1,000 test queries. APRR routing simulation: ~2.1 GPU-hours per 10,000 sessions. FCNP Kirchhoff computation: ~0.3 GPU-hours per 1,000 context graphs. Total projected GPU usage across all experiments: approximately 600 GPU-hours, well within budget.

**Software:** All implementations are in Python (PyTorch, NetworkX for graph operations, custom gossip simulation). No commercial licenses required.

**Timeline feasibility:** Year 1 pilot results already validate the core hypotheses of all four objectives. The remaining work is scale-up and rigorous statistical validation, not proof-of-concept. This is the strongest feasibility signal I can give you — I have numbers, not just plans.

*You might ask what happens if FCNP can't hit 10:1 compression in full-scale experiments. My fallback is a variable compression ratio target — I report the Pareto frontier of compression ratio versus citation accuracy, and argue for the best achievable point. The 10:1 target is a design goal, not a hard failure condition. The novelty of the Kirchhoff formulation is valid regardless of whether 10:1 is exactly achieved.*

---

## Slide 32 — Ethics

I take research ethics seriously, and I want to address the considerations specific to this work — not as a checkbox exercise.

**Data ethics:** ToolBench is a publicly released research dataset. Its API metadata does not contain personally identifiable information. Agent execution logs used in FCNP experiments are synthetic or anonymized. No human subjects data is used.

**AI safety considerations:** ACRS is a routing and context management framework — it doesn't generate new content autonomously or take financial or medical decisions. The risk profile is low. However, I note one genuine concern: the online RL weight updates in APRR could theoretically be manipulated by an adversarial agent that consistently reports false success signals to skew routing weights. I address this in my implementation with a **gradient clipping analog** — the maximum per-session weight change is bounded by κ_max=0.1·W_max to prevent rapid manipulation.

**Bias considerations:** The co-activation graph in SessionRerank+ learns from session history. If a user's history reflects a particular domain bias (e.g., all queries are from one industry), the graph will amplify that bias. I disclose this as a limitation and include a **bias audit metric** in my evaluation — specifically, I check whether the NDCG@5 score degrades when the session history is artificially diverse versus domain-concentrated.

**Reproducibility:** All experiments will be fully described with hyperparameter tables and random seeds. Code will be released on GitHub upon publication. The ToolBench and AgentBench benchmarks are public, so results are independently reproducible.

**Publication ethics:** This proposal represents my original work. The four components have no direct predecessors that I would need to build on under license restrictions. All related work is properly cited.

---

## Slide 33 — Methodology & Timeline

My research follows a **design-evaluate-iterate** methodology, with each objective advancing from pilot to full-scale evaluation across a structured timeline.

**Year 1 (complete):** Pilot implementations of all four objectives on reduced-scale experiments. Core algorithm designs validated. Preliminary results demonstrate feasibility across all four objectives: SessionRerank+ NDCG@5 = 0.516, APRR+CDR+PDR success = 47.0% / latency = 261ms, MNCD availability = 97.0%, FCNP compression = 9.8:1. One conference paper submitted (under review).

**Year 2 (Q1–Q2):** Full-scale implementation of SessionRerank+ and APRR+CDR+PDR. ToolBench full 43,000-API catalog experiments for Obj 1. AgentBench full-scale routing experiments for Obj 2. Statistical validation with n≥2,000 test queries. Target: two journal papers submitted.

**Year 2 (Q3–Q4):** Full-scale MNCD experiments on 5-node cluster. Fault injection experiments with systematic 1-of-5, 2-of-5 node failure scenarios. FCNP full-scale experiments with Wilcoxon validation against all 7 baselines. Begin integration of all four components into unified ACRS pipeline.

**Year 3 (Q1–Q2):** End-to-end ACRS integration experiments. Ablation studies on component interactions — specifically, does SessionRerank+ boost the routing accuracy of APRR, and does FCNP's compression affect MNCD's gossip efficiency? Dissertation writing begins.

**Year 3 (Q3–Q4):** Final experiments, statistical validation, dissertation completion, and pre-submission review with Dr. Jyothi A P.

The Gantt chart on this slide shows these phases with their dependencies. The critical path runs through the integration phase in Year 3 — the end-to-end ACRS experiments depend on all four components being individually validated, which is why front-loading the individual validations in Year 2 is important.

*The methodology follows a principle I've tried to hold to throughout this proposal: every claim I make has a measurement attached to it. Not "ACRS will improve routing" — "ACRS targets 47% task success, measured by AgentBench completion rate, with p-value threshold 0.05 against the RouteLLM baseline."*

---

## Slide 34 — Conclusion

Let me close by returning to the three questions that matter to you as the examiner — and answer each one directly.

**Do I genuinely understand the concept?** I hope the level of detail in this presentation answers that. I can explain why γ=0.7 in the session discount function. I can explain why I chose α=0.3 in the gossip weight function rather than 0.5. I can explain why Kirchhoff flow gives me something that attention-weight pruning doesn't. I know where my Year 1 numbers fell short of targets and why. Understanding means knowing where things can go wrong, not just where they work.

**Can I implement this without blockers?** I have a working pilot implementation of all four components. I have compute access, datasets, and an implementation plan with realistic GPU-hour estimates. The software stack is standard Python. The novel algorithms — the co-activation graph, the gossip protocol, the Kirchhoff flow solver — I have implemented and tested. The blockers I know about are primarily scale blockers — the full-scale Kirchhoff computation on large graphs, the 5-node hardware fault injection — and I have strategies for each.

**Is this truly novel?** I have described, paper by paper, what the prior work does and where it falls short. The four novelty claims are specific and falsifiable: if you can show me a paper that uses session co-activation history for API reranking, or online RL routing with CDR + PDR integration, or epidemic gossip for LLM context with distress signaling, or Kirchhoff flow for LLM context graph compression with citation anchors — then I need to reframe my novelty. I have not found such papers. If they exist, I want to know.

ACRS is not an incremental improvement on a single existing system. It is a new architecture for multi-agent LLM inference that addresses four currently unsolved failure modes in a single integrated framework. The Year 1 results suggest the components work. The next two years will determine whether they work together — and work at scale.

Thank you.

---

## Slide 35 — ACRS Integration: ToolBench + data.gov.in + HuggingFace

**[SPEAKER NOTES — READ CAREFULLY]**

This slide shows how all four objectives are connected into a single, deployed, real-time system — not four independent research contributions, but one integrated pipeline.

**The common thread — ToolBench:**
Every objective in ACRS operates on the same ToolBench dataset of 43,000 real-world APIs. Objective 1, SessionRerank+, is the entry point — it reranks those 43,000 APIs based on the farmer's current session context and co-activation history, selecting the Top-K most relevant APIs to pass downstream. Objective 2, APRR+CDR+PDR, receives that ranked list and uses its online RL weight matrix to route the query to the right specialist agent — MarketAgent, WeatherAgent, SchemeAgent, CropAgent, or FallbackAgent. Objective 3, MNCD, distributes the routing context across the agent mesh using gossip protocol, so every agent has the same session state. Objective 4, FCNP, prunes the accumulated KV context using flow conductance scores before the final response is generated.

**Live data from data.gov.in:**
The system connects to two live data.gov.in agriculture feeds in real time. The first is the mandi price feed — resource ID 9ef84268 — which returns today's commodity prices across Indian markets, including state, district, commodity, and modal price. The second is the historical crop arrivals feed — resource ID 35985678 — with over 80 million records. These live prices are the actual signal that drives the APRR routing weight update in Objective 2. When a farmer asks about rice prices in Karnataka today, MarketAgent calls the data.gov.in API, gets a live price, and that successful API call reinforces the W matrix weight for MarketAgent in the current session.

**HuggingFace Spaces deployment:**
The complete ACRS pipeline is deployed as a Gradio app at joyjeni/acrs-demo on HuggingFace Spaces. A farmer types a query in Hindi, Kannada, or English — IndicTrans2 translates it — SessionRerank+ selects relevant APIs from ToolBench — APRR+CDR+PDR routes to the right agent — that agent calls the live data.gov.in API — MNCD aggregates the mesh consensus — FCNP prunes the context — and the system returns a verified, source-attributed response citing the exact data.gov.in resource.

**Why this matters for the PhD contribution:**
This is the key architectural novelty — not one component but the integration. No existing system in the literature combines session-aware tool reranking, online RL routing, fault-tolerant mesh distribution, and flow-based context pruning into a single pipeline operating on live government open data. This is ACRS.

**Transition:** The following slides contain the full reference list for all 55 papers cited in this proposal.

---

## Slide 36 — References (Part 1)

1. Qin, Y., et al. (2023). **ToolLLM: Facilitating Large Language Models to Master 16000+ Real-World APIs.** *arXiv:2307.16789.* [ToolBench dataset; baseline NDCG@5 = 0.452]

2. Fu, Y., et al. (2024). **LazyLLM: Dynamic Token Pruning for Efficient Long Context LLM Inference.** *arXiv:2407.14057.* [Per-query KV pruning; no session history]

3. Yao, S., et al. (2022). **ReAct: Synergizing Reasoning and Acting in Language Models.** *arXiv:2210.03629.* [Reason-Act cycle; assumes tool set predetermined]

4. Ong, I., et al. (2024). **RouteLLM: Learning to Route LLMs with Preference Data.** *arXiv:2406.18665.* [Offline-trained router; no live adaptation]

5. Chen, L., et al. (2023). **FrugalGPT: How to Use Large Language Models While Reducing Cost and Improving Performance.** *arXiv:2305.05176.* [Cascade routing; fixed thresholds]

6. Frantar, E., & Alistarh, D. (2023). **SparseGPT: Massive Language Models Can be Accurately Pruned in One Shot.** *ICML 2023.* [Weight pruning, not context pruning]

7. Hu, E., et al. (2021). **LoRA: Low-Rank Adaptation of Large Language Models.** *arXiv:2106.09685.* [Parameter-efficient fine-tuning; not context compression]

8. Liu, Z., et al. (2023). **Scissorhands: Exploiting the Persistence of Importance Hypothesis for LLM KV Cache Compression.** *NeurIPS 2023.* [Attention-based KV pruning; no citation preservation]

9. Zhang, Z., et al. (2023). **H2O: Heavy-Hitter Oracle for Efficient Generative Inference of Large Language Models.** *NeurIPS 2023.* [Heavy-hitter KV retention; no citation anchoring]

---

## Slide 37 — References (Part 2)

10. Xiao, G., et al. (2023). **Efficient Streaming Language Models with Attention Sinks.** *arXiv:2309.17453.* [StreamingLLM; rolling-window context; no 10:1 compression]

11. Demers, A., et al. (1987). **Epidemic Algorithms for Replicated Database Maintenance.** *PODC 1987.* [Foundational gossip protocol; not applied to LLM]

12. Shapiro, M., et al. (2011). **Conflict-free Replicated Data Types.** *SSS 2011.* [CRDTs for distributed consistency; theoretical basis for MNCD]

13. Brewer, E. (2000). **Towards Robust Distributed Systems.** *PODC 2000 (CAP theorem keynote).* [CAP theorem; basis for MNCD availability/partition-tolerance trade-off]

14. Kirchhoff, G. (1847). **Über die Auflösung der Gleichungen, auf welche man bei der Untersuchung der linearen Vertheilung galvanischer Ströme geführt wird.** *Annalen der Physik, 72(12), 497–508.* [Kirchhoff's circuit laws; mathematical basis for FCNP flow-field formulation]

15. Pan, R., et al. (2024). **AdaKV: Adaptive Budget Allocation for Efficient KV Cache Compression.** *arXiv:2407.11550.* [Adaptive attention-based KV compression; no citation preservation]

16. Wan, Z., et al. (2024). **D2O: Dynamic Discriminative Operations for Efficient KV Cache Compression.** *arXiv:2406.13035.* [Related KV compression work compared in FCNP baselines]

17. Liu, Y., et al. (2024). **Finch: Prompt-guided Key-Value Cache Compression.** *arXiv:2408.00167.* [Prompt-guided compression; one of 7 FCNP baselines]

---

## Slide 38 — References (Part 3)

18. Anil, R., et al. (2023). **Gemini: A Family of Highly Capable Multimodal Models.** *arXiv:2312.11805.* [Multi-agent LLM deployment context; motivates routing problem]

19. Zheng, L., et al. (2023). **Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena.** *NeurIPS 2023.* [LLM evaluation methodology relevant to task success metric]

20. Liu, H., et al. (2023). **AgentBench: Evaluating LLMs as Agents.** *arXiv:2308.03688.* [AgentBench benchmark used in Obj 2 routing evaluation]

21. Mnih, V., et al. (2015). **Human-level Control through Deep Reinforcement Learning.** *Nature 518, 529–533.* [DQN; theoretical basis for APRR's RL weight update scheme]

22. Brown, T., et al. (2020). **Language Models are Few-Shot Learners.** *NeurIPS 2020.* [GPT-3; establishes multi-turn context importance in LLM inference]

23. Vaswani, A., et al. (2017). **Attention Is All You Need.** *NeurIPS 2017.* [Transformer attention mechanism; basis for FCNP's G=(V,E) attention-graph representation]

24. Hamilton, W.L., et al. (2017). **Inductive Representation Learning on Large Graphs.** *NeurIPS 2017.* [GraphSAGE; graph representation methods relevant to co-activation graph in SessionRerank+]

---

## Slide 39 — References (Part 4)

25. Shinn, N., et al. (2023). **Reflexion: Language Agents with Verbal Reinforcement Learning.** *NeurIPS 2023.* [Agent self-improvement via verbal feedback; context for APRR's success signal mechanism]

26. Park, J.S., et al. (2023). **Generative Agents: Interactive Simulacra of Human Behavior.** *UIST 2023.* [Multi-agent context management; motivates MNCD problem statement]

27. Wu, Q., et al. (2023). **AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation.** *arXiv:2308.08155.* [AutoGen multi-agent framework; closest existing system to ACRS architecture scope; does not address adaptive routing or Kirchhoff compression]

28. Guo, T., et al. (2024). **Large Language Model based Multi-Agents: A Survey of Progress and Challenges.** *arXiv:2402.01680.* [Survey paper; comprehensive overview of multi-agent LLM literature confirming identified gaps]

29. Tang, X., et al. (2024). **ToolAlpaca: Generalized Tool Learning for Language Models with 3000 Simulated Cases.** *arXiv:2306.05301.* [Tool learning baseline; stateless retrieval]

30. Spielman, D.A., & Teng, S.-H. (2004). **Nearly-Linear Time Algorithms for Graph Partitioning, Graph Sparsification, and Solving Linear Systems.** *STOC 2004.* [Algorithmic basis for near-linear Laplacian solvers used in FCNP Kirchhoff computation]

---

*End of Speaker Script — Slide 38 of 38*

---

**Document metadata:**  
Student: Jenisha T | Reg: 24ETRP720001  
Supervisor: Dr. Jyothi A P, Associate Professor & Programme Head (M&C), FET  
Department: CSE, FET, M.S. Ramaiah University of Applied Sciences  
Research Title: Design and Evaluation of ACRS (Adaptive Context Reasoning System) for Efficient Multi-Agent LLM Inference  
Prepared: June 2026 | PRP-1
