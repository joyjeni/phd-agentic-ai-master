import { Card } from "@/components/ui/card";
import { SURVEYED_DATASETS, TOOLBENCH_REALITY } from "@/lib/research/open-datasets";
import Link from "next/link";

const ROLE_LABEL: Record<string, string> = {
  "live-tool": "Live data.gov.in tool",
  "query-corpus": "Query corpus (not executed)",
  "eval-only": "Eval only",
  "do-not-use": "Not used here",
};

export default function DatasetsPage() {
  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">
          Open datasets for real inference
        </p>
        <h1 className="mt-2 font-serif text-4xl">What Indian researchers actually run</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          ToolBench is the ranking library. Live Agriculture inference in Indian
          papers comes from official OGD / AGMARKNET / IMD tables, not from
          RapidAPI and not from invented CSVs. Only resources that fetched live
          JSON in this lab are marked executable. A stage-by-stage walkthrough
          of one ToolBench-schema tool and one live AGMARKNET query is on{" "}
          <Link className="text-[var(--gold)] underline" href="/walkthrough">
            /walkthrough
          </Link>
          .
        </p>
      </header>
      <Card className="p-5 text-sm leading-relaxed text-[var(--muted)]">
        <p className="font-medium text-[var(--paper)]">{TOOLBENCH_REALITY.title}</p>
        <p className="mt-2">{TOOLBENCH_REALITY.body}</p>
      </Card>
      <div className="space-y-3">
        {SURVEYED_DATASETS.map((item) => (
          <Card key={item.id} className="p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-serif text-xl text-[var(--paper)]">{item.name}</h2>
              <span className="rounded-full border border-[var(--line)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--gold)]">
                {ROLE_LABEL[item.role]}
                {item.wired ? " · wired" : ""}
              </span>
            </div>
            <p className="mt-2 text-sm text-[var(--paper)]/90">{item.how}</p>
            <p className="mt-2 text-xs text-[var(--muted)]">Used by: {item.usedBy}</p>
            {item.resourceId ? (
              <p className="mt-1 font-mono text-[11px] text-[var(--gold)]">{item.resourceId}</p>
            ) : null}
            <p className="mt-2 text-sm text-[var(--muted)]">{item.notes}</p>
            <a
              className="mt-2 inline-block text-xs text-[var(--gold)] underline-offset-2 hover:underline"
              href={item.url}
              target="_blank"
              rel="noreferrer"
            >
              Source
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
}
