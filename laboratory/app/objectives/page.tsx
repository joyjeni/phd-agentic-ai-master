import {
  INTEGRATED_METHODOLOGY,
  MOTIVATION,
  NON_CLAIMS,
  OBJECTIVES,
  OVERALL_OBJECTIVE,
  SATR,
} from "@/lib/research/objectives";
import { COLLEGE } from "@/lib/research/college";
import Link from "next/link";

export default function ObjectivesPage() {
  return (
    <div className="space-y-10">
      <header className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">
          {COLLEGE.university} · {COLLEGE.kicker}
        </p>
        <h1 className="mt-2 font-serif text-4xl">Motivation and research objectives</h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
          Scholar {COLLEGE.scholar} ({COLLEGE.registerNo}). Supervisor {COLLEGE.supervisor}.
          These statements are the proposal-stage design claims. They do not commit a
          computational metric.{" "}
          <Link className="text-[var(--gold)] underline" href="/algorithms">
            Implemented algorithms
          </Link>
          {" · "}
          <Link className="text-[var(--gold)] underline" href="/diagrams">
            Mermaid figures
          </Link>
          .
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-serif text-3xl">{MOTIVATION.title}</h2>
        {MOTIVATION.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className="max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
            {paragraph}
          </p>
        ))}
        <ul className="max-w-3xl space-y-2 text-sm text-[var(--paper)]/90">
          {MOTIVATION.bullets.map((bullet) => (
            <li key={bullet} className="border-l-2 border-[var(--gold)] pl-3">
              {bullet}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-[var(--gold)] bg-[var(--panel)] p-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
          Overall research objective
        </p>
        <h2 className="mt-2 font-serif text-2xl">{OVERALL_OBJECTIVE.title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--paper)]/90">
          {OVERALL_OBJECTIVE.statement}
        </p>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {SATR.acronym} means {SATR.expansion}. The four individual objectives below
          are thesis-sized design claims.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
          {OVERALL_OBJECTIVE.scope.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6">
        <h2 className="font-serif text-2xl">{NON_CLAIMS.title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
          {NON_CLAIMS.statement}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-3xl">Individual research objectives</h2>
        {OBJECTIVES.map((item) => (
          <article
            key={item.id}
            id={item.id}
            className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
              {item.code} · {item.repo}
            </p>
            <h3 className="mt-1 font-serif text-2xl">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--paper)]">
              {item.objective}
            </p>
            <p className="mt-3 text-xs uppercase tracking-wide text-[var(--gold)]">
              What will be designed
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
              {item.journalDefinition}
            </p>
            <p className="mt-3 text-xs text-[var(--gold)]">Artefact: {item.outputs}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-xs uppercase tracking-wide text-[var(--muted)]">SOTA</h4>
                <ul className="mt-2 space-y-2 text-sm text-[var(--muted)]">
                  {item.sota.papers.map((paper) => (
                    <li key={paper}>{paper}</li>
                  ))}
                  <li>Pipeline: {item.sota.pipeline}</li>
                  <li>Gap: {item.sota.gap}</li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wide text-[var(--muted)]">
                  Novelty of the design
                </h4>
                <ul className="mt-2 space-y-2 text-sm text-[var(--paper)]/90">
                  {item.novelty.map((point) => (
                    <li key={point}>· {point}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-xs uppercase tracking-wide text-[var(--muted)]">
                Research methodology (design)
              </h4>
              <ul className="mt-2 space-y-2 text-sm text-[var(--paper)]/90">
                {item.methodology.map((step) => (
                  <li key={step}>· {step}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section>
        <h2 className="font-serif text-2xl">Research questions</h2>
        <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
          Each question is paired with one objective. The questions ask whether the
          designed contract is specified; they do not pre-commit scores.
        </p>
        <ol className="mt-3 space-y-2">
          {OVERALL_OBJECTIVE.questions.map((question, index) => (
            <li key={question} className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
              <span className="text-[var(--gold)]">RQ{index + 1}.</span> {question}
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--gold)]">
                Addressed by {OBJECTIVES[index].code} {OBJECTIVES[index].title}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6">
        <h2 className="font-serif text-2xl">Integrated methodology</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--paper)]/90">
          {INTEGRATED_METHODOLOGY.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
