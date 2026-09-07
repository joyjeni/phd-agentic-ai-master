import { MermaidBlock } from "@/components/mermaid-block";
import { COLLEGE } from "@/lib/research/college";
import {
  GITHUB_DIAGRAM_FILES,
  JOURNAL_FIGURES,
} from "@/lib/research/implemented-diagrams";
import Link from "next/link";

export default function DiagramsPage() {
  return (
    <div className="space-y-12">
      <header className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">
          {COLLEGE.university} · {COLLEGE.kicker}
        </p>
        <h1 className="mt-2 font-serif text-4xl">Implemented architecture — mermaid redraws</h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
          Every file under{" "}
          <a
            className="text-[var(--gold)] underline"
            href="https://github.com/joyjeni/phd-agentic-ai-master/tree/master/diagrams"
          >
            github.com/joyjeni/phd-agentic-ai-master/diagrams
          </a>{" "}
          is a matplotlib PNG or GIF. Those drawings still name SessionRerank+, NDCG
          pills, CDR/PDR, and Borda-as-default. This page redraws each one in mermaid
          from the functions that actually run: <code>satr.ts</code>, <code>aprr.ts</code>,{" "}
          <code>mncd.ts</code>, <code>fcnp.ts</code>, <code>pipeline.ts</code>. Captions
          are journal-style. No computational target is drawn.
        </p>
        <p className="mt-2 text-sm">
          Scholar {COLLEGE.scholar} ({COLLEGE.registerNo}).{" "}
          <Link className="text-[var(--gold)] underline" href="/algorithms">
            Pseudocode
          </Link>
          {" · "}
          <Link className="text-[var(--gold)] underline" href="/architecture">
            SOTA vs proposed
          </Link>
          {" · "}
          <Link className="text-[var(--gold)] underline" href="/objectives">
            Objectives
          </Link>
          .
        </p>
      </header>

      <section className="overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
        <h2 className="font-serif text-2xl">Archived PNG → implemented figure</h2>
        <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
          Python generators remain in <code>diagrams/build_architecture.py</code>,{" "}
          <code>diagrams/build_algo_flow.py</code>, <code>diagrams/obj1/</code>, and{" "}
          <code>diagrams/obj2/</code>. They are not the laboratory.
        </p>
        <table className="mt-4 w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] text-[11px] uppercase tracking-[0.16em] text-[var(--gold)]">
              <th className="py-2 pr-3">Archived GitHub file</th>
              <th className="py-2 pr-3">This figure</th>
              <th className="py-2">Kind</th>
            </tr>
          </thead>
          <tbody>
            {JOURNAL_FIGURES.map((fig) => (
              <tr key={fig.id} className="border-b border-[var(--line)]/60">
                <td className="py-2 pr-3 font-mono text-[12px] text-[var(--muted)]">{fig.archived}</td>
                <td className="py-2 pr-3">
                  <a className="text-[var(--gold)] underline" href={`#${fig.id}`}>
                    {fig.figure}. {fig.title}
                  </a>
                </td>
                <td className="py-2 text-[var(--muted)]">{fig.kind}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 font-mono text-[11px] text-[var(--muted)]">
          Tree files accounted for: {GITHUB_DIAGRAM_FILES.join(", ")}. Plus generator
          scripts obj1/, obj2/, build_*.py — not redrawn as algorithms.
        </p>
      </section>

      {JOURNAL_FIGURES.map((fig) => (
        <section key={fig.id} id={fig.id} className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]">
            {fig.figure} · {fig.kind} · {fig.source}
          </p>
          <h2 className="font-serif text-3xl">{fig.title}</h2>
          <p className="max-w-3xl text-sm text-[var(--muted)]">
            Replaces archived <code>{fig.archived}</code>. Dropped from that PNG (not
            implemented here): {fig.archivedDrops.join("; ")}.
          </p>
          <MermaidBlock chart={fig.mermaid} title={`${fig.figure} mermaid`} caption={fig.caption} />
        </section>
      ))}
    </div>
  );
}
