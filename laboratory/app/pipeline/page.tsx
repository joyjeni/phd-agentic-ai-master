import { ArchitectureSvg } from "@/components/architecture-svg";
import { PipelineLab } from "@/components/pipeline-lab";
import { PIPELINE_EDGES } from "@/lib/research/objectives";

export default function PipelinePage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">
          End-to-end contract
        </p>
        <h1 className="mt-2 font-serif text-4xl">How the four objectives connect</h1>
        <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">
          The research claim at proposal stage is that these arrows exist and are
          typed. Run a query below, then a follow-up in the same session, to watch
          FCNP memory enter SATR on turn two.
        </p>
      </header>
      <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
        <ArchitectureSvg variant="e2e" />
      </div>
      <ol className="grid gap-3 md:grid-cols-5">
        {PIPELINE_EDGES.map((edge) => (
          <li
            key={edge.from}
            className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm"
          >
            <p className="text-[var(--gold)]">{edge.from}</p>
            <p className="mt-2 text-[var(--muted)]">→ {edge.to}</p>
          </li>
        ))}
      </ol>
      <PipelineLab compact />
    </div>
  );
}
