"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WALKTHROUGH_QUERIES } from "@/lib/research/walkthrough";
import type { PipelineTrace } from "@/lib/research/types";

const EXAMPLES = [
  { id: "soil" as const, label: "ToolBench-schema soil query", query: WALKTHROUGH_QUERIES.soil },
  { id: "mandi" as const, label: "Live AGMARKNET wheat / Punjab", query: WALKTHROUGH_QUERIES.mandi },
];

export function WalkthroughLive() {
  const [active, setActive] = useState<(typeof EXAMPLES)[number]["id"]>("mandi");
  const [trace, setTrace] = useState<PipelineTrace | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run(id: (typeof EXAMPLES)[number]["id"]) {
    const example = EXAMPLES.find((row) => row.id === id)!;
    setActive(id);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: example.query,
          email: "jenisha.t@msruas.ac.in",
          sector: "Agriculture",
        }),
      });
      const payload = (await response.json()) as PipelineTrace & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Pipeline failed");
      setTrace(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-5">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
        Re-run the same two queries
      </p>
      <h2 className="mt-1 font-serif text-2xl">Live pipeline (today’s OGD, not a snapshot)</h2>
      <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
        The worked numbers on this page were captured on 07 September 2026. Mandi
        rows change every day. Press a button to run the identical query through
        SATR → APRR → MNCD → FCNP again. Prices are never invented.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <Button
            key={example.id}
            size="sm"
            variant={active === example.id && trace ? "default" : "secondary"}
            disabled={loading}
            onClick={() => run(example.id)}
          >
            {loading && active === example.id ? "Running…" : example.label}
          </Button>
        ))}
      </div>
      {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      {trace ? (
        <div className="mt-4 space-y-3 text-sm">
          <p className="text-[var(--paper)]">
            {trace.liveOk ? "Live OGD obtained." : "No live OGD on this turn."}{" "}
            SATR top: {trace.satr.truncated[0]?.tool.id} ({trace.satr.truncated[0]?.score.toFixed(3)}).
            APRR path: {trace.aprr.path.join(" → ")}. FCNP retained {trace.fcnp.stats.retained}/
            {trace.fcnp.stats.original}.
          </p>
          <ol className="grid gap-2 md:grid-cols-2">
            {trace.satr.truncated.slice(0, 6).map((item, index) => (
              <li key={item.tool.id} className="rounded-lg border border-[var(--line)] px-3 py-2">
                <span className="text-[var(--gold)]">#{index + 1}</span> {item.tool.id}{" "}
                <span className="text-[var(--muted)]">s={item.score.toFixed(3)}</span>
                {item.tool.liveExecutable ? " · live" : " · ranking-only"}
              </li>
            ))}
          </ol>
          <p className="leading-relaxed text-[var(--muted)]">{trace.answer}</p>
        </div>
      ) : null}
    </Card>
  );
}
