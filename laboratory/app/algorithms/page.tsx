import { ArchitectureSvg } from "@/components/architecture-svg";
import { DataflowLab } from "@/components/dataflow-lab";
import { MermaidBlock } from "@/components/mermaid-block";
import { ALGORITHMS, INTEGRATION } from "@/lib/research/algorithms";
import { COLLEGE } from "@/lib/research/college";
import { MOTIVATION, NON_CLAIMS, OBJECTIVES, OVERALL_OBJECTIVE, SATR } from "@/lib/research/objectives";
import Link from "next/link";

function Formula({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-[var(--gold)]/40 bg-black/30 px-3 py-2 font-mono text-[12px] leading-relaxed text-[var(--gold)] whitespace-pre-wrap">
      {children}
    </pre>
  );
}

export default function AlgorithmsPage() {
  return (
    <div className="space-y-12">
      <header className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">
          {COLLEGE.university} · {COLLEGE.kicker}
        </p>
        <h1 className="mt-2 font-serif text-4xl">Implemented algorithms — formulas, pseudocode, diagrams</h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
          Mermaid figures on this page are the control-flow listings. The 1:1
          redraw of every archived GitHub PNG, with journal captions, is on{" "}
          <Link className="text-[var(--gold)] underline" href="/diagrams">
            /diagrams
          </Link>
          . Those matplotlib files still name SessionRerank+, NDCG, and Borda-as-default.
        </p>
        <p className="mt-2 text-sm">
          Scholar {COLLEGE.scholar} ({COLLEGE.registerNo}).{" "}
          <Link className="text-[var(--gold)] underline" href="/walkthrough">
            Numbered walkthrough
          </Link>
          {" · "}
          <Link className="text-[var(--gold)] underline" href="/architecture">
            SOTA vs proposed
          </Link>
          {" · "}
          <Link className="text-[var(--gold)] underline" href="/objectives">
            Research objectives
          </Link>
          .
        </p>
      </header>

      <DataflowLab />

      <section className="space-y-4">
        <h2 className="font-serif text-3xl">{MOTIVATION.title}</h2>
        {MOTIVATION.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)} className="max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
            {paragraph}
          </p>
        ))}
      </section>

      <section className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
          Overall research objective
        </p>
        <h2 className="mt-2 font-serif text-2xl">{OVERALL_OBJECTIVE.title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--paper)]/90">
          {OVERALL_OBJECTIVE.statement}
        </p>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {SATR.acronym} means {SATR.expansion}. {NON_CLAIMS.statement}
        </p>
        <ol className="mt-4 grid gap-3 md:grid-cols-2">
          {OBJECTIVES.map((item) => (
            <li key={item.id} className="rounded-lg border border-[var(--line)] p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--gold)]">
                {item.code}
              </p>
              <h3 className="mt-1 font-serif text-xl">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {item.journalDefinition}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {ALGORITHMS.map((algo) => (
        <section key={algo.id} id={algo.id} className="space-y-4">
          <h2 className="font-serif text-3xl">
            {algo.code} · {algo.title}
          </h2>
          <p className="max-w-3xl text-sm text-[var(--muted)]">
            {algo.caption} Source: <code>{algo.file}</code>. Output: {algo.output}
          </p>
          <Formula>{algo.formula}</Formula>
          <ul className="space-y-1 font-mono text-[12px] text-[var(--muted)]">
            {algo.extras.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--gold)]">
                Pseudocode as implemented
              </p>
              <pre className="mt-2 overflow-x-auto rounded-lg border border-[var(--line)] bg-black/30 p-4 font-mono text-[12px] leading-relaxed text-[var(--paper)] whitespace-pre-wrap">
                {algo.pseudocode.join("\n")}
              </pre>
            </div>
            <div className="space-y-3">
              <MermaidBlock
                chart={algo.mermaid}
                title={`${algo.figure} mermaid — implemented ${algo.code}`}
                caption={algo.caption}
              />
              <div className="rounded-md border border-[#5B9BD5] bg-[#0f1c2a] p-2">
                <ArchitectureSvg variant={algo.diagram} />
              </div>
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--gold)]">
              How the diagram implements the pseudocode
            </p>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-[var(--paper)]/90">
              {algo.logic.map((line) => (
                <li key={line} className="border-l-2 border-[var(--gold)] pl-3">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <section id="integration" className="space-y-4">
        <h2 className="font-serif text-3xl">Overall integration</h2>
        <p className="max-w-3xl text-sm text-[var(--muted)]">{INTEGRATION.caption}</p>
        <MermaidBlock
          chart={INTEGRATION.mermaid}
          title={`${INTEGRATION.figure} mermaid — closed ACRS loop`}
          caption={INTEGRATION.caption}
        />
        <div className="rounded-md border border-[#5B9BD5] bg-[#0f1c2a] p-2">
          <ArchitectureSvg variant="proposed" />
        </div>
        <ol className="grid gap-2 sm:grid-cols-2">
          {INTEGRATION.steps.map((step, index) => (
            <li key={step} className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-sm">
              <span className="text-[var(--gold)]">{index + 1}.</span> {step}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
