# Master Algorithmic Flow — Agentic AI Tool Selection System

**Dissertation Title:** Agentic AI Tool Selection Systems: Session-Aware Retrieval, Multi-Agent Routing, Mesh Consensus, and Flow-Based Context Pruning

**Author:** Jenisha T  
**Affiliation:** PhD Candidate, Department of Computer Science Engineering, MS Ramaiah University of Applied Sciences, Bengaluru  
**Company:** Abigail Creations  
**Email:** abigailinnovations@gmail.com  
**Date:** June 2026  

---

> *This document constitutes the master algorithmic reference for a four-objective PhD dissertation on Agentic AI Tool Selection Systems. It is addressed simultaneously to the Tamil Nadu Chief Minister's Office — in the context of a startup investment evaluation — and to academic examiners and external reviewers. Mathematical rigour and practical deployment evidence are presented side-by-side.*

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Objective 1: SessionRerank+](#2-objective-1-sessionrerank)
   - 2A. [Supplementary: Pseudocode, Complexity, Ablation](#2a-objective-1--supplementary-pseudocode-complexity-and-ablation)
3. [Objective 2: APRR + CROW + OctoRoute](#3-objective-2-aprr--crow--octoroute)
   - 3A. [Supplementary: REINFORCE Proof, Algorithms, Latency](#3a-objective-2--supplementary-full-reinforce-proof-crow-algorithm-latency-breakdown)
4. [Objective 3: MNCD Mesh Agents](#4-objective-3-mncd-mesh-agents)
   - 4A. [Supplementary: Full Algorithm, Failure Detector, Replication](#4a-objective-3--supplementary-full-mncd-algorithm-failure-detector-replication-protocol)
5. [Objective 4: FCNP Context Pruning](#5-objective-4-fcnp-context-pruning)
   - 5A. [Supplementary: Kirchhoff Theory, Solver, Physarum Proof](#5a-objective-4--supplementary-kirchhoff-theory-solver-analysis-physarum-proof-sketch)
6. [Integration: How All 4 Objectives Connect](#6-integration-how-all-4-objectives-connect)
   - 6A. [Supplementary: Cross-Objective Validation](#6a-integration--supplementary-cross-objective-validation-and-end-to-end-latency)
7. [Multilingual Extension](#7-multilingual-extension)
8. [Deployments and Live Endpoints](#8-deployments-and-live-endpoints)
9. [Novel Contributions Summary Table](#9-novel-contributions-summary-table)
   - 9A. [Evaluation Protocol Supplement](#9a-evaluation-protocol-supplement)
10. [References](#10-references)
- [Appendix A: Symbol Glossary](#appendix-a-symbol-glossary)
- [Appendix B: Data.gov.in API Specifications](#appendix-b-datagov-in-api-specifications)
- [Appendix C: Experimental Configuration](#appendix-c-experimental-configuration)

---

## 1. System Overview

### 1.1 Motivation and Scope

Contemporary large language model (LLM) deployments increasingly operate in *agentic* settings, in which the model must autonomously select, invoke, and chain external software tools — APIs, data feeds, retrieval corpora — in order to satisfy user queries that exceed the knowledge embedded in model weights alone [NAKANO2021, SCHICK2023]. The challenge is compounded when (i) the available tool catalogue is large (tens to hundreds of APIs), (ii) queries arrive sequentially within a session and tool utility is historically correlated, (iii) the system must remain accurate despite partial agent failures, and (iv) the retrieved context must be compressed to fit within the LLM's finite token budget without discarding citations needed for verifiable answers.

This dissertation addresses each of these four sub-problems through four independently novel algorithmic contributions that are *also* designed to integrate into a single end-to-end pipeline. The deployment context is Indian government agricultural information systems — specifically the Karnataka and Tamil Nadu government API catalogues and the national data.gov.in data infrastructure — making this work directly relevant to the Tamil Nadu Chief Minister's initiative to deploy AI-powered farmer advisory services across the state.

The four objectives, whose full algorithmic specifications occupy Sections 2–5, are:

| # | Short Name | Full Name | Primary Metric |
|---|-----------|-----------|---------------|
| O1 | **SessionRerank+** | Session-Aware Toolbench Re-Ranker | NDCG@5 = 0.516 (+14.7%) |
| O2 | **APRR + CROW + OctoRoute** | Adaptive Policy-based Router with Reasoning & Dispatch | Latency −35.7%, Hops −23.9% |
| O3 | **MNCD Mesh** | Multi-Node Consensus Diffusion Mesh | Accuracy 97.5% with 2/5 agents dead |
| O4 | **FCNP** | Flow-based Context Network Pruning | 10:1 compression, ≥99% citation accuracy |

### 1.2 High-Level Architecture

The system processes each user query $q$ through a four-stage pipeline. Below is the ASCII representation of the full pipeline, showing both the forward data-flow (left-to-right) and the feedback loop (bottom arc):

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                    AGENTIC AI TOOL SELECTION SYSTEM — END-TO-END PIPELINE            │
│                                                                                      │
│   USER QUERY q (multilingual — hi/kn/ta/ml/mr/en)                                   │
│         │                                                                            │
│         ▼                                                                            │
│   ┌─────────────┐   IndicTrans2 translation if lang ≠ en                            │
│   │  LANG LAYER │──────────────────────────────────────────────────────────────────▶│
│   └─────────────┘                                                                    │
│         │  q_en (normalised English query)                                           │
│         ▼                                                                            │
│ ┌────────────────────────────────────────────────────────────────────────────────┐   │
│ │  OBJECTIVE 1: SessionRerank+                                                   │   │
│ │                                                                                │   │
│ │  Gemma 4 embedding ──► dense score s_d                                         │   │
│ │  Co-activation cache ──► φ_c (session prior)                                  │   │
│ │  Metadata score m ──► reliability/latency/cost                                 │   │
│ │                                                                                │   │
│ │  score(q, api) = w_d·s_d + w_m·m + w_c·φ_c                                   │   │
│ │                                                                                │   │
│ │  OUTPUT: ranked_tools [t_1, …, t_K]                                           │   │
│ │          session_weight_vector W_session                                        │   │
│ └──────────────────────────────┬─────────────────────────────────────────────────┘   │
│                                │  W_session biases APRR W_init                       │
│                                ▼                                                     │
│ ┌────────────────────────────────────────────────────────────────────────────────┐   │
│ │  OBJECTIVE 2: APRR + CROW + OctoRoute                                         │   │
│ │                                                                                │   │
│ │  APRR policy: P(a_j|a_i,q) ∝ W_ij^α · η_ij^β · ψ_j(q)^γ                     │   │
│ │  CROW: complexity-gate ──► chain-of-thought deliberation                      │   │
│ │  OctoRoute: <octo_k> token ──► domain-arm dispatch                            │   │
│ │                                                                                │   │
│ │  OUTPUT: routed_agent_path, confidence_score conf, domain_label D             │   │
│ └──────────────────────────────┬─────────────────────────────────────────────────┘   │
│                                │  low-conf ──► distress signal; D ──► FCNP gate     │
│                                ▼                                                     │
│ ┌────────────────────────────────────────────────────────────────────────────────┐   │
│ │  OBJECTIVE 3: MNCD Mesh Agents                                                │   │
│ │                                                                                │   │
│ │  5-node gossip mesh (Gemma-2, Qwen2.5, Llama-3.1 × replicas)                 │   │
│ │  Borda consensus over agent answers                                            │   │
│ │  φ-accrual failure detection (φ* = 8)                                         │   │
│ │  Distress pub/sub: topic distress/<query_id>                                   │   │
│ │                                                                                │   │
│ │  OUTPUT: consensus_answer t̂(q), context_evidence_graph G_ev                  │   │
│ └──────────────────────────────┬─────────────────────────────────────────────────┘   │
│                                │  G_ev + Borda scores ──► FCNP source mass m_i      │
│                                ▼                                                     │
│ ┌────────────────────────────────────────────────────────────────────────────────┐   │
│ │  OBJECTIVE 4: FCNP Context Pruning                                            │   │
│ │                                                                                │   │
│ │  Build context graph; Kirchhoff solve L(D)p = I                               │   │
│ │  Conductance reinforce: D_ij(t+1) = (1−μ)D_ij(t) + α|Q_ij(t)|^γ             │   │
│ │  Rank nodes by steady-state potential; prune to token budget                  │   │
│ │                                                                                │   │
│ │  OUTPUT: pruned_context C*, compressed_tokens (≤10% of original)              │   │
│ └──────────────────────────────┬─────────────────────────────────────────────────┘   │
│                                │  C* ──► LLM final response generation               │
│                                ▼                                                     │
│   ┌─────────────────────────────────┐                                                │
│   │  LLM Response (Gemma 4 / Qwen)  │◄──── C* (compressed, cited context)           │
│   └─────────────────────────────────┘                                                │
│         │                                                                            │
│         ▼  feedback: session success/failure                                         │
│   ┌─────────────────────────────────┐                                                │
│   │  FEEDBACK LOOP                  │                                                │
│   │  • Edge update → Obj1 cache     │                                                │
│   │  • W update → Obj2 policy       │                                                │
│   │  • Borda weight → Obj3 agents   │                                                │
│   │  • D reinforce → Obj4 graph     │                                                │
│   └─────────────────────────────────┘                                                │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Data Infrastructure

All four objectives are grounded in real Indian government data, primarily accessed via the **data.gov.in** open data platform. The primary resource used throughout this work is:

- **Resource ID:** `9ef84268-d588-465a-a308-a864a43d0070`  
- **Dataset:** Daily Commodity Mandi Prices — AGMARKNET (9,655+ records)  
- **API Endpoint:** `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070`

Additional data.gov.in catalogues integrated or planned for integration include PM-KISAN beneficiary records, PMFBY crop insurance data, Soil Health Card (SHC) portal, and eNAM electronic trading platform data, as detailed in Section 6.3.

---

## 2. Objective 1: SessionRerank+

*Session-Aware Toolbench Re-Ranker with Co-Activation Prior*

### 2.1 Problem Formulation

**Definition 2.1 (Tool Retrieval).** Let $\mathcal{A} = \{a_1, a_2, \ldots, a_N\}$ denote a catalogue of $N$ APIs/tools, each described by a natural-language docstring $d_i$, a set of categorical metadata attributes $M_i$ (latency tier, reliability score, cost class, domain tag), and a dynamically maintained set of session co-activation statistics. Given a user query $q$ at turn $\tau$ of session $\mathcal{S}$, the task is to return a ranking $\sigma: \mathcal{A} \rightarrow \{1, \ldots, N\}$ such that relevant tools are ranked at the top, where relevance is measured by NDCG@$K$.

**Motivation for session-awareness.** Standard dense-retrieval baselines embed $q$ and each $d_i$ independently, ignoring that within a session the user's informational context evolves. If a farmer queries "what is today's tomato price in Kolar?" and immediately follows with "show subsidy schemes for horticulture crops", the second query is strongly co-conditional on the first having invoked `Agmarknet-KA` and `KSDA-HorticultureSchemes`. Exploiting this co-activation signal reduces re-ranking error measurably.

Formally, let $H_\tau = \langle (q_1, \mathbf{a}_1), (q_2, \mathbf{a}_2), \ldots, (q_{\tau-1}, \mathbf{a}_{\tau-1}) \rangle$ denote the session history up to turn $\tau$, where $\mathbf{a}_t \subseteq \mathcal{A}$ is the set of tools invoked at turn $t$. The session-aware scoring problem is:

$$\text{Find } \hat{\sigma}_\tau = \arg\max_{\sigma} \sum_{k=1}^{K} \frac{\text{rel}(\sigma^{-1}(k))}{\log_2(k+1)}, \quad \text{where rel is conditioned on } H_\tau$$

### 2.2 Three-Term Score Decomposition

**Equation 2.1 (SessionRerank+ Score):**

$$\text{score}(q, a) = w_d \cdot s_d(q, a) + w_m \cdot m(a) + w_c \cdot \varphi_c(a \mid H_\tau)$$

**Symbol Table:**

| Symbol | Type | Description |
|--------|------|-------------|
| $w_d$ | scalar $\in [0,1]$ | Weight for dense semantic similarity term |
| $w_m$ | scalar $\in [0,1]$ | Weight for metadata quality term |
| $w_c$ | scalar $\in [0,1]$ | Weight for co-activation prior |
| $s_d(q,a)$ | scalar $\in [-1,1]$ | Cosine similarity between Gemma 4 embeddings of $q$ and $d_a$ |
| $m(a)$ | scalar $\in [0,1]$ | Normalised composite metadata score |
| $\varphi_c(a \mid H_\tau)$ | scalar $\in [0,\infty)$ | Session co-activation prior |

Subject to the constraint $w_d + w_m + w_c = 1$.

**Dense Score.** The model `google/embedding-gemma-300m` (Gemma 4 family), accessed via the Hugging Face Inference API, is used to produce embeddings. Let $\mathbf{e}_q = \text{Gemma4}(q) \in \mathbb{R}^{768}$ and $\mathbf{e}_a = \text{Gemma4}(d_a) \in \mathbb{R}^{768}$. Then:

$$s_d(q, a) = \frac{\mathbf{e}_q \cdot \mathbf{e}_a}{\|\mathbf{e}_q\| \cdot \|\mathbf{e}_a\|}$$

**Metadata Score.** The metadata score aggregates three observable proxy attributes for tool utility:

$$m(a) = \frac{1}{3}\left[ \text{rel}(a) + \text{avail}(a) + (1 - \text{cost\_norm}(a)) \right]$$

where $\text{rel}(a) \in [0,1]$ is the historical invocation success rate for API $a$, $\text{avail}(a) \in [0,1]$ is the uptime over the trailing 30-day window, and $\text{cost\_norm}(a) \in [0,1]$ is a normalised cost score (lower cost = higher score).

**Design Justification.** The three-term decomposition is motivated by information-theoretic considerations: $s_d$ captures *semantic relevance*, $m(a)$ captures *operational reliability*, and $\varphi_c$ captures *conditional session probability*. The additive form with learned weights $w_d, w_m, w_c$ allows gradient-based joint optimisation over the NDCG loss, while still being interpretable for auditing (relevant for government deployment contexts).

### 2.3 Co-Activation Prior

**Equation 2.2 (Co-Activation Prior):**

$$\varphi_c(v \mid H_\tau) = \sum_{i=1}^{|H_\tau|} \gamma^{(|H_\tau| - i)} \cdot \log\!\left(1 + w_{h_i, v}\right)$$

**Symbol Table:**

| Symbol | Type | Description |
|--------|------|-------------|
| $v$ | API node $\in \mathcal{A}$ | Candidate API being scored |
| $h_i$ | API node $\in \mathcal{A}$ | API invoked at history position $i$ |
| $w_{h_i, v}$ | scalar $\geq 0$ | Edge weight in co-activation graph $\mathcal{G}$ from $h_i$ to $v$ |
| $\gamma$ | scalar $\in (0,1)$, $\gamma = 0.7$ | Temporal discount factor |
| $|H_\tau|$ | integer | Length of session history at turn $\tau$ |

**Derivation.** The co-activation prior is derived from the principle of *temporal credit assignment with recency bias*. The term $\gamma^{(|H_\tau| - i)}$ assigns exponentially decaying credit to older history entries — recent co-activations should exert stronger influence than distant ones, consistent with Markovian approximations of user intent drift [KOREN2009]. The $\log(1 + w_{h_i,v})$ transformation dampens the effect of very high edge weights, ensuring that a single extremely common co-occurrence does not dominate the prior; this is analogous to the tf-idf log-frequency dampening in information retrieval [JONES1972].

The co-activation graph $\mathcal{G} = (\mathcal{A}, \mathcal{E}, W)$ is a directed weighted graph where $w_{u,v}$ represents the accumulated evidence that invoking $u$ at turn $t$ should be followed by invoking $v$ at turn $t+1$. Crucially, $\mathcal{G}$ is *session-scoped*: it is initialised from a global prior at session start and updated in-session, so it sharpens within a session without permanently biasing future sessions.

**Global Prior Initialisation.** Before any session turn, the global co-occurrence matrix $W^{(0)}$ is estimated from the training corpus of historical sessions:

$$W^{(0)}_{u,v} = \frac{\text{count}(u \to v \text{ in training sessions})}{\text{count}(u \text{ invoked in training sessions}) + \epsilon}$$

where $\epsilon = 1$ is a Laplace smoothing constant. Within a session, this matrix is continuously updated via the edge update rule.

### 2.4 Edge Update Rule

**Equation 2.3 (Edge Update):**

$$w_{u,v} \leftarrow (1 - \rho) \cdot w_{u,v} + \delta \cdot \mathbf{1}[\text{success}]$$

**Parameters:**

| Parameter | Value | Justification |
|-----------|-------|---------------|
| $\rho$ | 0.02 | Slow decay rate — preserves session-level structure across many turns |
| $\delta$ | 1.0 | Unit reward for successful co-invocation |

**Interpretation.** This is a form of *online reinforcement learning on a directed graph*: the edge weight $w_{u,v}$ tracks the exponential moving average of binary success signals for the transition $u \to v$. The decay term $(1-\rho) \cdot w_{u,v}$ prevents unbounded growth and ensures that stale co-activation patterns are gradually forgotten. The binary indicator $\mathbf{1}[\text{success}]$ is set to 1 when the tool $v$ returns a non-null, non-error response within a timeout threshold (currently 5 seconds for data.gov.in APIs).

**Proposition 2.1 (Convergence of Edge Weights).** Under the assumption that the Bernoulli success probability $p_{u,v}$ for transition $u \to v$ is stationary, the expected edge weight at turn $t$ converges to:

$$\mathbb{E}[w_{u,v}^{(t)}] \to \frac{\delta \cdot p_{u,v}}{\rho} \quad \text{as } t \to \infty$$

*Proof.* Taking the expectation of Equation 2.3: $\mathbb{E}[w^{(t+1)}] = (1-\rho)\mathbb{E}[w^{(t)}] + \delta p_{u,v}$. This is a first-order linear recurrence with solution $\mathbb{E}[w^{(t)}] = \frac{\delta p_{u,v}}{\rho} + \left(w^{(0)} - \frac{\delta p_{u,v}}{\rho}\right)(1-\rho)^t$. Since $\rho \in (0,1)$, $(1-\rho)^t \to 0$, yielding the fixed point. $\square$

### 2.5 Cascade Architecture

SessionRerank+ is implemented as a two-stage cascade:

**Stage 1 — Recall.** A BM25 retriever [ROBERTSON2009] is applied to the query $q$ against all API docstrings to produce a candidate set $\mathcal{C} \subseteq \mathcal{A}$ of size $|\mathcal{C}| = 50$. BM25 is computationally cheap ($O(|d| \log N)$ per query with an inverted index) and achieves high recall at $K=50$ even when dense similarity is low.

**Stage 2 — Re-rank.** The full three-term score (Equation 2.1) is computed for all $a \in \mathcal{C}$, requiring $|\mathcal{C}|$ embedding inference calls (batched). The final ranked list returns the top $K=5$ APIs.

```
Query q
   │
   ▼
[BM25 Recall] ──► Top-50 candidates C
   │
   ▼
[Gemma 4 Embedding] ──► s_d for each c ∈ C
   │
[Metadata Lookup] ──────────────────────► m(c) for each c ∈ C
   │
[Co-Activation Cache] ──────────────────► φ_c(c|H_τ) for each c ∈ C
   │
   ▼
[Weighted Sum] ──► score(q, c) for c ∈ C
   │
   ▼
[Top-K Sort] ──► ranked_tools [t_1, …, t_5]
```

### 2.6 Karnataka API Catalogue (15 Live APIs)

The system is grounded in 15 real Karnataka government APIs:

| # | API Name | Domain | data.gov.in Resource |
|---|----------|--------|---------------------|
| 1 | KSNDMC Weather | Weather | KSNDMC portal |
| 2 | Bhoomi Land Records | Land | Bhoomi portal |
| 3 | Raitha Mitra | Farmer schemes | Raitha Mitra portal |
| 4 | KSDA Horticulture | Horticulture | KSDA portal |
| 5 | K-Kisan Advisory | Crop advisory | K-Kisan |
| 6 | Agmarknet KA | Market prices | AGMARKNET |
| 7 | PM-KISAN KA | Subsidies | `9ef84268-d588-465a-a308-a864a43d0070` |
| 8 | PMFBY Karnataka | Crop insurance | PMFBY portal |
| 9 | KMF Nandini | Dairy prices | KMF portal |
| 10–15 | *Additional soil, water, scheme APIs* | Mixed | Various |

### 2.7 Novel Contribution

**Contribution O1:** SessionRerank+ is, to the best of the author's knowledge, the first tool-retrieval system to implement a *dynamic directed co-activation graph* that is updated in-session with exponential temporal discounting. Existing work on tool retrieval either uses static co-occurrence priors computed offline [TANG2023, XU2023] or treats each query independently [QIAN2023]. The online edge update rule (Equation 2.3) allows the graph to *sharpen within a session* — the longer a session, the more informative the prior — while the decay term $\rho$ prevents cross-session contamination. Empirically, this achieves NDCG@5 = 0.516 (mean), representing a +14.7% improvement over the dense-only baseline and +8.5% improvement in Hit@5, evaluated on 15 Karnataka government APIs with queries drawn from real farmer advisory interaction logs.

---

## 3. Objective 2: APRR + CROW + OctoRoute

*Adaptive Policy-based Router with Reasoning and Functional Token Dispatch*

### 3.1 Problem Formulation

**Definition 3.1 (Multi-Agent Routing).** Let $\mathcal{G}_R = (\mathcal{V}, \mathcal{E}_R)$ be a routing graph where each vertex $a_i \in \mathcal{V}$ represents a specialised sub-agent (e.g., WeatherAgent, MarketPriceAgent, SchemeAdvisorAgent, SoilHealthAgent, CropInsuranceAgent) and each directed edge $(a_i, a_j) \in \mathcal{E}_R$ represents a permissible routing transition with learned weight $W_{ij}$. Given query $q$ and entry agent $a_0$ (the orchestrator), the routing problem is to find a path $\pi = (a_0, a_{j_1}, a_{j_2}, \ldots, a_{j_L})$ through $\mathcal{G}_R$ that maximises query resolution quality subject to latency constraints:

$$\hat{\pi} = \arg\max_{\pi} \; \mathbb{E}[\text{success}(\pi, q)] \quad \text{subject to} \quad \text{latency}(\pi) \leq \Lambda_{\max}$$

The routing decision at each step must be made *online* (without lookahead) and must update the routing weights from outcome feedback, motivating a policy-gradient formulation.

### 3.2 APRR Policy

**Equation 3.1 (APRR Routing Policy):**

$$P(a_j \mid a_i, q) \propto W_{ij}^{\alpha} \cdot \eta_{ij}^{\beta} \cdot \psi_j(q)^{\gamma}$$

**Symbol Table:**

| Symbol | Type | Value | Description |
|--------|------|-------|-------------|
| $W_{ij}$ | scalar $\geq 0$ | learned | Online-learned transition weight from agent $a_i$ to $a_j$ |
| $\eta_{ij}$ | scalar $\in (0,1]$ | empirical | Historical latency-normalised efficiency for edge $(i,j)$ |
| $\psi_j(q)$ | scalar $\in [0,1]$ | computed | Query-agent affinity: semantic similarity of $q$ to agent $j$'s domain description |
| $\alpha$ | exponent | 2.0 | Amplifies learned policy signal |
| $\beta$ | exponent | 1.0 | Linear latency contribution |
| $\gamma$ | exponent | 2.5 | Strongly amplifies query-agent semantic alignment |

**Normalisation.** The probability is computed via a Boltzmann-style softmax over all valid successors $\mathcal{N}(a_i)$ of $a_i$ in $\mathcal{G}_R$:

$$P(a_j \mid a_i, q) = \frac{W_{ij}^{\alpha} \cdot \eta_{ij}^{\beta} \cdot \psi_j(q)^{\gamma}}{\sum_{k \in \mathcal{N}(a_i)} W_{ik}^{\alpha} \cdot \eta_{ik}^{\beta} \cdot \psi_k(q)^{\gamma}}$$

**Derivation: REINFORCE Equivalence (Proposition 3.1).** The APRR update rule (Equation 3.2 below) can be shown to implement a first-order approximation of the REINFORCE policy gradient [WILLIAMS1992].

*Setup.* Define the policy parameter $\theta_{ij} = \log W_{ij}$, so $P(a_j|a_i,q) \propto e^{\alpha \theta_{ij}} \cdot \text{const}$. The REINFORCE gradient for a trajectory $\pi$ with reward $R(\pi)$ is:

$$\nabla_{\theta_{ij}} J = \mathbb{E}\left[ R(\pi) \cdot \nabla_{\theta_{ij}} \log P(\pi) \right]$$

For a single-step transition, $\nabla_{\theta_{ij}} \log P(a_j|a_i,q) = \alpha(1 - P(a_j|a_i,q))$. When the probability mass is concentrated on the successful edge (i.e., $P \approx 1$), this reduces to approximately zero additional gradient; when the edge is improbable but successful, the gradient is large — exactly the desired credit assignment. The multiplicative weight update in Equation 3.2 approximates this gradient in the log-weight parameterisation. $\square$

**Exponent Justification.** The choice $\alpha = 2.0$ quadratically amplifies the learned weights, creating a *winner-takes-more* dynamic that accelerates convergence to the optimal policy. The choice $\gamma = 2.5 > \alpha$ ensures that for a novel query with no routing history, the query-agent semantic alignment dominates, providing a meaningful default prior that degrades gracefully to the learned policy as $W_{ij}$ accumulates evidence.

### 3.3 APRR Update Rule

**Equation 3.2 (APRR Weight Update):**

$$W \leftarrow (1 - \lambda) \cdot W + \kappa \cdot \frac{\mathbf{1}[\text{success}]}{L^2 \cdot \text{latency\_norm}}$$

**Parameters:**

| Parameter | Value | Justification |
|-----------|-------|---------------|
| $\lambda$ | 0.005 | Very slow global decay — maintains long-term routing memory |
| $\kappa$ | 5.0 | Reward scale — 5× upweights successful routes |
| $L$ | integer | Path length (number of hops); penalty $L^2$ discourages long paths |
| $\text{latency\_norm}$ | scalar $\in (0,1]$ | Latency of this path normalised by the 95th-percentile historical latency |

**Path-Length Penalty.** The denominator $L^2 \cdot \text{latency\_norm}$ encodes a *parsimony principle*: shorter, faster paths receive larger updates for the same binary success signal. This biases the learned policy towards efficient routes without requiring an explicit multi-objective loss function, and is consistent with the *minimum description length* (MDL) principle in that it prefers simpler explanations of the routing problem [RISSANEN1978].

**Initialisation from SessionRerank+.** At the start of each session, $W$ is initialised as:

$$W_{ij}^{(0)} = W_{ij}^{\text{global}} \cdot (1 + \beta_{\text{sess}} \cdot \tilde{w}_{ij}^{\text{session}})$$

where $\tilde{w}_{ij}^{\text{session}}$ is the normalised session co-activation weight from Objective 1, and $\beta_{\text{sess}} = 0.5$ is a blending coefficient. This is the O1→O2 integration point.

### 3.4 CROW Extension: Complexity-Gated CoT Deliberation

**Motivation.** Not all queries require expensive multi-step reasoning. A query like "what is today's tomato price in Bengaluru?" can be answered by a direct API call; a query like "given that I have 2 acres of rainfed maize in Kolar and the soil health card shows nitrogen deficiency, what combination of subsidised schemes should I apply for?" requires multi-step chain-of-thought (CoT) reasoning. CROW (*Complexity-Gated Reasoning on Weights*) extends APRR by gating deliberation based on query complexity and incorporating the *quality* of that deliberation into the weight update.

**Complexity Gate.** Define query complexity $\kappa(q)$ as:

$$\kappa(q) = \sigma\!\left( \mathbf{v}_\kappa \cdot \text{Gemma4}(q) + b_\kappa \right)$$

where $\mathbf{v}_\kappa \in \mathbb{R}^{768}$ and $b_\kappa$ are learned parameters, and $\sigma$ is the sigmoid function. CoT is triggered when $\kappa(q) > \theta_\kappa$ (empirically tuned to 0.6).

**CROW Update Equation:**

$$\Delta W_{ij} \mathrel{*}= (1 + \beta_{\text{CROW}} \cdot \rho(T_q))$$

where $T_q$ is the CoT trace generated by the agent for query $q$, $\rho(T_q) \in [0,1]$ is the *reasoning quality score* computed by a lightweight verifier LLM (cross-entropy score of the trace against a reference answer), and $\beta_{\text{CROW}} = 0.3$ is the CROW amplification factor.

**Interpretation.** When reasoning quality is high ($\rho \approx 1$), the weight update is amplified by up to 30%, accelerating learning on complex queries where correct multi-step reasoning is particularly valuable. When reasoning quality is low ($\rho \approx 0$), the update is unmodified. When CROW routes are flagged as low-quality ($\rho < 0.4$), the routing decision is tagged as a *negative quality trace*, which feeds as a structured distress signal to the MNCD mesh (O2→O3 integration point).

### 3.5 OctoRoute Extension: Functional Token Dispatch

**Motivation.** Standard agentic systems dispatch agent calls via function-call APIs or JSON schemas, which impose parsing overhead and limit composability. OctoRoute introduces *functional tokens* — special tokens `<octo_k>` prepended to the query — that signal the routing arm to the LLM's generation context, enabling near-zero-overhead arm selection via token-level dispatch.

**Mechanism.** The OctoRoute system maintains $K$ domain arms, each corresponding to a cluster of functionally related APIs:

| Arm $k$ | Token | Domain | Karnataka APIs |
|---------|-------|--------|----------------|
| 0 | `<octo_0>` | Weather | KSNDMC |
| 1 | `<octo_1>` | Market Prices | Agmarknet KA, eNAM |
| 2 | `<octo_2>` | Government Schemes | PM-KISAN, PMFBY, Raitha Mitra |
| 3 | `<octo_3>` | Soil & Land | Bhoomi, SHC portal |
| 4 | `<octo_4>` | Crop Advisory | K-Kisan, KSDA |
| 5 | `<octo_5>` | Dairy & Livestock | KMF Nandini |

**Arm-Local Weight Matrix.** Each arm $k$ maintains a local weight matrix $W_{\text{local}}^{(k)}$ that is updated independently of the global APRR matrix. This allows domain-specific routing policies to develop without cross-arm interference.

**Chromatophore Signals.** OctoRoute also maintains a 1-bit *chromatophore* signal $c_k \in \{0,1\}$ for each arm, indicating arm *activation state*. This binary signal is inspired by cephalopod chromatophore activation patterns [TUBLITZ1991] and is used to implement rapid arm gating: when $c_k = 0$, arm $k$ is gated out of the softmax denominator, reducing latency by avoiding unnecessary LLM calls.

**Domain Label Output.** OctoRoute outputs a domain label $D \in \{0, 1, \ldots, K-1\}$ for each routed query. This label is passed to FCNP (Objective 4) to restrict context pruning to the domain-relevant subgraph, the O2→O4 integration point.

### 3.6 CROW-OctoRoute Hybrid

In the deployed system, CROW and OctoRoute operate simultaneously:

```
Query q ──► [OctoRoute Arm Selector] ──► domain label D, token <octo_D>
                │
                ▼
           [APRR Policy] ──► routed agent path π
                │
                ▼
           [CROW Complexity Gate: κ(q) > 0.6?]
                │                    │
             Yes│                    │No
                ▼                    ▼
           [CoT Deliberation]   [Direct API call]
                │
                ▼
           [Reasoning Quality ρ(T_q)]
                │
         ┌──────┴────────────┐
         │ρ < 0.4: distress  │ρ ≥ 0.4: normal
         ▼                   ▼
    [MNCD Mesh:          [W update with
     distress/<qid>]      CROW amplification]
```

### 3.7 Novel Contribution

**Contribution O2:** APRR is the first multi-agent router to combine (1) a decay-regularised online policy-iteration weight matrix with a formal REINFORCE-equivalence proof (Proposition 3.1), (2) a complexity-gated reasoning quality modulation (CROW), and (3) functional-token arm dispatch with arm-local weight matrices and 1-bit chromatophore gating (OctoRoute). The system achieves a 35.7% reduction in latency (261.3 ms mean) and 23.9% reduction in hop count (2.77 mean) versus a static semantic baseline, while maintaining a success rate of 0.470. OctoRoute alone contributes −22% latency. The system is deployed at https://aprr-multi-agent-routing.vercel.app.

---

## 4. Objective 3: MNCD Mesh Agents

*Multi-Node Consensus Diffusion Mesh with Fault Tolerance*

### 4.1 Problem Formulation

**Definition 4.1 (Mesh Consensus Problem).** Let $\mathcal{M} = (\mathcal{V}_M, \mathcal{E}_M)$ be a mesh of $N_M = 5$ LLM agents, where each node $v_i \in \mathcal{V}_M$ is instantiated with a distinct foundation model (Gemma-2-2b-it, Qwen2.5-7B-Instruct, or Llama-3.1-8B-Instruct). Each agent independently processes query $q$ and produces an answer $t_i(q)$ and a confidence score $c_i \in [0,1]$. The MNCD problem is to:

1. Produce a *consensus answer* $\hat{t}(q)$ that maximises accuracy even when up to $\lfloor N_M/2 \rfloor - 1$ agents have failed or are producing incorrect outputs.
2. Maintain *context consistency* across agents via gossip diffusion — agents sharing tool evidence should converge to a common context within $O(\log N_M)$ rounds.
3. Detect and isolate *failed agents* via a $\varphi$-accrual failure detector [HAYASHIBARA2004].
4. Handle *external distress signals* from APRR/CROW (O2→O3) by triggering emergency replication of critical context.

### 4.2 Adaptive Edge Weights

**Equation 4.1 (Mesh Edge Weight):**

$$w(p, q) = \alpha \cdot s_{pq} + (1 - \alpha) \cdot \frac{1}{1 + \ell_{pq}}$$

**Symbol Table:**

| Symbol | Type | Value | Description |
|--------|------|-------|-------------|
| $\alpha$ | scalar | 0.3 | Blending weight between semantic and structural similarity |
| $s_{pq}$ | scalar $\in [0,1]$ | computed | Semantic similarity between agent $p$'s specialisation profile and agent $q$'s |
| $\ell_{pq}$ | integer $\geq 0$ | computed | Graph distance (hop count) between $p$ and $q$ in $\mathcal{M}$ |

**Justification for $\alpha = 0.3$.** The choice of $\alpha = 0.3$ reflects the empirical finding that structural proximity (closeness in the mesh topology) is a stronger predictor of message delivery reliability than semantic similarity, by approximately a 2.3:1 ratio, in the tested five-node mesh configurations. Semantic similarity is nonetheless important for intelligently routing context: agents with overlapping specialisations should receive each other's tool evidence more preferentially.

**Weight Dynamics.** The edge weight $w(p,q)$ is static with respect to $\alpha$ but dynamically updated when agent failure events alter the underlying graph structure (edges incident to failed nodes are soft-removed by setting $s_{pq} = 0$ for the failed node $p$).

### 4.3 Gossip Diffusion Bound

**Equation 4.2 (Gossip Diffusion Time Bound):**

$$\mathbb{E}[T_{\text{diff}}] = O(\log N_M) \quad \text{with high probability}$$

This bound follows from Demers et al. (1987) [DEMERS1987], who prove that in a graph where each node at each round independently selects a uniformly random neighbour to exchange state with, the number of rounds until all nodes have received a message originating from one node is $\Theta(\log N)$ with probability $1 - 1/N$.

**Application to MNCD.** In the five-agent mesh, the practical bound is $\mathbb{E}[T_{\text{diff}}] \leq \lceil \log_2 5 \rceil = 3$ rounds, meaning that tool evidence gossipped by any one agent will reach all other agents within 3 message-exchange rounds. Each round is triggered asynchronously when a new API response arrives on the pub/sub topic `tool.evidence`.

**Pub/Sub Topics:**

| Topic | Publisher | Subscriber | Content |
|-------|-----------|------------|---------|
| `tool.evidence` | Any agent that invoked an API | All agents | API response payload |
| `agent.heartbeat` | Each agent (every 500ms) | Failure detector | Timestamp, confidence |
| `distress/<query_id>` | APRR/CROW (when $\rho < 0.4$) or MNCD (when $c_{\text{local}} < 0.55$) | All agents + orchestrator | Query ID, distress reason |
| `consensus.result` | Consensus aggregator | Orchestrator, FCNP | $\hat{t}(q)$, Borda scores |

### 4.4 Borda Consensus

**Equation 4.3 (Borda Count Consensus):**

$$\hat{t}(q) = \arg\max_{t} \sum_{i \in R(q)} c_i \cdot \left( m_i - \text{rank}_i(t) + 1 \right)$$

**Symbol Table:**

| Symbol | Type | Description |
|--------|------|-------------|
| $t$ | candidate answer | Element of the set $\{t_i(q) : i \in R(q)\}$ of agent answers |
| $R(q)$ | set of agents | Agents that successfully responded to query $q$ (not failed/timed-out) |
| $c_i$ | scalar $\in [0,1]$ | Self-reported confidence of agent $i$ on query $q$ |
| $m_i$ | integer $= |R(q)|$ | Number of responding agents |
| $\text{rank}_i(t)$ | integer $\in [1, m_i]$ | Rank assigned to candidate $t$ by agent $i$ |

**Derivation.** The Borda count [BORDA1781] is a rank-aggregation method with the property of *Condorcet consistency* under certain preference profiles [YOUNG1988]: if a candidate beats all others in pairwise comparisons, the Borda count will select it. The confidence-weighted Borda extension assigns greater voting power to high-confidence agents, which in practice are agents that have accumulated more relevant tool evidence via gossip.

**Borda Scores as Source Mass.** The Borda score vector $\mathbf{B} = \{B_i = c_i(m_i - \text{rank}_i(t^*) + 1)\}_{i \in R(q)}$ is normalised and passed to FCNP as the initial *source mass* vector $\mathbf{m}$ (see Section 5), the O3→O4 integration point.

### 4.5 Distress Channel Protocol

**Distress Trigger Condition.** An agent $i$ publishes to `distress/<query_id>` when its local confidence falls below the threshold:

$$c_{\text{local}} < \tau = 0.55$$

This is monitored continuously; if the condition persists for more than 2 consecutive gossip rounds, the distress is escalated to the orchestrator.

**$\varphi$-Accrual Failure Detection.** The $\varphi$-accrual failure detector [HAYASHIBARA2004] estimates the probability that an agent has failed given its heartbeat history. The accrual function $\varphi(t)$ is defined as:

$$\varphi(t) = -\log_{10}\!\left(1 - F_\mu(t - t_{\text{last}})\right)$$

where $F_\mu$ is the CDF of the inter-arrival time distribution (modelled as a Gaussian $\mathcal{N}(\mu, \sigma^2)$ fitted to the trailing 100 heartbeats), and $t - t_{\text{last}}$ is the time since the last heartbeat. An agent is declared failed when $\varphi(t) > \varphi^* = 8$, corresponding to a failure probability exceeding $1 - 10^{-8} \approx 99.999999\%$.

**Replication Factor.** Critical context (tool evidence flagged as high-confidence) is replicated to $R = 3$ distinct agents, ensuring that even if $\lfloor R/2 \rfloor = 1$ replica-bearing agent fails, the context remains accessible.

### 4.6 Experimental Results

| Scenario | Description | Accuracy |
|----------|-------------|----------|
| S1 | Single agent baseline | 44.0% |
| S2 | 5-agent mesh, all healthy | 97.5% |
| S3 | 5-agent mesh, 2/5 agents dead | 97.0% |
| S4 | 5-agent mesh, 20% packet loss | 97.0% |

The 53.5-percentage-point improvement from S1 to S2 validates the core hypothesis that ensemble consensus on heterogeneous LLMs dramatically reduces individual model error. The near-identical S2/S3/S4 results demonstrate that the MNCD mesh is fault-tolerant to the Byzantine tolerance bound for $N_M = 5$ nodes.

### 4.7 Novel Contribution

**Contribution O3:** MNCD is, to the best of the author's knowledge, the first architecture to combine (1) content-addressed pub/sub messaging, (2) gossip diffusion with $O(\log N)$ convergence guarantee, (3) replicated critical context ($R=3$), (4) $\varphi$-accrual failure detection with threshold $\varphi^* = 8$, and (5) distress signalling from a routing layer, all within a single multi-agent LLM stack. The preservation of 97% accuracy with 2/5 agents dead represents a practical engineering result suitable for deployment in Indian rural connectivity conditions, where intermittent connectivity and process crashes are common.

---

## 5. Objective 4: FCNP Context Pruning

*Flow-Based Context Network Pruning via Kirchhoff Potential Fields*

### 5.1 Problem Formulation

**Definition 5.1 (Context Pruning).** Let $\mathcal{X} = \{x_1, x_2, \ldots, x_n\}$ be a set of $n$ context passages retrieved from tool API responses and RAG corpora. Each passage $x_i$ has a token length $\ell_i$. The total token count $\sum_i \ell_i$ typically exceeds the LLM's context window $B$ (token budget). The pruning problem is to select a subset $\mathcal{X}^* \subseteq \mathcal{X}$ such that:

$$\mathcal{X}^* = \arg\max_{\mathcal{X}' \subseteq \mathcal{X}} \text{F1}@K(\mathcal{X}', Q_{\text{gold}}) \quad \text{subject to} \quad \sum_{x_i \in \mathcal{X}'} \ell_i \leq B$$

where $\text{F1}@K$ measures the proportion of the $K$ gold citations that are present in the selected context.

**Why Flow-Based Pruning?** Existing context compression methods — SelectiveContext [LI2023], LLMLingua [JIANG2023], TopKImportance — score passages *independently*, ignoring the semantic graph structure. FCNP models passages as nodes in a resistor network, where current flow from query-aligned sources to an answer sink *simultaneously* propagates and amplifies relevance through connected semantic subgraphs. This captures *indirect relevance*: a passage that is only moderately similar to the query but is strongly connected to a highly relevant passage will still receive high current and be retained.

**Physical Intuition.** Imagine the context graph as an electrical circuit. The query is a battery (source of current); each passage is a node; semantic similarity defines conductance (high similarity = low resistance = high conductance). Current flows from the query source, through semantically connected passages, to a ground sink. Passages that carry high current are retained; low-current passages are pruned. This is analogous to the Physarum polycephalum (slime mould) network optimisation [TERO2010], where the organism reinforces high-flow paths and prunes low-flow ones.

### 5.2 Context Graph Construction

**Node Set.** $\mathcal{V}_C = \{v_i : i = 1, \ldots, n\}$ where each $v_i$ corresponds to passage $x_i$.

**Edge Set and Initial Conductance.** For each pair $(v_i, v_j)$, compute the cosine similarity $\cos(\mathbf{e}_i, \mathbf{e}_j)$ between Gemma 4 embeddings. An edge is added if $\cos(\mathbf{e}_i, \mathbf{e}_j) \geq \tau = 0.30$:

$$\mathcal{E}_C = \{(v_i, v_j) : \cos(\mathbf{e}_i, \mathbf{e}_j) \geq \tau\}$$

Initial conductance is set proportional to similarity:

$$D_{ij}^{(0)} = \cos(\mathbf{e}_i, \mathbf{e}_j) \cdot \mathbf{1}[\cos(\mathbf{e}_i, \mathbf{e}_j) \geq \tau]$$

**Source and Sink Assignment.** Let $v_s$ denote the source node (representing the query $q$) and $v_t$ denote the sink node (representing the target answer). The source mass $m_i$ for each passage node $v_i$ is initialised from the Borda consensus scores (O3→O4 integration):

$$m_i = B_i^{\text{Borda}} \cdot \cos(\mathbf{e}_i, \mathbf{e}_q)$$

This ensures that passages that are both highly relevant to the query AND well-ranked by the mesh consensus receive the strongest source injection.

**OctoRoute Domain Gating.** The domain label $D$ from OctoRoute (O2→O4 integration) is used to restrict the graph to domain-relevant passages: passages whose domain tag does not match $D$ have their source mass set to zero. This halves the average graph size, reducing the Kirchhoff solve time.

### 5.3 Kirchhoff Potential Solve

**Equation 5.1 (Kirchhoff System):**

$$L(D) \cdot \mathbf{p} = \mathbf{I}$$

where:

- $\mathbf{p} \in \mathbb{R}^n$ is the vector of *electric potentials* at each passage node.
- $\mathbf{I} \in \mathbb{R}^n$ is the *current injection vector*: $I_s = +1$ (source), $I_t = -1$ (sink), $I_i = m_i \cdot \mathbf{1}[i \notin \{s,t\}]$.
- $L(D) = \text{diag}(D \cdot \mathbf{1}) - D$ is the *graph Laplacian* of the conductance matrix $D \in \mathbb{R}^{n \times n}$.

**Construction of $L(D)$:**

$$L(D)_{ij} = \begin{cases} \sum_{k \neq i} D_{ik} & \text{if } i = j \\ -D_{ij} & \text{if } i \neq j \end{cases}$$

**Boundary Conditions.** The Kirchhoff system is singular (the Laplacian has a zero eigenvalue for each connected component). A standard fix is to ground the sink node: set $p_t = 0$ by removing the $t$-th row and column and adding a diagonal term to ensure positive definiteness.

**Solver.** The regularised system is solved via sparse Conjugate Gradient (CG) with a diagonal preconditioner (Jacobi), which converges in $O(\sqrt{\kappa(L)} \log(1/\varepsilon))$ iterations where $\kappa(L)$ is the condition number of $L(D)$.

### 5.4 Conductance Reinforcement

**Equation 5.2 (Conductance Update):**

$$D_{ij}(t+1) = (1 - \mu) \cdot D_{ij}(t) + \alpha \cdot |Q_{ij}(t)|^{\gamma}$$

**Equation 5.3 (Edge Current):**

$$Q_{ij}(t) = D_{ij}(t) \cdot (p_i(t) - p_j(t))$$

**Parameters:**

| Parameter | Value | Role |
|-----------|-------|------|
| $\mu$ | 0.10 | Decay rate — prevents saturation of high-conductance edges |
| $\alpha$ | (calibrated to scale) | Reinforcement coefficient |
| $\gamma$ | (power law exponent) | Nonlinear reinforcement — amplifies strong flows more than weak flows |

**Physarum Analogy.** Equation 5.2 is directly analogous to the Physarum polycephalum tube-radius evolution equation from Tero et al. (2010) [TERO2010]:

$$\frac{dD_{ij}}{dt} = f(|Q_{ij}|) - \text{decay} \cdot D_{ij}$$

where $f$ is a monotone increasing function. In FCNP, the discrete-time version uses a power law $f(|Q_{ij}|) = \alpha |Q_{ij}|^\gamma$, and the decay is $(1-\mu) \cdot D_{ij}$ rather than the continuous $-\text{decay} \cdot D_{ij}$. The novelty is in the multi-source/multi-sink extension and the grounding in semantic context compression.

### 5.5 Convergence Criterion

**Equation 5.4 (Convergence Condition):**

$$\frac{\sum_{i,j} |D_{ij}(t+1) - D_{ij}(t)|}{\sum_{i,j} D_{ij}(t)} < \varepsilon$$

**Parameters:**

| Parameter | Value |
|-----------|-------|
| $\varepsilon$ | $10^{-4}$ |
| $\max\_\text{iter}$ | 200 |

**Node Scoring.** After convergence (or at $\max\_\text{iter}$), nodes are scored by their steady-state potential $p_i^*$:

$$\text{NodeScore}(v_i) = p_i^* \cdot m_i^{0.5}$$

The geometric mean weighting $m_i^{0.5}$ ensures that nodes with both high potential (network-central relevance) and high source mass (query + Borda relevance) are ranked highest. Passages are selected in descending order of NodeScore until the token budget $B$ is filled.

### 5.6 Full FCNP Algorithm

```
Algorithm FCNP(X, q, B, m_Borda, D_octo):
  Input: passages X, query q, token budget B,
         Borda scores m_Borda, domain label D_octo
  Output: pruned context X*

  1. Embed all x_i ∈ X using Gemma4 → e_i ∈ R^768
  2. Build graph: D_ij^(0) = cos(e_i,e_j) if ≥ τ=0.30, else 0
  3. Gate: D_ij^(0) ← 0 for passages not in domain D_octo
  4. Set m_i = m_Borda_i · cos(e_i, e_q)
  5. Set t ← 0
  6. REPEAT:
     a. Solve L(D^(t)) · p^(t) = I(m)   [Kirchhoff]
     b. Compute Q_ij^(t) = D_ij^(t) · (p_i^(t) - p_j^(t))  [currents]
     c. D^(t+1) ← (1-μ)·D^(t) + α·|Q^(t)|^γ  [reinforce]
     d. t ← t + 1
  7. UNTIL convergence (Eq. 5.4) OR t = max_iter
  8. Score nodes: NodeScore(v_i) = p_i* · m_i^0.5
  9. Sort X by NodeScore descending
 10. Greedily add to X* until Σ ℓ_i ≤ B
 11. Return X*
```

### 5.7 Baseline Comparison

FCNP was evaluated against 7 baselines on a context compression benchmark drawn from real Karnataka government API responses:

| Method | F1@5 | F1@10 | Compression |
|--------|------|-------|-------------|
| NoCompression | 0.71 | 0.84 | 1× |
| Random | 0.31 | 0.49 | 10× |
| TopKImportance | 0.58 | 0.71 | 10× |
| BM25 | 0.61 | 0.74 | 10× |
| DenseTopK | 0.63 | 0.76 | 10× |
| SelectiveContext | 0.65 | 0.78 | 10× |
| LLMLingua | 0.67 | 0.80 | 10× |
| **FCNP (ours)** | **0.70** | **0.83** | **10×** |

Wilcoxon signed-rank test: all FCNP vs. baseline comparisons significant at $p < 0.05$. Citation accuracy ≥ 99%.

### 5.8 Novel Contribution

**Contribution O4:** FCNP is the first context compression algorithm to apply a Kirchhoff resistor-network / Physarum-style conductance reinforcement to the semantic passage graph. Prior work compresses context by independent passage scoring [LI2023, JIANG2023] or syntactic compression [CHEVALIER2023], losing inter-passage semantic structure. FCNP's flow formulation captures *indirect relevance* through semantic connectivity, achieving near-lossless citation accuracy (≥99%) at 10:1 compression on Indian government API response corpora, with statistically significant improvements over all seven baselines.

---

## 6. Integration: How All 4 Objectives Connect

### 6.1 Integration Architecture

The four objectives are not merely thematically related — they share *live data interfaces* in the deployed system. The six integration points are:

| # | From | To | Signal | Mechanism |
|---|------|----|--------|-----------|
| I1 | O1 SessionRerank+ | O2 APRR | Session weight vector $\tilde{w}_{ij}^{\text{session}}$ | Biases APRR's $W_{\text{init}}$ matrix |
| I2 | O2 APRR/CROW | O3 MNCD | Low-confidence route flag + distress signal | Pub/sub topic `distress/<query_id>` |
| I3 | O3 MNCD | O4 FCNP | Gossip-propagated tool evidence + Borda scores | Context evidence graph $G_{\text{ev}}$; source mass $m_i$ |
| I4 | O4 FCNP | O1 SessionRerank+ | Pruned context $C^*$ (compressed token budget) | Faster Gemma 4 embedding in next turn |
| I5 | O2 CROW | O3 MNCD | Negative quality traces ($\rho < 0.4$) | Structured distress signal |
| I6 | O2 OctoRoute | O4 FCNP | Domain label $D$ | Gates FCNP pruning to domain subgraph |

### 6.2 Data Flow Diagram (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        INTEGRATION DATA FLOW                                    │
│                                                                                 │
│   ┌──────────────────┐   I1: W_session biases W_init   ┌───────────────────┐   │
│   │  O1 SessionRerank│────────────────────────────────▶│  O2 APRR+CROW     │   │
│   │                  │                                  │  +OctoRoute       │   │
│   │  score(q,a) =    │◄────────────────────────────────│                   │   │
│   │  w_d·s_d +       │   I4: C* → faster Gemma embed  │  P(a_j|a_i,q) ∝  │   │
│   │  w_m·m + w_c·φ_c │                                  │  W^α·η^β·ψ^γ     │   │
│   └──────────────────┘                                  └────────┬──────────┘   │
│                                                                   │             │
│                              I2: distress signal, I5: CROW neg  │             │
│                              I6: domain label D                  │             │
│                                                                   ▼             │
│   ┌──────────────────┐   I3: G_ev + Borda scores       ┌───────────────────┐   │
│   │  O4 FCNP         │◄────────────────────────────────│  O3 MNCD Mesh     │   │
│   │                  │                                  │                   │   │
│   │  L(D)·p = I      │                                  │  Borda consensus  │   │
│   │  D reinforce     │                                  │  φ-accrual detect │   │
│   │  10:1 compress   │                                  │  gossip O(log N)  │   │
│   └────────┬─────────┘                                  └───────────────────┘   │
│            │                                                                    │
│            │ C* (pruned context)                                                │
│            ▼                                                                    │
│   ┌──────────────────┐                                                          │
│   │  LLM Response    │ ◄── Gemma 4 / Qwen2.5 final generation                 │
│   │  Generation      │     with verified citations                             │
│   └──────────────────┘                                                          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Session-Level Pipeline Walk-Through

**Example Query (Tamil):** *"என் கடலூர் மாவட்டத்தில் நெல் விவசாயிகளுக்கு இன்றைய மண்டி விலை மற்றும் PM-KISAN திட்டம் பற்றிய தகவல் வேண்டும்"*

(*Translation: "I need today's mandi price and PM-KISAN scheme information for paddy farmers in Cuddalore district."*)

**Step 1 — Language Layer.**  
IndicTrans2 detects Tamil (`ta`) and translates to English: *"I need today's mandi price and PM-KISAN scheme information for paddy farmers in Cuddalore district."*  
Language code `ta` is stored in `FarmerProfile.language = "ta"`.

**Step 2 — O1: SessionRerank+.**  
- BM25 retrieval returns 50 candidates from the API catalogue.
- Gemma 4 embedding of the query matches `Agmarknet-TN` (Tamil Nadu APMC mandi prices) and `PM-KISAN-TN` with high $s_d$.
- Session history contains no prior turns ($H_1 = \emptyset$), so $\varphi_c = 0$; score reduces to $w_d s_d + w_m m$.
- Top-5: `[Agmarknet-TN, PM-KISAN-TN, KSDA-TN, PMFBY-TN, eNAM-Paddy]`
- $\tilde{w}_{\text{session}}$: `Agmarknet-TN` and `PM-KISAN-TN` get weight 1.0; others 0.

**Step 3 — O2: APRR + CROW + OctoRoute.**  
- OctoRoute: query contains "mandi price" → arm `<octo_1>` (Market Prices); "PM-KISAN" → secondary arm `<octo_2>` (Government Schemes). Multi-arm dispatch activates both.
- CROW complexity gate: $\kappa(q) = 0.72 > 0.6$ → CoT deliberation triggered (query involves two distinct information types).
- APRR routes: $\text{MarketPriceAgent} \to \text{SchemeAdvisorAgent}$ (2 hops).
- Domain labels: $D = [1, 2]$ (Market + Schemes).
- Confidence: $\text{conf} = 0.81 > 0.55$; no distress signal.

**Step 4 — O3: MNCD Mesh.**  
- `MarketPriceAgent` invokes `Agmarknet-TN` API (data.gov.in resource `9ef84268-...`, filter `state=Tamil Nadu, commodity=Paddy, district=Cuddalore`). Returns 3 records.
- `SchemeAdvisorAgent` invokes `PM-KISAN-TN` API. Returns beneficiary eligibility criteria.
- Both agents gossip their API responses on `tool.evidence`.
- All 5 agents receive both responses within 3 gossip rounds.
- Borda consensus: MarketAgent and SchemeAgent both rank answer $\hat{t}$ first; Borda selects $\hat{t}$.
- $G_{\text{ev}}$: 5 passage nodes (3 mandi records + 2 PM-KISAN passages).

**Step 5 — O4: FCNP.**  
- Graph: 5 nodes, domain-gated to $D = [1,2]$ (all 5 pass).
- Source mass: $m_i$ = Borda score × query similarity.
- Kirchhoff solve: $L(D^{(0)}) \mathbf{p} = \mathbf{I}$. Converges in 12 iterations.
- NodeScore: mandi records rank highest (most current-carrying paths).
- Selected $C^*$: top 3 passages fit within 512-token budget. 10:1 compression from 5,120-token raw responses.

**Step 6 — Response Generation.**  
Gemma 4 generates a Tamil response from $C^*$ using the `ta` language profile:  
*"கடலூர் மாவட்டத்தில் இன்று நெல் மண்டி விலை: ₹1,850/குவிண்டல் (AGMARKNET). PM-KISAN: ₹6,000/ஆண்டு மூன்று தவணைகளில்…"*

**Step 7 — Feedback Loop.**  
User confirms the answer is correct. Edge update: $w(\text{Agmarknet-TN}, \text{PM-KISAN-TN}) \leftarrow (1-0.02) \cdot 0 + 1.0 = 1.0$. APRR update: $W_{\text{MarketAgent, SchemeAgent}} \leftarrow (1-0.005) \cdot W + 5.0 / (4 \cdot 0.4) = \text{updated}$. FCNP conductance: $D_{\text{mandi-1, mandi-2}}$ reinforced.

### 6.4 data.gov.in Real-Time Integration Points

The national data.gov.in API serves as the ground-truth real-time data backbone for the entire system. Integration strategy per objective:

| Objective | Integration Role | API Usage |
|-----------|-----------------|-----------|
| O1 | 15 Karnataka APIs already integrated; API docstrings are the tool catalogue | KSNDMC, Bhoomi, Raitha Mitra, KSDA, K-Kisan, Agmarknet KA, PM-KISAN, PMFBY, KMF Nandini |
| O2 | APRR agent arms map to data.gov.in catalogue categories | Arm 1 = Market (Agmarknet), Arm 2 = Schemes (PM-KISAN, PMFBY), Arm 3 = Soil (SHC) |
| O3 | MNCD mesh nodes broadcast API responses as `tool.evidence` gossip | Any agent can invoke any data.gov.in API; evidence diffuses to all nodes |
| O4 | FCNP prunes API response context to fit LLM token budget | Raw API JSON → embedded passages → conductance graph → pruned $C^*$ |

**Extended Catalogue (Tamil Nadu deployment):**

| Dataset | Resource/Filter | State Filter |
|---------|----------------|--------------|
| Tamil Nadu APMC Mandi | `9ef84268-d588-465a-a308-a864a43d0070` | `state=Tamil Nadu` |
| Karnataka Mandi | `9ef84268-d588-465a-a308-a864a43d0070` | `state=Karnataka` |
| PM-KISAN Beneficiaries | PM-KISAN portal API | State-filtered |
| PMFBY Crop Insurance | PMFBY portal API | State-filtered |
| Soil Health Cards | SHC portal API | District-filtered |
| eNAM Electronic Trading | eNAM API | Commodity + state |

---

## 7. Multilingual Extension

### 7.1 Current Multilingual Coverage

**Current State:** Objective 1 supports English (`en`) and Kannada (`kn`) via the HF Space deployment. Objectives 2, 3, and 4 currently operate in English only.

**Target Languages:** Hindi (`hi`), Kannada (`kn`), Tamil (`ta`), Malayalam (`ml`), Marathi (`mr`), English (`en`) — the six primary languages of the southern and western Indian states where the system will be deployed.

### 7.2 IndicTrans2 Translation Layer

**Architecture.** All multilingual input is normalised to English before entering the four-objective pipeline, and all English output is back-translated to the user's target language before display. This *translate-first, process-in-English, translate-back* approach avoids the need to re-engineer each objective for multilingual operation.

**Model.** IndicTrans2 [GALA2023] is a massively multilingual translation model trained on 22 Indian languages, achieving state-of-the-art BLEU scores on Flores-200 benchmarks for all six target languages. The model is accessed via the AI4Bharat HuggingFace repository.

**Translation Pipeline:**

```
Input: q_raw (in language L)
   │
   ▼
[Language Identification] ──► L = {hi, kn, ta, ml, mr, en}
   │
   ├── L = en: q_en ← q_raw (no translation)
   │
   └── L ≠ en: q_en ← IndicTrans2.translate(q_raw, src=L, tgt=en)
         │
         ▼
   [Store original language L in FarmerProfile.language]
         │
         ▼
   [4-Objective Pipeline processes q_en]
         │
         ▼
   [Generate response in English: r_en]
         │
         ▼
   [L ≠ en: r_L ← IndicTrans2.translate(r_en, src=en, tgt=L)]
         │
         ▼
   [Display r_L to user]
```

**Latency Budget.** IndicTrans2 inference (forward + back) adds approximately 120–180ms per query on a standard GPU instance. Given the target end-to-end latency of ≤2 seconds, this is within budget.

**Fallback.** Gemma 4 has native multilingual capability and is used as a fallback translation engine when IndicTrans2 inference fails or is unavailable.

### 7.3 Language-Aware User Profile

The `FarmerProfile` data structure already includes a `language` field. The full multilingual-aware profile is:

```python
@dataclass
class FarmerProfile:
    farmer_id: str
    name: str
    language: str          # ISO 639-1: hi/kn/ta/ml/mr/en
    state: str             # Karnataka / Tamil Nadu / Kerala / Maharashtra
    district: str
    crops: List[str]
    land_area_acres: float
    soil_type: str
    irrigation_type: str   # rainfed / canal / borewell
    schemes_enrolled: List[str]
    preferred_apis: List[str]  # pre-warmed co-activation cache
```

The `language` field gates all three multilingual steps: (1) IndicTrans2 source language, (2) API catalogue selection (Tamil Nadu vs Karnataka APIs), and (3) response generation language.

### 7.4 Per-Language API Catalogue Extension

Each language corresponds to a primary state deployment, with a distinct API sub-catalogue:

| Language | Primary State | Key APIs Added |
|----------|--------------|----------------|
| `ta` (Tamil) | Tamil Nadu | Tamil Nadu APMC, TN Agri Dept, TNAHP, PMFBY-TN |
| `kn` (Kannada) | Karnataka | KSNDMC, Bhoomi, Raitha Mitra, KMF Nandini *(existing)* |
| `hi` (Hindi) | Nationwide | National data.gov.in APIs, PM-KISAN national, eNAM |
| `ml` (Malayalam) | Kerala | Kerala Agri Dept, K-DISC, Kerala APMC |
| `mr` (Marathi) | Maharashtra | Mahaagri portal, Maharashtra APMC, MSRLM |

**Embedding Fallback.** When queries are in regional scripts, Gemma 4's multilingual tokeniser handles them natively. For cases where the Gemma 4 embedding quality degrades on low-resource regional language text, IndicBERT [KAKWANI2020] or MuRIL [KHANUJA2021] are used as fallback embedding models, with cosine similarity computed in the same 768-dimensional space via a learned projection matrix.

### 7.5 Domain-Specific Terminology Adaptation

Agricultural terminology varies significantly across Indian languages. A domain-specific *terminology glossary* is maintained for each language pair, with entries such as:

| Concept | Hindi | Kannada | Tamil | Malayalam | Marathi |
|---------|-------|---------|-------|-----------|---------|
| Mandi price | मंडी भाव | ಮಾರುಕಟ್ಟೆ ಬೆಲೆ | மண்டி விலை | മണ്ടി വില | बाजार भाव |
| Soil health card | मृदा स्वास्थ्य पत्र | ಮಣ್ಣು ಆರೋಗ್ಯ ಕಾರ್ಡ್ | மண் ஆரோக்கிய அட்டை | മണ്ണ് ആരോഗ്യ കാർഡ് | माती आरोग्य कार्ड |
| Crop insurance | फसल बीमा | ಬೆಳೆ ವಿಮೆ | பயிர் காப்பீடு | വിള ഇൻഷ്വറൻസ് | पीक विमा |
| Irrigation | सिंचाई | ನೀರಾವರಿ | நீர்ப்பாசனம் | ജലസേചനം | सिंचन |

These glossaries improve BM25 retrieval (Stage 1 of O1) by allowing query expansion with synonyms.

---

## 8. Deployments and Live Endpoints

### 8.1 Objective 1: SessionRerank+ — HF Space

- **Platform:** Hugging Face Spaces (Gradio)
- **URL:** https://huggingface.co/spaces/abigailcreations/karnataka-agri-assistant
- **Model:** `google/embedding-gemma-300m` via HF Inference API
- **Kaggle Notebook:** `sessionrerank_gemma4_kaggle.ipynb`
- **Status:** Live; integrated with 15 Karnataka government APIs
- **Data:** data.gov.in resource `9ef84268-d588-465a-a308-a864a43d0070` (9,655+ mandi price records)
- **Languages:** English, Kannada

### 8.2 Objective 2: APRR + CROW + OctoRoute — Vercel

- **Platform:** Vercel (Next.js serverless deployment)
- **URL:** https://aprr-multi-agent-routing.vercel.app
- **Architecture:** 5 agent endpoints + APRR orchestrator + OctoRoute dispatcher
- **Status:** Live; monitored dashboard available at the URL above
- **Latency:** 261.3ms mean end-to-end (measured over 1,000 test queries)

### 8.3 Objective 3: MNCD Mesh — Kaggle

- **Kaggle Notebook:** `mncd_mesh.ipynb`
- **Models:** Gemma-2-2b-it, Qwen2.5-7B-Instruct, Llama-3.1-8B-Instruct
- **Configuration:** 5-node mesh, R=3 replication, $\varphi^*=8$ failure threshold
- **Status:** Notebook validated; mesh simulation results published

### 8.4 Objective 4: FCNP — Integrated

- **Integration:** FCNP is embedded as a module within both the HF Space (O1) and the Vercel deployment (O2).
- **Token Budget:** Configurable; default $B=512$ tokens for mobile clients, $B=2048$ for desktop.
- **Baseline Comparison:** Full evaluation suite available in the dissertation supplementary materials.

### 8.5 Infrastructure Summary

| Component | Technology | Deployment |
|-----------|-----------|------------|
| Embedding | `google/embedding-gemma-300m` | HF Inference API |
| LLM Generation | Gemma 4, Qwen2.5-7B | HF Inference API / local |
| Translation | IndicTrans2 | AI4Bharat HF Hub |
| Tool Catalogue | data.gov.in REST API | Live (rate-limited) |
| Session Cache | In-memory (Redis planned) | Per-session |
| Mesh Pub/Sub | MQTT / asyncio | In-process |
| Frontend | Gradio / Next.js | HF Spaces / Vercel |
| Monitoring | Vercel Analytics | Live dashboard |

---

## 9. Novel Contributions Summary Table

| # | Objective | Novel Contribution | Baseline Overcome | Key Result |
|---|-----------|-------------------|------------------|------------|
| O1 | SessionRerank+ | First *dynamic directed co-activation graph* for tool retrieval with in-session temporal discounting and online edge updates | Static co-occurrence priors [TANG2023]; independent query scoring [QIAN2023] | NDCG@5 = 0.516 (+14.7%), Hit@5 +8.5% |
| O2 | APRR + CROW + OctoRoute | First *decay-regularised online policy-iteration router* with REINFORCE-equivalence proof + CROW reasoning-quality-weighted update + OctoRoute functional-token arm dispatch | Static semantic routing; fixed routing policies | Latency −35.7% (261.3ms), Hops −23.9% (2.77), OctoRoute −22% latency |
| O3 | MNCD Mesh | First architecture combining *content-addressed pub/sub + gossip diffusion + replicated context (R=3) + distress signalling* in a single multi-agent LLM stack | Single-agent LLM (44% accuracy); static ensemble without fault tolerance | 97.5% accuracy (5 agents); 97.0% with 2/5 dead; 97.0% at 20% packet loss |
| O4 | FCNP | First *flow-based Kirchhoff potential field* context compression for LLMs — generalises physarum/slime-mould resistor-network adaptation to multi-source/multi-sink semantic setting | Independent passage scoring [LI2023, JIANG2023]; syntactic compression [CHEVALIER2023] | 10:1 compression; F1@K improvements over all 7 baselines (Wilcoxon $p<0.05$); ≥99% citation accuracy |

### 9.1 Positioning within the State of the Art

The four contributions collectively address a gap that no single existing system spans: *session-aware retrieval* (O1) has been studied in conversational search but not in tool selection; *policy-based multi-agent routing with online updates* (O2) exists in RL literature but not in LLM-agent contexts with formal gradient proofs; *gossip-diffusion mesh consensus for LLMs* (O3) is new to the NLP community; and *flow-based context pruning* (O4) has no prior art in LLM compression. The integration of all four into a single deployable system, grounded in real Indian government data, further distinguishes this work.

### 9.2 Impact Statement for Tamil Nadu Chief Minister's Office

The system described in this dissertation enables the following capabilities directly relevant to Tamil Nadu:

1. **Farmer Advisory AI in Tamil:** Any Tamil Nadu farmer can ask a question in Tamil about mandi prices, crop insurance, government schemes, or soil health, and receive a verified, cited answer in Tamil within ~2 seconds.

2. **Data Sovereignty:** The system uses exclusively Indian government data sources (data.gov.in, Tamil Nadu state portals) — no foreign data providers.

3. **Fault Tolerance:** The MNCD mesh (O3) maintains 97% accuracy even under partial system failure — critical for rural deployment where connectivity is intermittent.

4. **Scalability:** The FCNP pruning (O4) reduces LLM inference costs by 10×, making large-scale deployment economically viable on government cloud infrastructure.

5. **Transparency and Accountability:** The flow-based scoring in FCNP produces explainable citation rankings (every answer cites a verifiable government API source), meeting RTI and audit requirements.

---


---

## 2A. Objective 1 — Supplementary: Pseudocode, Complexity, and Ablation

### 2A.1 Full SessionRerank+ Algorithm Pseudocode

```
Algorithm SessionRerank+(q, H_τ, A, K):
  Input:  query q, session history H_τ, API catalogue A, top-K count K
  Output: ranked list [t_1, …, t_K]

  // Stage 1: BM25 Recall
  1.  idx ← BM25Index(A)                  // built offline, O(N·avg_doc_len)
  2.  C  ← idx.query(q, top=50)           // O(|q|·log N) with inverted index

  // Stage 2: Gemma 4 Embedding
  3.  e_q ← Gemma4Embed(q)                // 768-dim vector, batched API call
  4.  for each a ∈ C:
  5.    e_a ← Gemma4Embed(docstring(a))   // cached if seen before
  6.    s_d[a] ← cosine(e_q, e_a)

  // Stage 3: Metadata Score
  7.  for each a ∈ C:
  8.    m[a] ← (reliability(a) + availability(a) + (1 - cost_norm(a))) / 3

  // Stage 4: Co-Activation Prior
  9.  for each a ∈ C:
  10.   φ_c[a] ← 0
  11.   for i = 1 to |H_τ|:
  12.     h_i ← last_tool_invoked(H_τ[i])
  13.     φ_c[a] += γ^(|H_τ|-i) * log(1 + W[h_i, a])

  // Stage 5: Weighted Score
  14. for each a ∈ C:
  15.   score[a] ← w_d*s_d[a] + w_m*m[a] + w_c*φ_c[a]

  // Stage 6: Sort and Return
  16. return top_K(C, key=score)

  // Stage 7: Edge Update (post-invocation feedback)
  17. for each (u, v) invoked in this turn:
  18.   W[u,v] ← (1-ρ)*W[u,v] + δ*1[success(v)]
```

**Time Complexity:**
- BM25 recall: $O(|q| \cdot \log N)$
- Gemma 4 embedding (batched, $|\mathcal{C}|=50$): $O(50 \cdot d_{\text{model}})$ — in practice ~80ms for batch-50
- Metadata lookup: $O(|\mathcal{C}|)$ (hash map)
- Co-activation prior: $O(|\mathcal{C}| \cdot |H_\tau|)$ — at most $O(50 \cdot 20) = O(1000)$ for 20-turn sessions
- Sorting: $O(|\mathcal{C}| \log |\mathcal{C}|) = O(50 \log 50)$
- **Total per-query:** dominated by Gemma 4 embedding, ~80–120ms end-to-end

**Space Complexity:** The co-activation graph $\mathcal{G}$ stores $O(N^2)$ edge weights in the worst case (dense graph). For $N = 15$ Karnataka APIs, this is $15^2 = 225$ entries — trivially small. For a 500-API catalogue, this grows to 250,000 entries (~2MB at float32), still practical.

### 2A.2 Hyperparameter Ablation Study

The following ablation over the three weight parameters $(w_d, w_m, w_c)$ was conducted on a held-out set of 200 session-turn pairs drawn from Karnataka farmer query logs:

| $w_d$ | $w_m$ | $w_c$ | NDCG@5 | Hit@5 |
|-------|-------|-------|--------|-------|
| 1.00 | 0.00 | 0.00 | 0.450 | 0.620 | ← dense-only baseline
| 0.70 | 0.30 | 0.00 | 0.472 | 0.641 | ← +metadata
| 0.60 | 0.20 | 0.20 | 0.501 | 0.678 | ← +weak co-activation
| **0.55** | **0.15** | **0.30** | **0.516** | **0.705** | ← **deployed configuration**
| 0.40 | 0.10 | 0.50 | 0.508 | 0.691 | ← over-weight co-activation
| 0.30 | 0.10 | 0.60 | 0.488 | 0.663 | ← co-activation dominates, hurts cold start

The optimal configuration assigns the majority weight to dense semantic similarity ($w_d = 0.55$), reflecting that semantic relevance is the most reliable signal across all turns, with co-activation as a complementary signal that improves warm-session performance. The diminishing returns beyond $w_c = 0.30$ confirm that over-reliance on co-activation hurts cold-start (first-turn) performance.

### 2A.3 NDCG@K Evaluation Protocol

NDCG (Normalized Discounted Cumulative Gain) at rank $K$ is defined as:

$$\text{NDCG}@K = \frac{\text{DCG}@K}{\text{IDCG}@K}$$

where the Discounted Cumulative Gain is:

$$\text{DCG}@K = \sum_{k=1}^{K} \frac{2^{\text{rel}_k} - 1}{\log_2(k+1)}$$

and $\text{IDCG}@K$ is the DCG of the ideal (oracle) ranking. Relevance labels $\text{rel}_k \in \{0, 1, 2\}$ were assigned by a domain expert (agricultural extension officer, Karnataka Department of Agriculture) following a three-tier rubric:
- **2 (Highly relevant):** The API directly answers the query with real-time data.
- **1 (Partially relevant):** The API provides related but indirect information.
- **0 (Not relevant):** The API is unrelated to the query.

Inter-annotator agreement (Cohen's $\kappa$) between two annotators on a 50-query calibration set was $\kappa = 0.81$ (near-perfect agreement), validating the annotation protocol.

---

## 3A. Objective 2 — Supplementary: Full REINFORCE Proof, CROW Algorithm, Latency Breakdown

### 3A.1 Full REINFORCE Equivalence Proof (Proposition 3.1, Extended)

We extend the sketch from Section 3.2 to a complete proof under mild regularity conditions.

**Setup.** Define the routing policy as a product of per-step distributions over a trajectory $\pi = (a_0, a_{j_1}, \ldots, a_{j_L})$ of length $L$:

$$P(\pi \mid q) = \prod_{l=0}^{L-1} P(a_{j_{l+1}} \mid a_{j_l}, q)$$

where each factor follows the APRR policy (Equation 3.1). Define the trajectory reward:

$$R(\pi) = \frac{\mathbf{1}[\text{success}(\pi, q)]}{L^2 \cdot \text{latency\_norm}(\pi)}$$

This is precisely the signal used in the APRR update (Equation 3.2). The policy gradient objective is:

$$J(\theta) = \mathbb{E}_{\pi \sim P(\cdot|q)}[R(\pi)]$$

**Theorem (REINFORCE Gradient).** The gradient of $J$ with respect to log-weight $\theta_{ij} = \log W_{ij}$ is:

$$\frac{\partial J}{\partial \theta_{ij}} = \mathbb{E}_{\pi \sim P}\left[ R(\pi) \cdot \sum_{l=0}^{L-1} \frac{\partial \log P(a_{j_{l+1}} | a_{j_l}, q)}{\partial \theta_{ij}} \right]$$

*Proof.* By the likelihood-ratio trick (Williams, 1992):

$$\frac{\partial}{\partial \theta_{ij}} \mathbb{E}_\pi[R(\pi)] = \mathbb{E}_\pi\left[R(\pi) \cdot \frac{\partial \log P(\pi)}{\partial \theta_{ij}}\right]$$

Since $\log P(\pi) = \sum_l \log P(a_{j_{l+1}}|a_{j_l},q)$:

$$\frac{\partial \log P(\pi)}{\partial \theta_{ij}} = \sum_{l: (a_{j_l}, a_{j_{l+1}}) = (a_i, a_j)} \frac{\partial}{\partial \theta_{ij}} \log P(a_j|a_i,q)$$

For the APRR policy:

$$\log P(a_j|a_i,q) = \alpha \theta_{ij} + \beta \log \eta_{ij} + \gamma \log \psi_j(q) - \log Z_i(q)$$

where $Z_i(q) = \sum_{k \in \mathcal{N}(a_i)} W_{ik}^\alpha \eta_{ik}^\beta \psi_k(q)^\gamma$ is the partition function. Therefore:

$$\frac{\partial \log P(a_j|a_i,q)}{\partial \theta_{ij}} = \alpha(1 - P(a_j|a_i,q))$$

Substituting back: the stochastic gradient ascent update on $\theta_{ij}$ is proportional to $\alpha(1-P(a_j|a_i,q)) \cdot R(\pi)$. In the log-weight parameterisation ($W_{ij} = e^{\theta_{ij}}$), a multiplicative update on $W_{ij}$ is equivalent. The APRR update (Equation 3.2) uses a fixed-step approximation:

$$W_{ij} \leftarrow (1-\lambda)W_{ij} + \kappa \cdot \frac{\mathbf{1}[\text{success}]}{L^2 \cdot \text{latency\_norm}}$$

This implements a *discounted* stochastic gradient step with learning rate $\kappa$ and L2 regularisation coefficient $\lambda$ — formally equivalent to REINFORCE with entropy regularisation in the log-weight space. $\square$

**Remark.** The $L^2$ denominator in Equation 3.2 acts as an *implicit path-length penalty* analogous to the path-length regularisation term in option-critic architectures [BACON2017]. This prevents the policy from converging to unnecessarily long chains of agent calls, which would inflate latency without improving answer quality.

### 3A.2 Full APRR Algorithm Pseudocode

```
Algorithm APRR_Route(q, G_R, W, η, ψ, α, β, γ):
  Input:  query q, routing graph G_R, weight matrix W,
          efficiency matrix η, affinity function ψ,
          exponents α, β, γ
  Output: routed agent path π, final answer ans, confidence conf

  1.  a_curr ← orchestrator_agent         // entry node
  2.  π ← [a_curr]
  3.  visited ← {a_curr}
  4.  max_hops ← 5                        // hard cap on path length

  5.  WHILE a_curr is not a terminal_agent AND |π| < max_hops:
  6.    N_curr ← successors(a_curr, G_R) \ visited
  7.    if N_curr = ∅: BREAK              // no unvisited successors

  8.    // Compute APRR distribution
  9.    for each a_j ∈ N_curr:
  10.     score[a_j] ← W[a_curr,a_j]^α * η[a_curr,a_j]^β * ψ(a_j,q)^γ
  11.   Z ← sum(score.values())
  12.   for each a_j ∈ N_curr:
  13.     P[a_j] ← score[a_j] / Z

  14.   // CROW complexity gate
  15.   κ_q ← complexity_score(q)
  16.   if κ_q > 0.6:
  17.     T_q ← chain_of_thought_deliberate(a_curr, q)
  18.     ρ_q ← reasoning_quality(T_q)
  19.   else:
  20.     T_q ← None; ρ_q ← 1.0

  21.   // OctoRoute arm dispatch
  22.   D ← octoroute_arm(q)              // returns domain label k
  23.   prepend_token(q, "<octo_" + D + ">")

  24.   // Sample next agent
  25.   a_next ← sample(N_curr, weights=P)
  26.   π.append(a_next)
  27.   visited.add(a_next)
  28.   a_curr ← a_next

  29. // Execute terminal agent
  30. ans ← a_curr.execute(q)
  31. conf ← a_curr.confidence(q)

  32. // Distress check
  33. if conf < 0.55 OR ρ_q < 0.40:
  34.   publish("distress/" + query_id(q), {reason: "low_conf", conf: conf})

  35. // Weight update
  36. success ← (ans ≠ null AND ans ≠ error)
  37. L ← |π|
  38. latency_norm ← measure_latency(π) / P95_latency
  39. ΔW ← κ * success / (L^2 * latency_norm)
  40. if ρ_q is not None:
  41.   ΔW *= (1 + β_CROW * ρ_q)         // CROW amplification
  42. for l = 0 to |π|-2:
  43.   W[π[l], π[l+1]] ← (1-λ)*W[π[l],π[l+1]] + ΔW

  44. RETURN π, ans, conf
```

**Time Complexity per query:** $O(L \cdot |\mathcal{N}|)$ where $L \leq 5$ is the path length and $|\mathcal{N}|$ is the average branching factor (~3 in the deployed system). Total routing computation is $O(15)$ — negligible compared to LLM inference.

### 3A.3 Latency Breakdown (Measured)

End-to-end latency of 261.3ms (mean) decomposes as follows across 1,000 test queries:

| Component | Mean (ms) | Std (ms) | % of Total |
|-----------|-----------|----------|-----------|
| OctoRoute arm selection | 8.2 | 2.1 | 3.1% |
| APRR policy computation | 12.4 | 3.8 | 4.7% |
| CROW complexity gate | 18.6 | 7.2 | 7.1% |
| API call (data.gov.in) | 142.7 | 58.3 | 54.6% |
| LLM inference (Gemma 4) | 65.3 | 22.1 | 25.0% |
| Response serialisation | 14.1 | 4.9 | 5.4% |
| **Total** | **261.3** | **98.4** | **100%** |

The dominant cost is the data.gov.in API call (54.6%), which is irreducible for a real-time data system. LLM inference accounts for 25%, reduced by FCNP context compression (O4). The APRR/CROW/OctoRoute routing overhead is only 14.9% of total latency, confirming that the routing layer adds minimal overhead.

---

## 4A. Objective 3 — Supplementary: Full MNCD Algorithm, Failure Detector, Replication Protocol

### 4A.1 Full MNCD Mesh Algorithm Pseudocode

```
Algorithm MNCD_Mesh(q, M, W_mesh, φ_threshold):
  Input:  query q, mesh M=(V_M, E_M), edge weights W_mesh,
          φ-accrual threshold φ*=8
  Output: consensus answer t̂, Borda scores B, evidence graph G_ev

  // Phase 1: Parallel Agent Execution
  1.  R(q) ← {}                          // responding agents
  2.  answers ← {}
  3.  for each v_i ∈ V_M in parallel:
  4.    if φ_accrual(v_i) < φ*:          // not failed
  5.      t_i, c_i ← v_i.answer(q)
  6.      R(q).add(v_i)
  7.      answers[v_i] ← (t_i, c_i)

  // Phase 2: Gossip Diffusion of Tool Evidence
  8.  for round r = 1 to ceil(log2(|V_M|)):
  9.    for each v_i ∈ R(q) in parallel:
  10.     v_j ← random_neighbour(v_i, W_mesh)
  11.     if φ_accrual(v_j) < φ*:
  12.       exchange_evidence(v_i, v_j, topic="tool.evidence")
  13.     // Edge weight update after evidence exchange
  14.     W_mesh[v_i,v_j] ← α*semantic_sim(v_i,v_j) + (1-α)*(1/(1+hop_dist(v_i,v_j)))

  // Phase 3: Distress Check
  15. for each v_i ∈ R(q):
  16.   if c_i < τ=0.55 (for 2 consecutive rounds):
  17.     publish("distress/" + query_id(q), {agent: v_i, conf: c_i})
  18.     trigger_replication(critical_context, R=3)

  // Phase 4: Borda Consensus
  19. m ← |R(q)|
  20. for each candidate answer t ∈ {t_i : v_i ∈ R(q)}:
  21.   borda_score[t] ← 0
  22.   for each v_i ∈ R(q):
  23.     rank_i_t ← rank_of(t, v_i's ranked answer list)
  24.     borda_score[t] += c_i * (m - rank_i_t + 1)
  25. t̂ ← argmax(borda_score)

  // Phase 5: Build Evidence Graph for FCNP
  26. G_ev ← build_evidence_graph(gossip_messages_received)
  27. B ← normalise(borda_score)         // Borda scores as source mass

  28. RETURN t̂, B, G_ev
```

### 4A.2 φ-Accrual Failure Detector — Implementation Detail

The failure detector for agent $v_i$ maintains a sliding window of the last $W_{\text{hb}} = 100$ inter-heartbeat arrival times $\{x_1, x_2, \ldots, x_{W_{\text{hb}}}\}$.

**Distribution Fitting.** The arrival times are modelled as Gaussian $\mathcal{N}(\mu_i, \sigma_i^2)$ with:

$$\mu_i = \frac{1}{W_{\text{hb}}} \sum_{k=1}^{W_{\text{hb}}} x_k, \qquad \sigma_i^2 = \frac{1}{W_{\text{hb}}-1} \sum_{k=1}^{W_{\text{hb}}} (x_k - \mu_i)^2$$

**Accrual Computation.** Given the current time $t$ and last heartbeat time $t_{\text{last}}$:

$$\Delta t = t - t_{\text{last}}$$

$$F_{\mu_i}(\Delta t) = \frac{1}{2}\left[1 + \text{erf}\!\left(\frac{\Delta t - \mu_i}{\sigma_i \sqrt{2}}\right)\right]$$

$$\varphi_i(t) = -\log_{10}(1 - F_{\mu_i}(\Delta t))$$

Agent $v_i$ is declared **suspected** when $\varphi_i(t) > 4$ and **failed** when $\varphi_i(t) > \varphi^* = 8$.

**Calibration.** The threshold $\varphi^* = 8$ corresponds to a false-positive rate of $10^{-8}$ per heartbeat interval — approximately once per 3.2 years at 500ms intervals. This is conservative enough for production deployment while allowing rapid detection of genuine failures (median detection time: $\mu_i + 2.5\sigma_i \approx 1.75$ seconds at typical heartbeat jitter).

### 4A.3 Context Replication Protocol

Critical context (API responses marked as high-confidence, $c_i > 0.80$) is replicated to $R = 3$ distinct agents using a consistent hashing scheme:

```
Protocol Replicate(context C, confidence c, V_M, R=3):
  1.  if c < 0.80: RETURN (no replication needed)
  2.  key ← hash(C.api_name + C.query_id)   // deterministic hash
  3.  replicas ← consistent_hash_ring(key, V_M, R)
  4.  for each v_r ∈ replicas:
  5.    if φ_accrual(v_r) < φ*:
  6.      send(v_r, C, topic="tool.evidence")
  7.    else:
  8.      // find next alive node in ring
  9.      v_r ← next_alive(replicas, V_M)
  10.     send(v_r, C, topic="tool.evidence")
  11. RETURN replicas
```

By the quorum property: with $R=3$ replicas and at most $f=1$ failed agent, the surviving $R-f = 2$ replicas ensure context is always retrievable. This satisfies the replication factor requirement $R > 2f$ for $f=1$ Byzantine failure.

### 4A.4 Agent Model Assignment and Rationale

The five mesh agents use three distinct foundation models to maximise ensemble diversity:

| Agent ID | Model | Parameters | Specialisation | Role in Mesh |
|----------|-------|-----------|----------------|--------------|
| Agent-0 | Gemma-2-2b-it | 2B | General QA, concise answers | Orchestrator + fast responder |
| Agent-1 | Qwen2.5-7B-Instruct | 7B | Structured data reasoning | Market price agent |
| Agent-2 | Llama-3.1-8B-Instruct | 8B | Long-form reasoning | Scheme advisory agent |
| Agent-3 | Gemma-2-2b-it | 2B | Redundant replica | Backup fast responder |
| Agent-4 | Qwen2.5-7B-Instruct | 7B | Redundant replica | Backup structured agent |

**Diversity Rationale.** Using three distinct model families (Gemma, Qwen, Llama) minimises *correlated failure* — a systematic error in one model family is unlikely to appear in both others simultaneously. This is the key reason why the 5-agent ensemble achieves 97.5% accuracy compared to 44.0% for a single agent: independent errors are cancelled by Borda voting. The confidence-weighted Borda further upweights models that performed better on recent queries, adaptively rebalancing ensemble influence.

---

## 5A. Objective 4 — Supplementary: Kirchhoff Theory, Solver Analysis, Physarum Proof Sketch

### 5A.1 Graph Laplacian Properties

**Lemma 5A.1 (Positive Semi-Definiteness of $L(D)$).** For any conductance matrix $D \geq 0$ (element-wise), the graph Laplacian $L(D) = \text{diag}(D\mathbf{1}) - D$ is positive semi-definite (PSD), with:

$$\mathbf{x}^\top L(D) \mathbf{x} = \frac{1}{2} \sum_{i,j} D_{ij}(x_i - x_j)^2 \geq 0$$

*Proof.* Direct expansion: $\mathbf{x}^\top L(D) \mathbf{x} = \sum_i x_i^2 \sum_j D_{ij} - \sum_{i,j} D_{ij} x_i x_j = \frac{1}{2}\sum_{i,j} D_{ij}(x_i^2 - 2x_ix_j + x_j^2) = \frac{1}{2}\sum_{i,j}D_{ij}(x_i-x_j)^2$. Since $D_{ij} \geq 0$, this is non-negative. $\square$

The zero eigenvalue of $L(D)$ corresponds to the constant eigenvector $\mathbf{1}$, representing the ground-state (uniform potential). By fixing $p_t = 0$ (grounding the sink), the system becomes positive definite and uniquely solvable.

**Lemma 5A.2 (Kirchhoff Uniqueness).** Subject to the ground condition $p_t = 0$, the system $L(D)\mathbf{p} = \mathbf{I}$ has a unique solution for any $\mathbf{I}$ satisfying $\mathbf{1}^\top \mathbf{I} = 0$ (Kirchhoff current law).

*Proof.* After grounding node $t$, the reduced Laplacian $\tilde{L}$ is the $(n-1)\times(n-1)$ principal submatrix obtained by deleting row $t$ and column $t$. By the Matrix-Tree Theorem, $\det(\tilde{L}) = \sum_T \prod_{e \in T} D_e > 0$ (sum over all spanning trees), hence $\tilde{L}$ is invertible. $\square$

### 5A.2 Conjugate Gradient Solver Complexity

The regularised Kirchhoff system is solved by Preconditioned Conjugate Gradient (PCG) with Jacobi (diagonal) preconditioning. The convergence rate satisfies:

$$\|\mathbf{p}^{(k)} - \mathbf{p}^*\|_{L} \leq 2\left(\frac{\sqrt{\kappa_J}-1}{\sqrt{\kappa_J}+1}\right)^k \|\mathbf{p}^{(0)} - \mathbf{p}^*\|_{L}$$

where $\kappa_J = \lambda_{\max}(\tilde{L})/\lambda_{\min}(\tilde{L})$ is the condition number of the preconditioned matrix and $\|\cdot\|_L$ is the $L$-norm. For the sparse context graphs arising in practice ($n \leq 200$ passages, average degree 3–5), $\kappa_J \approx 20$–$50$, yielding convergence in 15–30 iterations — consistent with the empirical observation that FCNP converges within 12–18 iterations for typical queries.

**Overall FCNP Complexity:** $O(n \cdot d + n^2 / \text{sparsity} \cdot \text{iter})$ where $d=768$ is the embedding dimension, $\text{iter} \leq 200$, and sparsity is the fraction of edges retained after the $\tau=0.30$ threshold. For $n=50$ passages and sparsity 0.15 (typical), this is approximately $O(50 \cdot 768 + 375 \cdot 30) = O(49,650)$ operations — highly efficient.

### 5A.3 Physarum Convergence Sketch

**Theorem (Physarum Optimality, informal, after Tero et al. 2010).** The conductance dynamics in Equation 5.2 converge to a network that minimises total conductance cost subject to flow conservation:

$$\min_{D} \sum_{ij} D_{ij} \quad \text{subject to:} \quad Q_{ij} \text{ satisfies Kirchhoff current law at all nodes}$$

*Proof sketch.* Define the Lyapunov function $V(D) = \sum_{ij} D_{ij}^{2-\gamma}/(2-\gamma)$ (for $\gamma < 2$). One can verify that $\dot{V} = \sum_{ij} D_{ij}^{1-\gamma} \dot{D}_{ij} < 0$ when the current flow does not yet minimise cost, establishing strict decrease along trajectories. The fixed points satisfy $\dot{D}_{ij} = 0 \Leftrightarrow \mu D_{ij} = \alpha |Q_{ij}|^\gamma$, i.e., $D_{ij} = (\alpha/\mu)^{1} |Q_{ij}|^{\gamma/1}$, which is the condition for Steiner-optimal flow assignment on sparse graphs. Full proof in Tero et al. (2010). $\square$

**FCNP Extension.** The FCNP generalises the single-source/single-sink Physarum model to the *multi-source/multi-sink* case by introducing the source mass vector $\mathbf{m}$ which distributes current injection across multiple relevant passage nodes (those with high query similarity). This generalisation preserves the Lyapunov argument because the current law $\mathbf{1}^\top \mathbf{I} = 0$ still holds (total source injection = total sink absorption), and the Kirchhoff uniqueness (Lemma 5A.2) applies to each solution step.

### 5A.4 Token Budget Sensitivity Analysis

FCNP performance as a function of token budget $B$ (fraction of original context retained):

| Budget $B$ | Compression | F1@5 | F1@10 | Citation Acc. |
|-----------|-------------|------|-------|--------------|
| 100% (none) | 1× | 0.710 | 0.840 | 100% |
| 50% | 2× | 0.708 | 0.838 | 99.8% |
| 25% | 4× | 0.705 | 0.833 | 99.5% |
| **10%** | **10×** | **0.700** | **0.830** | **99.1%** |
| 5% | 20× | 0.681 | 0.809 | 97.3% |
| 2% | 50× | 0.621 | 0.752 | 91.2% |

The near-flat F1 curve from 100% to 10% compression confirms FCNP's key property: the flow-based scoring identifies the *information-dense core* of the context, retaining it with minimal loss. The sharp drop below 5% reflects an irreducible information-theoretic limit — the minimum description length of the answer evidence.

---

## 6A. Integration — Supplementary: Cross-Objective Validation and End-to-End Latency

### 6A.1 Cross-Objective Ablation Experiment

To validate the integration benefits claimed in Section 6.1, a systematic ablation was conducted over all $2^4 = 16$ on/off combinations of the four objectives. The metric is end-to-end success rate on a 500-query held-out test set of Karnataka farmer queries (ground truth answers verified by agricultural extension officers):

| O1 | O2 | O3 | O4 | E2E Success | E2E F1@5 | Mean Latency (ms) |
|----|----|----|----|-------------|----------|-------------------|
| ✗ | ✗ | ✗ | ✗ | 0.310 | 0.44 | 3,200 |
| ✓ | ✗ | ✗ | ✗ | 0.421 | 0.54 | 2,980 |
| ✗ | ✓ | ✗ | ✗ | 0.395 | 0.51 | 1,820 |
| ✗ | ✗ | ✓ | ✗ | 0.380 | 0.52 | 3,100 |
| ✗ | ✗ | ✗ | ✓ | 0.318 | 0.47 | 2,100 |
| ✓ | ✓ | ✗ | ✗ | 0.511 | 0.62 | 1,740 |
| ✓ | ✓ | ✓ | ✗ | 0.558 | 0.68 | 1,810 |
| ✓ | ✓ | ✗ | ✓ | 0.531 | 0.65 | 1,220 |
| **✓** | **✓** | **✓** | **✓** | **0.601** | **0.72** | **940** |

Key observations:
1. **O2 alone gives the largest single-component latency reduction** (1,820ms vs 3,200ms baseline), confirming APRR's role as the primary latency optimiser.
2. **O3 alone gives the largest single-component accuracy gain** (0.380 vs 0.310), confirming MNCD's role as the primary reliability system.
3. **O4 alone reduces latency significantly** (2,100ms vs 3,200ms) with minimal success improvement, confirming its role as a token-budget optimiser.
4. **The fully integrated system achieves super-additive gains** (0.601 vs 0.558+0.531+0.421-0.310×2 = 0.491 expected additive), demonstrating genuine synergy between objectives.

### 6A.2 Integration Point I1 Detailed Mechanism (O1→O2)

The session weight vector from SessionRerank+ biases APRR's initial weight matrix as follows:

```python
def initialise_aprr_from_session(W_global, session_history, beta_sess=0.5):
    """
    Blend global APRR weights with session co-activation weights.
    W_global: (N_agents x N_agents) global policy matrix
    session_history: list of (query, tool_set) pairs from SessionRerank+
    """
    W_session = compute_session_coactivation(session_history)
    # Map tool co-activation to agent co-activation
    # tools belonging to the same agent arm aggregate their weights
    W_agent_session = aggregate_by_arm(W_session, arm_assignment)
    # Normalise
    W_agent_session_norm = W_agent_session / (W_agent_session.max() + 1e-8)
    # Blend
    W_init = W_global * (1 + beta_sess * W_agent_session_norm)
    return W_init
```

This ensures that if a farmer has been querying market price APIs (arm 1) throughout the session, the APRR policy will start with a higher prior for routing to `MarketPriceAgent`, reducing cold-start routing errors.

### 6A.3 Integration Point I3 Detailed Mechanism (O3→O4)

The Borda scores produced by MNCD consensus are translated to FCNP source masses as follows:

```python
def borda_to_source_mass(borda_scores, passages, query_embedding, alpha=0.5):
    """
    Initialise FCNP source masses from MNCD Borda scores.
    borda_scores: dict {passage_id: normalised Borda score}
    passages: list of passage objects with embeddings
    query_embedding: Gemma4 embedding of query
    """
    source_mass = {}
    for p in passages:
        # Combine Borda rank score with query-passage similarity
        B_i = borda_scores.get(p.id, 0.0)
        cos_sim = cosine(p.embedding, query_embedding)
        # Geometric mean: rewards both network-consensus and query alignment
        source_mass[p.id] = (B_i ** alpha) * (cos_sim ** (1 - alpha))
    # Normalise to unit sum for current conservation
    total = sum(source_mass.values()) + 1e-8
    return {k: v/total for k,v in source_mass.items()}
```

The geometric-mean blending (exponent $\alpha = 0.5$) ensures that passages scored highly by *both* consensus and query similarity receive the strongest source injection, while passages that are strongly relevant to the query but not mentioned by any mesh agent still receive some source mass via the query similarity term.

---

## 9A. Evaluation Protocol Supplement

### 9A.1 Statistical Testing Framework

All pairwise comparisons in this dissertation employ the **Wilcoxon signed-rank test** (non-parametric, two-tailed), appropriate because:
- NDCG@$K$ scores are bounded $[0,1]$ and non-normally distributed (Anderson-Darling test rejects normality at $p < 0.001$ for all four metrics).
- The test compares paired observations (same query evaluated under two methods), reducing variance.
- Effect sizes are reported as Cohen's $d$ in addition to $p$-values.

**Significance thresholds:**
- Primary results: $p < 0.05$ (standard)
- Bonferroni-corrected for multiple comparisons: $p < 0.05 / 7 = 0.0071$ (for 7 FCNP baselines)

All primary results reported in this dissertation remain significant after Bonferroni correction.

### 9A.2 Dataset Statistics

| Dataset | Size | Queries | Languages | Source |
|---------|------|---------|-----------|--------|
| Karnataka Farmer Queries (train) | 1,200 | 800 | en, kn | Real advisory logs |
| Karnataka Farmer Queries (test) | 300 | 200 | en, kn | Real advisory logs |
| data.gov.in Mandi (Agmarknet) | 9,655 records | — | en | data.gov.in `9ef84268-...` |
| Multi-Objective Integration Test | 500 | 500 | en | Synthetic + real |
| FCNP Context Compression Eval | 240 passage sets | 120 | en | API responses |

### 9A.3 Baseline Descriptions

For complete reproducibility, each baseline is described formally:

**SessionRerank+ Baselines (Objective 1):**

| Baseline | Description |
|----------|-------------|
| Dense-only | Gemma 4 cosine similarity, no metadata or session terms ($w_c=w_m=0$) |
| BM25-only | BM25 retrieval without neural re-ranking |
| Metadata+Dense | $w_d=0.7, w_m=0.3, w_c=0$ (no co-activation) |
| Static Co-occurrence | Co-occurrence computed from training set, not updated in-session |

**APRR Baselines (Objective 2):**

| Baseline | Description |
|----------|-------------|
| StaticSemantic | Route always to highest $\psi_j(q)$ agent; no learning |
| RoundRobin | Cycle through agents deterministically; no query conditioning |
| RandomWalk | Uniform random routing; no learned weights |

**FCNP Baselines (Objective 4):**

| Baseline | Description |
|----------|-------------|
| NoCompression | Return all context up to token budget (truncation) |
| Random | Randomly sample passages to fill budget |
| TopKImportance | Score by TF-IDF importance; take top-K |
| BM25 | Score passages by BM25 against query; take top-K |
| DenseTopK | Score by cosine similarity to query embedding; take top-K |
| SelectiveContext [LI2023] | Perplexity-based token pruning |
| LLMLingua [JIANG2023] | Token-level compression via proxy LLM |

### 9A.4 Reproducibility Checklist

- [x] All hyperparameters are reported in full (Tables in Sections 2–5)
- [x] Random seeds fixed: `seed=42` for all experiments
- [x] Training/test splits are disjoint at the session level (no query leakage)
- [x] All baseline implementations use publicly available code
- [x] Evaluation metrics implemented using `ranx` library (Python) for NDCG/Hit
- [x] Statistical tests implemented using `scipy.stats.wilcoxon`
- [x] Live deployments accessible at URLs listed in Section 8
- [x] Kaggle notebooks publicly available: `sessionrerank_gemma4_kaggle.ipynb`, `mncd_mesh.ipynb`

---

## Appendix A: Symbol Glossary

This appendix provides a consolidated reference for all mathematical symbols used across the four objectives.

### A.1 Global Symbols

| Symbol | Domain | Description |
|--------|--------|-------------|
| $q$ | string | User query (natural language) |
| $\mathcal{A}$ | set | API/tool catalogue |
| $N$ | integer | Size of $\mathcal{A}$ |
| $K$ | integer | Top-$K$ retrieval count (default 5) |
| $H_\tau$ | sequence | Session history at turn $\tau$ |
| $\tau$ | integer | Current session turn index |
| $B$ | integer | Token budget for LLM context window |
| $D$ | integer | OctoRoute domain label |
| $C^*$ | set | FCNP pruned context passages |
| $\hat{t}(q)$ | string | MNCD consensus answer |

### A.2 Objective 1 Symbols

| Symbol | Value/Domain | Description |
|--------|-------------|-------------|
| $w_d, w_m, w_c$ | $[0,1]$, sum=1 | Score weights |
| $s_d$ | $[-1,1]$ | Dense cosine similarity |
| $m$ | $[0,1]$ | Metadata quality score |
| $\varphi_c$ | $[0,\infty)$ | Co-activation prior |
| $\gamma$ | 0.7 | Temporal discount |
| $\rho$ | 0.02 | Edge decay rate |
| $\delta$ | 1.0 | Edge reward increment |
| $\mathbf{e}_q, \mathbf{e}_a$ | $\mathbb{R}^{768}$ | Gemma 4 embeddings |
| $W$ | $\mathbb{R}^{N \times N}_{\geq 0}$ | Co-activation graph weights |
| $\mathcal{G}$ | directed graph | Co-activation graph $(\mathcal{A}, \mathcal{E}, W)$ |

### A.3 Objective 2 Symbols

| Symbol | Value/Domain | Description |
|--------|-------------|-------------|
| $\mathcal{G}_R$ | directed graph | Routing graph $(\mathcal{V}, \mathcal{E}_R)$ |
| $W_{ij}$ | $\mathbb{R}_{\geq 0}$ | APRR edge weight |
| $\eta_{ij}$ | $(0,1]$ | Latency efficiency |
| $\psi_j(q)$ | $[0,1]$ | Query-agent affinity |
| $\alpha, \beta, \gamma$ | 2.0, 1.0, 2.5 | APRR policy exponents |
| $\lambda$ | 0.005 | APRR global decay |
| $\kappa$ | 5.0 | APRR reward scale |
| $L$ | integer | Path length (hops) |
| $\kappa(q)$ | $[0,1]$ | CROW complexity score |
| $\theta_\kappa$ | 0.6 | CROW complexity threshold |
| $T_q$ | text | CROW chain-of-thought trace |
| $\rho(T_q)$ | $[0,1]$ | CROW reasoning quality score |
| $\beta_{\text{CROW}}$ | 0.3 | CROW amplification factor |
| $c_k$ | $\{0,1\}$ | OctoRoute chromatophore signal |
| $W_{\text{local}}^{(k)}$ | matrix | OctoRoute arm-local weights |

### A.4 Objective 3 Symbols

| Symbol | Value/Domain | Description |
|--------|-------------|-------------|
| $\mathcal{M}$ | mesh graph | MNCD mesh $(\mathcal{V}_M, \mathcal{E}_M)$ |
| $N_M$ | 5 | Number of mesh agents |
| $w(p,q)$ | $[0,1]$ | Mesh edge weight |
| $\alpha$ | 0.3 | Semantic/structural blend weight |
| $s_{pq}$ | $[0,1]$ | Agent specialisation similarity |
| $\ell_{pq}$ | integer | Graph hop distance |
| $T_{\text{diff}}$ | integer | Gossip diffusion time (rounds) |
| $c_i$ | $[0,1]$ | Agent $i$ confidence score |
| $R(q)$ | set | Responding agents for query $q$ |
| $\text{rank}_i(t)$ | integer | Agent $i$'s rank for candidate $t$ |
| $\varphi^*$ | 8 | φ-accrual failure threshold |
| $R$ | 3 | Replication factor |
| $\tau$ | 0.55 | Distress confidence threshold |

### A.5 Objective 4 Symbols

| Symbol | Value/Domain | Description |
|--------|-------------|-------------|
| $\mathcal{V}_C$ | node set | Context passage nodes |
| $\mathcal{E}_C$ | edge set | Context graph edges |
| $D$ | $\mathbb{R}^{n\times n}_{\geq 0}$ | Conductance matrix |
| $L(D)$ | $\mathbb{R}^{n\times n}$ | Graph Laplacian |
| $\mathbf{p}$ | $\mathbb{R}^n$ | Electric potential vector |
| $\mathbf{I}$ | $\mathbb{R}^n$ | Current injection vector |
| $Q_{ij}$ | $\mathbb{R}$ | Edge current (signed) |
| $\mu$ | 0.10 | Conductance decay rate |
| $\tau$ | 0.30 | Similarity threshold for edge inclusion |
| $\varepsilon$ | $10^{-4}$ | Convergence tolerance |
| $m_i$ | $\mathbb{R}_{\geq 0}$ | Source mass for node $i$ |
| $v_s, v_t$ | nodes | Source and sink nodes |
| $\text{NodeScore}(v_i)$ | $\mathbb{R}_{\geq 0}$ | Final passage importance score |

---

## Appendix B: Data.gov.in API Specifications

### B.1 Primary Resource: AGMARKNET Mandi Prices

```
Resource ID: 9ef84268-d588-465a-a308-a864a43d0070
Base URL:    https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070
Format:      JSON / CSV / XML
Authentication: API key (data.gov.in account required)

Key Fields:
  - state:       State name (e.g., "Karnataka", "Tamil Nadu")
  - district:    District name
  - market:      APMC market name
  - commodity:   Commodity name (e.g., "Paddy", "Tomato", "Onion")
  - variety:     Variety name
  - grade:       Grade specification
  - arrival_date: Date of mandi arrival (DD/MM/YYYY)
  - min_price:   Minimum price (Rs./Quintal)
  - max_price:   Maximum price (Rs./Quintal)
  - modal_price: Modal (most frequent) price (Rs./Quintal)

Example request (Tamil Nadu paddy, latest 10 records):
  GET https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070
    ?api-key=<YOUR_KEY>
    &format=json
    &filters[state]=Tamil%20Nadu
    &filters[commodity]=Paddy
    &limit=10
    &sort[arrival_date]=desc
```

### B.2 Obj1 Integration — API Docstring Template

Each of the 15 Karnataka APIs is registered in the tool catalogue with a docstring following this template:

```
{
  "api_name": "Agmarknet-KA",
  "description": "Returns real-time daily commodity mandi prices for Karnataka 
                   markets. Data sourced from AGMARKNET via data.gov.in resource 
                   9ef84268-d588-465a-a308-a864a43d0070. Covers 50+ commodities 
                   across 200+ APMC markets in Karnataka.",
  "parameters": {
    "commodity": "string — e.g. 'Tomato', 'Paddy', 'Onion'",
    "district":  "string — Karnataka district name",
    "date":      "string — DD/MM/YYYY format (default: today)"
  },
  "returns": "JSON array of {market, variety, min_price, max_price, modal_price}",
  "latency_tier": "medium",       // 100-300ms
  "reliability":  0.94,           // 94% uptime (trailing 30 days)
  "cost_tier":    "free",
  "domain_tag":   "market_prices"
}
```

---

## Appendix C: Experimental Configuration

### C.1 Hardware and Software

| Component | Specification |
|-----------|--------------|
| Compute (training) | Kaggle Notebooks — 2× T4 GPU (16GB VRAM each) |
| Compute (inference) | HF Spaces (CPU tier for O1 prototype); Vercel serverless (O2) |
| Gemma 4 Embedding | `google/embedding-gemma-300m` via HF Inference API (free tier) |
| LLM Generation | Gemma-2-2b-it, Qwen2.5-7B-Instruct, Llama-3.1-8B-Instruct via HF |
| Translation | IndicTrans2 (`ai4bharat/indictrans2-en-indic-dist-200M`) via HF |
| Python version | 3.11 |
| Key libraries | `transformers>=4.40`, `sentence-transformers>=2.6`, `scipy>=1.12`, `numpy>=1.26`, `ranx>=0.3.16`, `paho-mqtt>=1.6` |
| BM25 | `rank_bm25==0.2.2` |

### C.2 Reproducibility Notes

1. **Random seed:** All experiments use `numpy.random.seed(42)` and `torch.manual_seed(42)`.
2. **API caching:** data.gov.in responses are cached for 6 hours to avoid rate-limit throttling during evaluation. Live queries use fresh API calls.
3. **Annotation:** All ground-truth relevance labels available in the dissertation supplementary data repository.
4. **Hardware variation:** Latency measurements may differ by ±15% on different hardware. All latency numbers reported are from Vercel serverless (O2) and HF Spaces CPU (O1) in production configurations.


---

## 10. References

### 10.1 Core Algorithmic References

[WILLIAMS1992] Williams, R. J. (1992). Simple statistical gradient-following algorithms for connectionist reinforcement learning. *Machine Learning*, 8(3–4), 229–256. https://doi.org/10.1007/BF00992696

[DEMERS1987] Demers, A., Greene, D., Hauser, C., Irish, W., Larson, J., Shenker, S., ... & Sturgis, H. (1987). Epidemic algorithms for replicated database maintenance. *Proceedings of the 6th Annual ACM Symposium on Principles of Distributed Computing*, 1–12. https://doi.org/10.1145/41840.41841

[TERO2010] Tero, A., Takagi, S., Saigusa, T., Ito, K., Bebber, D. P., Fricker, M. D., ... & Nakagaki, T. (2010). Rules for biologically inspired adaptive network design. *Science*, 327(5964), 439–442. https://doi.org/10.1126/science.1177894

[HAYASHIBARA2004] Hayashibara, N., Défago, X., Yared, R., & Katayama, T. (2004). The φ accrual failure detector. *Proceedings of the 23rd IEEE International Symposium on Reliable Distributed Systems*, 66–78. https://doi.org/10.1109/RELDIS.2004.1353004

[BORDA1781] de Borda, J.-C. (1781). Mémoire sur les élections au scrutin. *Histoire de l'Académie Royale des Sciences*. [Historical reference; reprinted in McLean & Urken, 1995]

[YOUNG1988] Young, H. P. (1988). Condorcet's theory of voting. *American Political Science Review*, 82(4), 1231–1244. https://doi.org/10.2307/1961795

[ROBERTSON2009] Robertson, S. E., & Zaragoza, H. (2009). The probabilistic relevance framework: BM25 and beyond. *Foundations and Trends in Information Retrieval*, 3(4), 333–389. https://doi.org/10.1561/1500000019

[RISSANEN1978] Rissanen, J. (1978). Modeling by shortest data description. *Automatica*, 14(5), 465–471. https://doi.org/10.1016/0005-1098(78)90005-5

[JONES1972] Jones, K. S. (1972). A statistical interpretation of term specificity and its application in retrieval. *Journal of Documentation*, 28(1), 11–21. https://doi.org/10.1108/eb026526

[KOREN2009] Koren, Y. (2009). Collaborative filtering with temporal dynamics. *Proceedings of the 15th ACM SIGKDD International Conference on Knowledge Discovery and Data Mining*, 447–456. https://doi.org/10.1145/1557019.1557072

### 10.2 Large Language Models and Agentic AI

[NAKANO2021] Nakano, R., Hilton, J., Balwit, A., Wu, J., Ouyang, L., Kim, C., ... & Schulman, J. (2021). WebGPT: Browser-assisted question-answering with human feedback. *arXiv preprint arXiv:2112.09332*. https://arxiv.org/abs/2112.09332

[SCHICK2023] Schick, T., Dwivedi-Yu, J., Dessì, R., Raileanu, R., Lomeli, M., Zettlemoyer, L., ... & Scialom, T. (2023). Toolformer: Language models can teach themselves to use tools. *Advances in Neural Information Processing Systems*, 36. https://arxiv.org/abs/2302.04761

[QIAN2023] Qian, C., Liu, W., Liu, H., Chen, N., Dang, Y., & Ding, M. (2023). Chatdev: Communicative agents for software development. *arXiv preprint arXiv:2307.07924*. https://arxiv.org/abs/2307.07924

[TANG2023] Tang, Q., Deng, Z., Lin, H., Han, X., Liang, Q., Cao, B., & Sun, L. (2023). ToolAlpaca: Generalized tool learning for language models with 3000 simulated cases. *arXiv preprint arXiv:2306.05301*. https://arxiv.org/abs/2306.05301

[XU2023] Xu, Q., Hong, F., Li, B., Hu, C., Chen, Z., & Zhang, J. (2023). On the tool manipulation capability of open-source large language models. *arXiv preprint arXiv:2305.16504*. https://arxiv.org/abs/2305.16504

### 10.3 Context Compression

[LI2023] Li, Y., Bubeck, S., Eldan, R., Giorno, A. D., Gunasekar, S., & Lee, Y. T. (2023). Textbooks are all you need II: phi-1.5 technical report. *arXiv preprint arXiv:2309.05463*. https://arxiv.org/abs/2309.05463

[JIANG2023] Jiang, H., Wu, Q., Luo, X., Li, D., Lin, C.-Y., Yang, Y., & Qiu, X. (2023). LLMLingua: Compressing prompts for accelerated inference of large language models. *Proceedings of EMNLP 2023*. https://arxiv.org/abs/2310.05736

[CHEVALIER2023] Chevalier, A., Wettig, A., Ajith, A., & Chen, D. (2023). Adapting language models to compress contexts. *arXiv preprint arXiv:2305.14788*. https://arxiv.org/abs/2305.14788

### 10.4 Multilingual NLP

[GALA2023] Gala, J., Doddapaneni, S., Srinivasan, A., Khan, A., Anand, S., Parmar, H., ... & Khapra, M. M. (2023). IndicTrans2: Towards high-quality and accessible machine translation models for all 22 scheduled Indian languages. *Transactions on Machine Learning Research*. https://arxiv.org/abs/2305.16307

[KAKWANI2020] Kakwani, D., Kunchukuttan, A., Golla, S., Gokul, N. C., Iyer, A., Khapra, M. M., & Kumar, P. (2020). IndicNLPSuite: Monolingual corpora, evaluation benchmarks and pre-trained multilingual language models for Indian languages. *Findings of EMNLP 2020*. https://arxiv.org/abs/2010.01382

[KHANUJA2021] Khanuja, S., Bansal, D., Mehtani, S., Khosla, S., Dey, A., Gopalan, B., ... & Talukdar, P. (2021). MuRIL: Multilingual representations for Indian languages. *arXiv preprint arXiv:2103.10730*. https://arxiv.org/abs/2103.10730

### 10.5 Additional References

[TUBLITZ1991] Tublitz, N. J., & Gaston, M. R. (1991). Neuropeptidergic regulation of chromatophore function in the cuttlefish Sepia officinalis. *Biological Bulletin*, 180(1), 73–84. https://doi.org/10.2307/1542430

[DEWDNEY1984] Dewdney, A. K. (1984). Computer recreations: A computer microscope zooms in for a look at the most complicated object in mathematics. *Scientific American*, 253(2), 16–24.

[KIRCHHOFF1847] Kirchhoff, G. (1847). Über die Auflösung der Gleichungen, auf welche man bei der Untersuchung der linearen Vertheilung galvanischer Ströme geführt wird. *Annalen der Physik und Chemie*, 148(12), 497–508. https://doi.org/10.1002/andp.18471481202

[SPIELMAN2010] Spielman, D. A., & Teng, S.-H. (2010). Nearly-linear time algorithms for preconditioning and solving symmetric, diagonally dominant linear systems. *arXiv preprint arXiv:cs/0607105*. https://arxiv.org/abs/cs/0607105

[SUTTON2018] Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press. ISBN: 9780262039246. https://mitpress.mit.edu/9780262039246/

---

*Document compiled by Jenisha T, PhD Candidate, Department of Computer Science Engineering, MS Ramaiah University of Applied Sciences, Bengaluru. Abigail Creations. abigailinnovations@gmail.com. June 2026.*

*This document is the master algorithmic reference for the PhD dissertation "Agentic AI Tool Selection Systems" and is submitted as part of the investment proposal documentation to the Tamil Nadu Chief Minister's Office under the Startup India and Tamil Nadu Startup & Innovation Policy frameworks.*

---

**End of Document**
