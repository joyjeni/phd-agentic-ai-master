import { Card } from "@/components/ui/card";
import { WalkthroughLive } from "@/components/walkthrough-live";
import {
  APRR_FORMULA,
  FCNP_FORMULA,
  MNCD_FORMULA,
  PIPELINE_ALGO,
  SATR_FORMULA,
} from "@/lib/research/formulas";
import {
  AIRCRAFT_HONESTY,
  DATAGOV_MANDI,
  MANDI_STAGES,
  SOIL_STAGES,
  TOOLBENCH_G1_ROW,
  TOOLBENCH_SOIL,
  type StageStep,
} from "@/lib/research/walkthrough";
import { COLLEGE } from "@/lib/research/college";
import Link from "next/link";

function Formula({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-[var(--gold)]/40 bg-black/30 px-3 py-2 font-mono text-[12px] leading-relaxed text-[var(--gold)] whitespace-pre-wrap">
      {children}
    </pre>
  );
}

function StageList({ stages }: { stages: StageStep[] }) {
  return (
    <ol className="space-y-4">
      {stages.map((stage, index) => (
        <li key={stage.title} className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]">
            Stage {index + 1}
          </p>
          <h3 className="mt-1 font-serif text-xl">{stage.title}</h3>
          {stage.equation ? (
            <div className="mt-3">
              <Formula>{stage.equation}</Formula>
            </div>
          ) : null}
          <p className="mt-3 text-xs uppercase tracking-wide text-[var(--muted)]">Algorithm</p>
          <ul className="mt-1 space-y-1.5 text-sm text-[var(--paper)]/90">
            {stage.algo.map((line) => (
              <li key={line}>· {line}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs uppercase tracking-wide text-[var(--muted)]">
            Numbers from this lab (07 September 2026)
          </p>
          <ul className="mt-1 space-y-1.5 text-sm text-[var(--muted)]">
            {stage.numbers.map((line) => (
              <li key={line}>· {line}</li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

export default function WalkthroughPage() {
  return (
    <div className="space-y-10">
      <header className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">
          {COLLEGE.university} · {COLLEGE.kicker}
        </p>
        <h1 className="mt-2 font-serif text-4xl">
          How the proposal is implemented — full pipeline walkthrough
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
          Exact formulas as coded in this repository, then two complete traces of
          SATR → APRR → MNCD → FCNP. One datum is a ToolBench-schema Agriculture
          tool (ranking library; RapidAPI is never GET). The other is live
          AGMARKNET on data.gov.in. Lab traces are not NDCG or accuracy
          commitments.
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Scholar {COLLEGE.scholar} ({COLLEGE.registerNo}). Supervisor{" "}
          {COLLEGE.supervisor}. Also in the{" "}
          <Link className="text-[var(--gold)] underline" href="/proposal">
            proposal slides
          </Link>
          . The same equations are in <code>docs/PIPELINE_WALKTHROUGH.md</code>.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="font-serif text-3xl">Closed-loop algorithm</h2>
        <ol className="space-y-2">
          {PIPELINE_ALGO.map((step, index) => (
            <li
              key={step}
              className="rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-sm"
            >
              <span className="text-[var(--gold)]">{index + 1}.</span> {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-3xl">Exact formulas (as implemented)</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]">
              O1 SATR · {SATR_FORMULA.file}
            </p>
            <Formula>{SATR_FORMULA.latex}</Formula>
            <p className="mt-2 font-mono text-xs text-[var(--muted)]">{SATR_FORMULA.sBase}</p>
            <p className="mt-1 font-mono text-xs text-[var(--muted)]">{SATR_FORMULA.bm25}</p>
            <p className="mt-2 text-sm text-[var(--paper)]/90">
              w_base={SATR_FORMULA.weights.w_base}, w_cat={SATR_FORMULA.weights.w_cat}, w_sch=
              {SATR_FORMULA.weights.w_sch}, w_ept={SATR_FORMULA.weights.w_ept}, w_cooc=
              {SATR_FORMULA.weights.w_cooc}, w_rec={SATR_FORMULA.weights.w_rec}. Decay {SATR_FORMULA.decay},
              recency last {SATR_FORMULA.recencyK} with {SATR_FORMULA.recencyDecay}^k.{" "}
              {SATR_FORMULA.coactivationUpdate}. {SATR_FORMULA.feature}.
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]">
              O2 APRR · {APRR_FORMULA.file}
            </p>
            <Formula>{APRR_FORMULA.latex}</Formula>
            <p className="mt-2 font-mono text-xs text-[var(--muted)]">{APRR_FORMULA.heuristic}</p>
            <p className="mt-1 font-mono text-xs text-[var(--muted)]">{APRR_FORMULA.queryFit}</p>
            <p className="mt-1 font-mono text-xs text-[var(--muted)]">{APRR_FORMULA.update}</p>
            <p className="mt-2 text-sm text-[var(--paper)]/90">
              α={APRR_FORMULA.config.alpha}, β={APRR_FORMULA.config.beta}, γ={APRR_FORMULA.config.gamma},
              λ={APRR_FORMULA.config.lam}, κ={APRR_FORMULA.config.kappa}, W0={APRR_FORMULA.config.W0},
              maxHops={APRR_FORMULA.config.maxHops}, ε={APRR_FORMULA.config.epsilon}.{" "}
              {APRR_FORMULA.reward}. {APRR_FORMULA.start}
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]">
              O3 MNCD · {MNCD_FORMULA.file}
            </p>
            <Formula>{MNCD_FORMULA.agentScore}</Formula>
            <p className="mt-2 font-mono text-xs text-[var(--muted)]">{MNCD_FORMULA.liveBoost}</p>
            <p className="mt-1 font-mono text-xs text-[var(--muted)]">{MNCD_FORMULA.consensus}</p>
            <p className="mt-1 font-mono text-xs text-[var(--muted)]">{MNCD_FORMULA.peerWeight}</p>
            <p className="mt-2 text-sm text-[var(--paper)]/90">
              {MNCD_FORMULA.gossip}. {MNCD_FORMULA.executeGate} {MNCD_FORMULA.preferredRule}
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]">
              O4 FCNP · {FCNP_FORMULA.file}
            </p>
            <Formula>{FCNP_FORMULA.physarum}</Formula>
            <p className="mt-2 font-mono text-xs text-[var(--muted)]">{FCNP_FORMULA.kirchhoff}</p>
            <p className="mt-1 font-mono text-xs text-[var(--muted)]">{FCNP_FORMULA.edge}</p>
            <p className="mt-2 text-sm text-[var(--paper)]/90">
              μ={FCNP_FORMULA.config.mu}, α={FCNP_FORMULA.config.alpha}, γ={FCNP_FORMULA.config.gamma},
              similarityThreshold={FCNP_FORMULA.config.similarityThreshold}. {FCNP_FORMULA.tiers}.{" "}
              {FCNP_FORMULA.pin}. {FCNP_FORMULA.writeback}
            </p>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-3xl">Worked example A — one ToolBench datum</h2>
        <Card className="p-5 text-sm leading-relaxed text-[var(--muted)]">
          <p className="font-medium text-[var(--paper)]">
            Bundled ToolBench G1 row (qid {TOOLBENCH_G1_ROW.qid})
          </p>
          <p className="mt-2 italic text-[var(--paper)]/80">“{TOOLBENCH_G1_ROW.query}”</p>
          <p className="mt-2">
            File {TOOLBENCH_G1_ROW.file}. Gold RapidAPI ids{" "}
            {TOOLBENCH_G1_ROW.goldDocIds.join(", ")}. {TOOLBENCH_G1_ROW.whatQinShipped}{" "}
            {TOOLBENCH_G1_ROW.whatTheLabDoes}
          </p>
          <p className="mt-3 font-medium text-[var(--paper)]">
            Ranking-library analogue actually walked below
          </p>
          <p className="mt-1">
            Tool <code className="text-[var(--gold)]">{TOOLBENCH_SOIL.toolId}</code> ({TOOLBENCH_SOIL.toolName}),
            source={TOOLBENCH_SOIL.source}, liveExecutable={String(TOOLBENCH_SOIL.liveExecutable)}. Query: “
            {TOOLBENCH_SOIL.query}”. {TOOLBENCH_SOIL.whyThisDatum}
          </p>
        </Card>
        <StageList stages={SOIL_STAGES} />
        <StageList stages={AIRCRAFT_HONESTY} />
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-3xl">Worked example B — data.gov.in AGMARKNET</h2>
        <Card className="p-5 text-sm leading-relaxed text-[var(--muted)]">
          <p className="font-medium text-[var(--paper)]">{DATAGOV_MANDI.citation}</p>
          <p className="mt-2">
            UUID <code className="text-[var(--gold)]">{DATAGOV_MANDI.resourceId}</code>. Query: “
            {DATAGOV_MANDI.query}”. Elastic window capped at {DATAGOV_MANDI.elasticCap} live rows. Captured{" "}
            {DATAGOV_MANDI.capturedAt}.
          </p>
        </Card>
        <StageList stages={MANDI_STAGES} />
      </section>

      <WalkthroughLive />

      <p className="text-xs text-[var(--muted)]">
        Proposal-stage discipline: these equations and traces show how ACRS is
        implemented. They do not commit a retrieval, latency, consensus, or
        token-reduction target.
      </p>
    </div>
  );
}
