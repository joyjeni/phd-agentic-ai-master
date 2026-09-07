"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PipelineTrace, SessionState } from "@/lib/research/types";

const SAMPLES = [
  "What is the current mandi price of tomato in Punjab?",
  "Show onion prices in Tamil Nadu from today's AGMARKNET feed.",
  "What wheat prices are in today's data.gov.in mandi resource?",
  "Rice production in Karnataka from data.gov.in crop statistics",
  "All-India monsoon rainfall from the IMD series on data.gov.in",
];

function StatusPill({ status }: { status: "ok" | "degraded" | "empty" }) {
  const label = status === "ok" ? "connected" : status === "degraded" ? "degraded" : "empty";
  const color =
    status === "ok"
      ? "bg-emerald-500/20 text-emerald-200"
      : status === "degraded"
        ? "bg-amber-500/20 text-amber-200"
        : "bg-rose-500/20 text-rose-200";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${color}`}>{label}</span>;
}

export function PipelineLab({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState(SAMPLES[0]);
  const [email, setEmail] = useState("joyjeni@gmail.com");
  const [apiKey, setApiKey] = useState("");
  const [session, setSession] = useState<SessionState | undefined>();
  const [trace, setTrace] = useState<PipelineTrace | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run(nextQuery = query) {
    const q = nextQuery.trim();
    if (!q) {
      setError("Enter a query to run the four-objective pipeline.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, email, sector: "Agriculture", session, apiKey: apiKey.trim() || undefined }),
      });
      const payload = (await response.json()) as PipelineTrace & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Pipeline failed");
      setTrace(payload);
      setSession(payload.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  const turns = session?.history.length ?? 0;
  const topTools = useMemo(() => trace?.satr.truncated.slice(0, 5) ?? [], [trace]);

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
              Integrated runtime
            </p>
            <h2 className="font-serif text-2xl text-[var(--paper)]">
              SATR → APRR → MNCD → FCNP
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
              Four GitHub microservices on request: SATR → APRR hops → MNCD
              score-sum mesh → FCNP Kirchhoff prune. Mandi prices are read live from
              data.gov.in AGMARKNET for {email}, Agriculture sector. No dummy rows.
            </p>
          </div>
          <div className="text-right text-xs text-[var(--muted)]">
            <div>Turns in session: {turns}</div>
            <div>Memory spans: {session?.memory.length ?? 0}</div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="text-xs text-[var(--muted)]">
            Researcher email
            <input
              className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--ink)] px-3 py-2 text-sm text-[var(--paper)]"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="text-xs text-[var(--muted)]">
            Sector
            <input
              className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--ink)] px-3 py-2 text-sm text-[var(--paper)]"
              value="Agriculture"
              readOnly
              aria-readonly="true"
            />
          </label>
          <label className="text-xs text-[var(--muted)]">
            data.gov.in API key
            <input
              className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--ink)] px-3 py-2 text-sm text-[var(--paper)]"
              type="password"
              autoComplete="off"
              placeholder="Optional personal key; portal key used otherwise"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
            />
          </label>
        </div>
        <p className="mt-2 text-[11px] text-[var(--muted)]">
          Live AGMARKNET is fetched with the visualization key published on the
          official data.gov.in resource page. A personal key is optional. If today&apos;s
          feed has no Karnataka or no matching crop, you still see other live rows — never
          invented prices.
        </p>

        <label className="mt-3 block text-xs text-[var(--muted)]">
          Query
          <textarea
            className="mt-1 min-h-24 w-full rounded-md border border-[var(--line)] bg-[var(--ink)] px-3 py-2 text-sm text-[var(--paper)]"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className="mt-3 flex flex-wrap gap-2">
          {SAMPLES.map((sample) => (
            <button
              key={sample}
              className="rounded-full border border-[var(--line)] px-3 py-1 text-left text-[11px] text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--paper)]"
              onClick={() => {
                setQuery(sample);
                void run(sample);
              }}
            >
              {sample}
            </button>
          ))}
        </div>

        <form
          className="mt-4 flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void run();
          }}
        >
          <Button type="submit" disabled={loading}>
            {loading ? "Running pipeline…" : "Run end-to-end"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSession(undefined);
              setTrace(null);
              setError(null);
            }}
          >
            Reset session
          </Button>
        </form>
        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      </Card>

      {trace ? (
        <>
          <div className="grid gap-3 md:grid-cols-4">
            {trace.stages.map((stage) => (
              <Card key={stage.id} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] uppercase tracking-wide text-[var(--gold)]">
                    {stage.id}
                  </p>
                  <StatusPill status={stage.status} />
                </div>
                <p className="mt-2 text-sm text-[var(--paper)]">{stage.title}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{stage.summary}</p>
                <p className="mt-2 text-[11px] text-[var(--muted)]">
                  {trace.timingsMs[stage.id] ?? 0} ms
                </p>
              </Card>
            ))}
          </div>

          <Card className="p-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
              Grounded answer
            </p>
            <p className="mt-2 font-serif text-lg leading-relaxed text-[var(--paper)]">
              {trace.answer}
            </p>
            <p className="mt-2 text-xs text-[var(--muted)]">
              Pipeline {trace.pipelineOk ? "closed" : "open/broken"} · live AGMARKNET{" "}
              {trace.liveOk ? "ok" : "not obtained"} · request {trace.requestId}
            </p>
          </Card>

          {!compact ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="p-5">
                <h3 className="font-serif text-xl text-[var(--paper)]">O1 SATR shortlist</h3>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Mode {trace.satr.queryMode} · intent drift {trace.satr.intentDrift.toFixed(2)}
                  {trace.satr.formula ? ` · ${trace.satr.formula}` : ""}
                </p>
                <ol className="mt-3 space-y-2">
                  {topTools.map((item, index) => (
                    <li key={item.tool.id} className="rounded-lg border border-[var(--line)] p-3">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-[var(--paper)]">
                          {index + 1}. {item.tool.name}
                        </span>
                        <span className="text-[11px] text-[var(--gold)]">
                          {item.score.toFixed(3)} · {item.seenUnseen}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {item.tool.category} / {item.tool.collection}
                      </p>
                    </li>
                  ))}
                </ol>
              </Card>

              <Card className="p-5">
                <h3 className="font-serif text-xl text-[var(--paper)]">O2 APRR hop path</h3>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {(trace.aprr.path ?? []).join(" → ") || "no path"}
                </p>
                <ul className="mt-3 space-y-2">
                  {trace.aprr.assignments.map((row) => (
                    <li key={row.agent.id} className="rounded-lg border border-[var(--line)] p-3">
                      <div className="flex justify-between text-sm text-[var(--paper)]">
                        <span>{row.agent.name}</span>
                        <span className="text-[11px] text-[var(--gold)]">
                          U={row.utility.toFixed(3)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {row.tools.map((item) => item.tool.name).join(" · ") || "no tools"}
                      </p>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-5">
                <h3 className="font-serif text-xl text-[var(--paper)]">O3 MNCD mesh</h3>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Score-sum · gossip {trace.mncd.gossip?.rounds ?? 0} rounds · nodes{" "}
                  {trace.mncd.nodes.length} · votes {trace.mncd.votes.length}
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {trace.mncd.executed.map((item) => {
                    const payload = item.payload as {
                      records?: Array<{
                        state: string;
                        district: string;
                        market: string;
                        commodity: string;
                        modal_price: string;
                        arrival_date: string;
                      }>;
                      scanned?: number;
                      keySource?: string;
                    };
                    const rows = payload?.records ?? [];
                    return (
                      <li key={item.toolId} className="rounded-lg border border-[var(--line)] p-3">
                        <div className="flex justify-between">
                          <span className="text-[var(--paper)]">{item.toolId}</span>
                          <span className="text-[11px] uppercase text-[var(--gold)]">
                            {item.source}
                            {payload?.keySource ? ` · ${payload.keySource}` : ""}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[var(--muted)]">{item.summary}</p>
                        {rows.length ? (
                          <div className="mt-2 overflow-x-auto">
                            <table className="w-full text-left text-[11px] text-[var(--muted)]">
                              <thead>
                                <tr className="text-[var(--gold)]">
                                  <th className="py-1 pr-2">Commodity</th>
                                  <th className="py-1 pr-2">Market</th>
                                  <th className="py-1 pr-2">State</th>
                                  <th className="py-1 pr-2">Modal</th>
                                  <th className="py-1">Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {rows.slice(0, 8).map((row, index) => (
                                  <tr key={`${row.market}-${row.commodity}-${index}`}>
                                    <td className="py-0.5 pr-2 text-[var(--paper)]">{row.commodity}</td>
                                    <td className="py-0.5 pr-2">{row.market}</td>
                                    <td className="py-0.5 pr-2">{row.state}</td>
                                    <td className="py-0.5 pr-2">Rs {row.modal_price}</td>
                                    <td className="py-0.5">{row.arrival_date}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {payload.scanned ? (
                              <p className="mt-1 text-[10px] text-[var(--muted)]">
                                Scanned {payload.scanned} live AGMARKNET rows
                              </p>
                            ) : null}
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </Card>

              <Card className="p-5">
                <h3 className="font-serif text-xl text-[var(--paper)]">O4 FCNP memory</h3>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Kirchhoff {trace.fcnp.stats.iterations} iter · retained{" "}
                  {trace.fcnp.stats.retained}/{trace.fcnp.stats.original} · persistent{" "}
                  {trace.fcnp.stats.pinned}
                </p>
                <ul className="mt-3 max-h-64 space-y-2 overflow-auto text-xs">
                  {trace.fcnp.retained.map((element) => (
                    <li key={element.id} className="rounded-lg border border-[var(--line)] p-2">
                      <span className="text-[var(--gold)]">{element.kind}</span>
                      {element.pinned ? (
                        <span className="ml-2 text-emerald-300">pinned</span>
                      ) : null}
                      <p className="mt-1 text-[var(--muted)]">{element.text}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
