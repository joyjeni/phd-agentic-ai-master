import { PUBLICATION } from "@/lib/research/publication";
import { Card } from "@/components/ui/card";

export default function PublicationPage() {
  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">
          Journal-readiness (honest)
        </p>
        <h1 className="mt-2 font-serif text-4xl">What is ready, and what is not</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          Each GitHub module implements a real algorithm with named SOTA contrasts.
          None is currently a slam-dunk Nature / NeurIPS / ICLR oral. They can be
          positioned for domain, systems, or *Findings* venues if claims match the
          experiments. This page is the review you would get from a methods editor,
          not a marketing slide.
        </p>
      </header>
      <div className="space-y-4">
        {PUBLICATION.map((item) => (
          <Card key={item.code} className="p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-serif text-2xl text-[var(--paper)]">
                {item.code} · {item.title}
              </h2>
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] uppercase text-amber-200">
                not venue-ready yet
              </span>
            </div>
            <p className="mt-2 text-sm text-[var(--paper)]/90">{item.claim}</p>
            <p className="mt-2 text-xs text-[var(--gold)]">Plausible venue: {item.venueFit}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <h3 className="text-xs uppercase tracking-wide text-[var(--muted)]">In hand</h3>
                <ul className="mt-2 space-y-1 text-sm text-[var(--muted)]">
                  {item.evidence.map((line) => (
                    <li key={line}>· {line}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-wide text-[var(--muted)]">Blockers</h3>
                <ul className="mt-2 space-y-1 text-sm text-rose-200/80">
                  {item.blockers.map((line) => (
                    <li key={line}>· {line}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-wide text-[var(--muted)]">Next experiment</h3>
                <p className="mt-2 text-sm text-[var(--paper)]/90">{item.next}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
