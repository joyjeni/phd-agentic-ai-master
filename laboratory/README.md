# Adaptive Context Reasoning System (ACRS)

Ph.D. research laboratory for **Jenisha T** (Register No. `24ETRP720001`), Computer
Science and Engineering, M S Ramaiah University of Applied Sciences, Faculty of
Engineering and Technology. Supervisor: **Dr. Jyothi A P**. Date of registration:
04 September 2024.

The programme proposes **ACRS** — a structural orchestration layer for multi-agent
LLM ecosystems — as four named subsystems in one closed loop:

1. **O1 SATR** (`session-aware-toolbench-rerank`) — **Session-Aware Tool Retrieval**:
   fused session ranking with a co-activation cache. Not a new LLM. Not live prices.
2. **O2 APRR** (`aprr-multi-agent-routing`) — Adaptive **Probabilistic** Routing
   Reinforcement over tool-specialist agents.
3. **O3 MNCD** (`mncd-mesh-agents`) — Mesh Network Context Diffusion: gossip,
   **score-sum** consensus (not Borda), live Indian Open Government Data.
4. **O4 FCNP** (`fcnp-context-pruning`) — Flow-Coupled Network Pruning
   (Kirchhoff / Physarum) with citation write-back into SATR.

This repository is the integrated Next.js laboratory. Proposal-stage evidence is
architectural completeness and live-pipeline integrity. **No NDCG, latency, token,
or accuracy number is a commitment of the research proposal.**

## Data policy (journal-publishable Indian OGD)

Live inference reads **only** verified `data.gov.in` Agriculture resources
(GODL-India / NIC), including AGMARKNET
`9ef84268-d588-465a-a308-a864a43d0070`, DES crop production, IMD rainfall,
horticulture, fertilizer subsidy, and land-use statistics. ToolBench / ToolLLM
(Qin et al., ICLR 2024, Apache-2.0) is the **ranking library**, not the execution
corpus. StableToolBench dumps, Kaggle NPK, and PlantVillage are out of scope.
**Records are never invented.** If a crop/state is missing today, other **live**
rows from the same resource are shown.

See `/datasets` for the survey. `GET /api/datagov` is the raw probe. Transient
HTTP 5xx/429 are retried; snapshot files are not used as a fallback.

## Exact formulas and worked traces

How the proposal is implemented (the equations in `lib/research/satr.ts`,
`aprr.ts`, `mncd.ts`, `fcnp.ts`) plus two complete SATR → APRR → MNCD → FCNP
passes:

1. One **ToolBench-schema** datum (`tb.agri.soil_health`) — ranking library only.
2. One **live data.gov.in** AGMARKNET query (wheat / Punjab).

Lab page: `/walkthrough`. Animated information flow: home, `/algorithms`,
`/architecture`, and `/walkthrough`. Pseudocode: `/algorithms`. Journal mermaid
redraws of every archived GitHub `diagrams/` PNG: `/diagrams`.
Markdown: `docs/PIPELINE_WALKTHROUGH.md`.
Proposal slides include motivation, formulas, and implemented algorithms.
Numbers dated 07 September 2026 are traces, not metric commitments.

## Closed loop

```text
q_t + co-activation cache + FCNP memory
    → POST /api/services/satr
    → POST /api/services/aprr
    → POST /api/services/mncd   (live data.gov.in only)
    → POST /api/services/fcnp
    → M_t written back into SATR at t+1
```

## Research proposal deck

The deck follows the MSRUAS Gowrishankar PRP2 college template: **white slides**, official Ramaiah logo on every slide, light-blue edge bars, date + numbered footer, and campus photographs from [msruas.ac.in](https://www.msruas.ac.in/). Required academic outline:
Introduction, Literature Review (Evidence 1, Evidence 2, … — journals and top
conference proceedings only; preprints are not cited), Summary of Literature
Review, To Solve the Research Gap (G1–G5 mapped onto SATR / APRR / MNCD / FCNP),
Identified Research Problem, Research Title & Aim, Research Objectives,
Research Questions, Research Methodology (one method slide per objective plus the
integrated loop), Conclusion. Canonical sources: `lib/research/literature.ts` and
`lib/research/slides.ts`. Preview: `/proposal` and `/literature`.
Pasteable Word form: `docs/LITERATURE_SURVEY.md`.

## Where to get the PowerPoint

Use the **Download** button in the lab nav, or open `/download`. Buttons save:

1. PowerPoint — `ACRS_PhD_Proposal_JenishaT_24ETRP720001.pptx`
2. PRP copy — `Gowrishankar_PPT_PRP2_ACRS_JenishaT.pptx`
3. ZIP of both decks
4. PDF — `JenishaT_ACRS_PhD_Proposal.pdf`
5. Markdown — pasteable outline

Direct URLs: `/api/slides/pptx?download=1`, `/api/slides/pdf?download=1`, `/slides.zip`.

Rebuild: `npm run slides` then Chrome-print `/proposal/print` if you need a fresh PDF.

## Run locally

```bash
npm install
npx vitest run
python3 notebooks/kaggle_e2e.py
npm run dev -- --port 43127 --hostname 0.0.0.0
```

Open `http://127.0.0.1:43127`. A personal data.gov.in key is optional
(`DATA_GOV_API_KEY`). Live AGMARKNET works with the public visualization key
published on the resource page.

## Deploy on Vercel

Next.js app. Set `DATA_GOV_API_KEY` in Vercel env if you want your own quota.

## Publication stance

See `docs/PUBLICATION_READINESS.md` and `/publication`. Algorithms and SOTA
citations are real; top-venue empirical claims are not yet earned and are not
promised in the proposal.
