# ACRS master — Adaptive Context Reasoning System

> **Ph.D. research proposal (Computer Science and Engineering)**  
> M S Ramaiah University of Applied Sciences · Faculty of Engineering and Technology  
> Scholar: **Jenisha T** · Register No. **24ETRP720001** · Part-Time  
> Supervisor: **Dr. Padma Priya Darshini P** · Date of registration: **04 September 2024**

This repository is the **integration contract** for four named subsystems:

| Order | Code | Repository | Role in the thesis |
|------:|------|------------|--------------------|
| 1 | SATR | `session-aware-toolbench-rerank` | Session-aware tool retrieval |
| 2 | APRR | `aprr-multi-agent-routing` | Risk-signed contextual-bandit routing (LinUCB family) |
| 3 | MNCD | `mncd-mesh-agents` | Evidence-weighted quorum consensus + live Indian OGD |
| 4 | FCNP | `fcnp-context-pruning` | Typed-block pruning with PI fidelity controller + write-back |

Integration is **not** a fifth algorithm. It is the typed loop

```text
q_t + M_{t-1} → SATR → APRR → MNCD → FCNP → a_t + M_t
```

with \(M_t\) becoming SATR’s prior at \(t+1\).

## Current proposal deck (07 September 2026)

FET outline with **research methodology for each objective**:

1. Introduction  
2. Literature Review  
3. Summary of Literature Review  
4. Identified Research Problem  
5. Research Title & Aim  
6. Research Objectives  
7. Research Questions  
8. Research Methodology (O1 SATR, O2 APRR, O3 MNCD, O4 FCNP, integrated loop, **exact repository formulas**, ToolBench walkthrough, data.gov.in walkthrough)  
9. Conclusion  

Worked traces (lab numbers from 07 September 2026, not metric claims): one ToolBench-schema tool (`tb.agri.soil_health`) and one live AGMARKNET query (wheat / Punjab) through all four objectives. In the laboratory: `/walkthrough`. Markdown: `docs/PIPELINE_WALKTHROUGH.md` and `laboratory/docs/PIPELINE_WALKTHROUGH.md`. 

**Download these files from this repository** (open in PowerPoint — Cursor cannot preview `.pptx`):

| File | What it is |
|------|------------|
| [`Gowrishankar_PPT_PRP2_ACRS_JenishaT.pptx`](./Gowrishankar_PPT_PRP2_ACRS_JenishaT.pptx) | PRP copy: live slide numbers + automatic date |
| [`JenishaT_ACRS_PhD_Proposal.pdf`](./JenishaT_ACRS_PhD_Proposal.pdf) | Same deck as PDF |
| [`presentations/ACRS_PhD_Proposal_JenishaT_24ETRP720001.pptx`](./presentations/ACRS_PhD_Proposal_JenishaT_24ETRP720001.pptx) | Same PowerPoint, college filename |

Editable slide source: `docs/slides/` and `laboratory/lib/research/slides.ts`.

Runnable Next.js laboratory (SATR → APRR → MNCD → FCNP on live data.gov.in):

```bash
cd laboratory
npm install
npx vitest run
npm run dev -- --port 43127 --hostname 0.0.0.0
```

Then open `/walkthrough` for the formula-and-data pass, or `/proposal` for the FET deck.

## Executable results (v1, 3 Nov 2026)

All four objectives run end to end; see [`experiments/RESULTS.md`](experiments/RESULTS.md) and the free-Colab
notebook [`experiments/ACRS_benchmark.ipynb`](experiments/ACRS_benchmark.ipynb). Headline (simulated agents, 3 seeds,
leak-filtered): SATR v2 lifts held-out NDCG@5 by 12.4 % over BM25 (5-fold CV, 95 % CI excludes 0).
Versus a SOTA-analogue baseline, full ACRS cuts accepted errors 24.0 % → 2.0 %, cost −54 %,
and meets the Φ* = 0.78 fidelity floor on 99.7 % of turns while removing 47 % of tokens, at 21 % abstention.

Panel-review responses: [`docs/PANEL_REVIEW.md`](docs/PANEL_REVIEW.md) · formal claims: [`docs/THEORY.md`](docs/THEORY.md) · thesis plan: [`docs/THESIS_PLAN.md`](docs/THESIS_PLAN.md) · reproduce: `make all`.

## Earlier proposal-stage stance (superseded by the results above)

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
| G2 | Model routers / authored SOPs | APRR risk-signed contextual bandit over **tool agents** |
| G3 | Star / SOP / chat; vote ≠ tool ID | MNCD evidence-weighted quorum with abstention |
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

The lab service uses score-sum consensus; the research package (`paim`) uses the evidence-weighted quorum evaluated in `experiments/`. Live rows require a data.gov.in key
or the public visualization key; missing live data **fails loudly**.

## Related objective READMEs

Each objective repository states: thesis definition, SOTA papers with venues,
now

novelty for the research community, and the Indian OGD constraint.
