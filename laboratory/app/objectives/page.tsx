import { OBJECTIVES, OVERALL_OBJECTIVE } from "@/lib/research/objectives";

export default function ObjectivesPage() {
  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">
          Research professor framing
        </p>
        <h1 className="mt-2 font-serif text-4xl">{OVERALL_OBJECTIVE.title}</h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
          To solve the research gap, four named modules are proposed.{" "}
          {OVERALL_OBJECTIVE.statement}
        </p>
      </header>
      <section>
        <h2 className="font-serif text-2xl">Research questions</h2>
        <ol className="mt-3 space-y-2">
          {OVERALL_OBJECTIVE.questions.map((question, index) => (
            <li key={question} className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
              <span className="text-[var(--gold)]">RQ{index + 1}.</span> {question}
            </li>
          ))}
        </ol>
      </section>
      <section className="space-y-4">
        {OBJECTIVES.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
              {item.code} · {item.repo}
            </p>
            <h2 className="mt-1 font-serif text-2xl">{item.title}</h2>
            <p className="mt-2 text-xs uppercase tracking-wide text-[var(--gold)]">
              Journal / thesis definition
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
              {item.journalDefinition}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--paper)]/90">
              {item.objective}
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-xs uppercase tracking-wide text-[var(--muted)]">
                  SOTA
                </h3>
                <ul className="mt-2 space-y-2 text-sm text-[var(--muted)]">
                  {item.sota.papers.map((paper) => (
                    <li key={paper}>{paper}</li>
                  ))}
                  <li>Pipeline: {item.sota.pipeline}</li>
                  <li>Gap: {item.sota.gap}</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-wide text-[var(--muted)]">
                  Novelty
                </h3>
                <ul className="mt-2 space-y-2 text-sm text-[var(--paper)]/90">
                  {item.novelty.map((point) => (
                    <li key={point}>· {point}</li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-[var(--gold)]">Output: {item.outputs}</p>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-xs uppercase tracking-wide text-[var(--muted)]">
                Research methodology
              </h3>
              <ul className="mt-2 space-y-2 text-sm text-[var(--paper)]/90">
                {item.methodology.map((step) => (
                  <li key={step}>· {step}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
