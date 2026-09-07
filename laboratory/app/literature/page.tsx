import { LITERATURE_EVIDENCE } from "@/lib/research/literature";
import { COLLEGE } from "@/lib/research/college";
import Link from "next/link";

export default function LiteraturePage() {
  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">
          {COLLEGE.kicker} · FET template
        </p>
        <h1 className="mt-2 font-serif text-4xl">Literature Survey</h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
          Each numbered block is one published paper in the college Evidence form:
          Author(s), Year, Title, Publication, Objective, Methodology, Findings,
          Limitations. Same text is on the proposal slides (two evidences per
          slide) and in{" "}
          <code className="text-[var(--paper)]">docs/LITERATURE_SURVEY.md</code>.
          No NDCG, latency, or accuracy targets.
        </p>
        <p className="mt-3 text-sm">
          <Link className="text-[var(--gold)] underline" href="/proposal">
            Flip the Evidence slides
          </Link>
          {" · "}
          <Link className="text-[var(--gold)] underline" href="/download">
            Download PowerPoint
          </Link>
        </p>
      </header>
      <ol className="space-y-4">
        {LITERATURE_EVIDENCE.map((item) => (
          <li
            key={item.n}
            className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
              Evidence {item.n}
            </p>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-[8.5rem_1fr]">
              <dt className="text-[var(--gold)]">Author(s)</dt>
              <dd className="text-[var(--paper)]">{item.authors}</dd>
              <dt className="text-[var(--gold)]">Year</dt>
              <dd className="text-[var(--paper)]">{item.year}</dd>
              <dt className="text-[var(--gold)]">Title</dt>
              <dd className="font-medium text-[var(--paper)]">{item.title}</dd>
              <dt className="text-[var(--gold)]">Publication</dt>
              <dd className="text-[var(--paper)]">{item.venue}</dd>
              <dt className="text-[var(--gold)]">Objective</dt>
              <dd className="text-[var(--muted)]">{item.objective}</dd>
              <dt className="text-[var(--gold)]">Methodology</dt>
              <dd className="text-[var(--muted)]">{item.methodology}</dd>
              <dt className="text-[var(--gold)]">Findings</dt>
              <dd className="text-[var(--muted)]">{item.findings}</dd>
              <dt className="text-[var(--gold)]">Limitations</dt>
              <dd className="text-[var(--muted)]">{item.limitations}</dd>
            </dl>
          </li>
        ))}
      </ol>
    </div>
  );
}
