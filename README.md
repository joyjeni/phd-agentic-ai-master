# ACRS master — Adaptive Context Reasoning System

> **Ph.D. research proposal (Computer Science and Engineering)**  
> M S Ramaiah University of Applied Sciences · Faculty of Engineering and Technology  
> Scholar: **Jenisha T** · Register No. **24ETRP720001** · Part-Time  
> Supervisor: **Dr. Jyothi A P** · Date of registration: **04 September 2024**

This repository is the **integration contract** for four named subsystems:

| Order | Code | Repository | Role in the thesis |
|------:|------|------------|--------------------|
| 1 | SATR | `session-aware-toolbench-rerank` | Session-aware tool retrieval |
| 2 | APRR | `aprr-multi-agent-routing` | Training-free specialist routing |
| 3 | MNCD | `mncd-mesh-agents` | Mesh consensus + live Indian OGD |
| 4 | FCNP | `fcnp-context-pruning` | Kirchhoff/Physarum prune + write-back |

Integration is **not** a fifth algorithm. It is the typed loop

```text
q_t + M_{t-1} → SATR → APRR → MNCD → FCNP → a_t + M_t
```

with \(M_t\) becoming SATR’s prior at \(t+1\).

## Proposal-stage stance

This programme **does not commit** NDCG, latency, hop-count, token-ratio, or
accuracy numbers. Published empirical figures belong to the cited SOTA papers
(ToolLLM, ToolRerank, MasRouter, RouteLLM, PILOT, AutoGen, MetaGPT, ChatDev,
CAMEL, LLMLingua, Tero et al.). Closing gaps G1–G5 is evidenced by a runnable
loop, citable equations, and live `data.gov.in` integrity — not by a promised
leaderboard.

## Literature → gaps → objectives

Multi-agent orchestration is treated as a **systems** problem (Wu et al.,
AutoGen, COLM 2024 / ICLR 2024 workshop; Hong et al., MetaGPT, ICLR 2024; Qian
et al., ChatDev, ACL 2024; Li et al., CAMEL, NeurIPS 2023) combined with tool
learning (Qin et al., ToolLLM, ICLR 2024; Zheng et al., ToolRerank,
LREC-COLING 2024).

| Gap | SOTA limitation | Objective that addresses it |
|-----|-----------------|-----------------------------|
| G1 | Turn-amnesic retrieval | SATR session fusion |
| G2 | Model routers / authored SOPs | APRR Dirichlet–Thompson over **tool agents** |
| G3 | Star / SOP / chat; vote ≠ tool ID | MNCD gossip + score-sum |
| G4 | Compressors without retrieval write-back | FCNP + SATR prior |
| G5 | No closed four-stage contract on Indian OGD | This master loop |

## Data policy (journal-publishable)

Live inference uses **only** verified Indian Open Government Data on
`data.gov.in` (GODL-India / NIC), including AGMARKNET
`9ef84268-d588-465a-a308-a864a43d0070`. ToolBench is the ranking library.
**Prices are never invented.** Guo, Woodruff, and Yadav (PECAD, AAAI 2020,
doi:10.1609/aaai.v34i08.7039) are cited as AGMARKNET *precedent*, not as a
baseline this proposal claims to beat.

## Python orchestrator

The Next.js laboratory is the farmer-facing demo. This folder’s HTTP equivalent:

```bash
python orchestrator/pipeline.py "What is the current mandi price of tomato in Punjab?"
```

| Service | Default | Repo |
|---------|---------|------|
| SATR `POST /rerank` | `:43131` | session-aware-toolbench-rerank |
| APRR `POST /route` | `:43132` | aprr-multi-agent-routing |
| MNCD `POST /mesh` | `:43133` | mncd-mesh-agents |
| FCNP `POST /prune` | `:43134` | fcnp-context-pruning |

MNCD consensus is **score-sum** by default. Live rows require a data.gov.in key
or the public visualization key; missing live data **fails loudly**.

## Related objective READMEs

Each objective repository states: thesis definition, SOTA papers with venues,
novelty for the research community, and the Indian OGD constraint.
