"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { TOOLBENCH_FLOW } from "@/lib/research/algorithms";
import { TOOLBENCH_SOIL } from "@/lib/research/walkthrough";
import type { PipelineTrace } from "@/lib/research/types";

const STAGES = [
  { id: "intake", label: "q_t", sub: "ToolBench schema" },
  { id: "satr", label: "SATR", sub: "O1 fused rank" },
  { id: "aprr", label: "APRR", sub: "O2 hops" },
  { id: "mncd", label: "MNCD", sub: "O3 live gate" },
  { id: "fcnp", label: "FCNP", sub: "O4 prune" },
  { id: "writeback", label: "M_t", sub: "write-back" },
] as const;

type StageId = (typeof STAGES)[number]["id"];

function payloadsFromTrace(trace: PipelineTrace): Record<StageId, string> {
  const top = trace.satr.truncated
    .slice(0, 4)
    .map((item, i) => `${i + 1}. ${item.tool.id} s=${item.score.toFixed(3)}${item.tool.liveExecutable ? " live" : " ranking-only"}`)
    .join(" · ");
  const hops = trace.aprr.assignments
    .map((row) => `${row.agent.id} [${row.tools.map((t) => t.tool.id).join(", ")}] p=${row.probability.toFixed(3)}`)
    .join(" → ");
  const votes = trace.mncd.votes
    .slice(0, 3)
    .map((vote) => `${vote.toolId} tally=${vote.weight.toFixed(3)}`)
    .join(" · ");
  const exec = trace.mncd.executed
    .map((item) => `${item.toolId} ${item.ok ? "ok" : "fail"} src=${item.source}: ${item.summary.slice(0, 180)}`)
    .join(" | ");
  const retained = trace.fcnp.retained
    .slice(0, 6)
    .map((el) => `${el.kind}${el.pinned ? "*" : ""}`)
    .join(", ");
  return {
    intake: `Query: “${trace.query}”. Catalog locked to Agriculture. RapidAPI is not called.`,
    satr: top || "SATR returned an empty shortlist.",
    aprr: hops || "APRR produced no hop path.",
    mncd: `${votes}. ${exec || "No live GET."} ${trace.mncd.consensusNotes[1] ?? ""}`,
    fcnp: `Retained ${trace.fcnp.stats.retained}/${trace.fcnp.stats.original} after ${trace.fcnp.stats.iterations} Kirchhoff iterations. Nodes: ${retained}.`,
    writeback: `Answer: ${trace.answer.slice(0, 240)} Memory spans ${trace.session.memory.length}. Co-activation updated only on live success.`,
  };
}

function recordedPayloads(): Record<StageId, string> {
  return Object.fromEntries(TOOLBENCH_FLOW.stages.map((row) => [row.id, row.payload])) as Record<
    StageId,
    string
  >;
}

export function DataflowLab() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trace, setTrace] = useState<PipelineTrace | null>(null);
  const [source, setSource] = useState<"recorded" | "live">("recorded");

  const payloads = useMemo(
    () => (trace ? payloadsFromTrace(trace) : recordedPayloads()),
    [trace],
  );

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setActive((value) => {
        if (value >= STAGES.length - 1) {
          window.clearInterval(timer);
          setPlaying(false);
          return value;
        }
        return value + 1;
      });
    }, 1400);
    return () => window.clearInterval(timer);
  }, [playing, trace]);

  function replayRecorded() {
    setSource("recorded");
    setTrace(null);
    setError(null);
    setActive(0);
    setPlaying(true);
  }

  async function runLive() {
    setLoading(true);
    setError(null);
    setPlaying(false);
    setActive(0);
    try {
      const response = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: TOOLBENCH_SOIL.query,
          email: "jenisha.t@msruas.ac.in",
          sector: "Agriculture",
        }),
      });
      const payload = (await response.json()) as PipelineTrace & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Pipeline failed");
      setTrace(payload);
      setSource("live");
      setActive(0);
      setPlaying(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  const packetX = 70 + active * 150;

  return (
    <section className="space-y-4 rounded-xl border border-[var(--gold)] bg-[var(--panel)] p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
            Figure 7 animation · ToolBench datum
          </p>
          <h2 className="mt-1 font-serif text-2xl">Dataflow of {TOOLBENCH_SOIL.toolId}</h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
            {TOOLBENCH_FLOW.honesty} Packets below are the actual stage responses: recorded
            07 September 2026 numbers, or a live SATR → APRR → MNCD → FCNP pass of the same
            query. RapidAPI is never GET.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={replayRecorded} disabled={loading}>
            Replay recorded trace
          </Button>
          <Button size="sm" onClick={runLive} disabled={loading}>
            {loading ? "Running pipeline…" : "Pass ToolBench query live"}
          </Button>
        </div>
      </div>

      <svg viewBox="0 0 980 210" className="h-auto w-full dataflow-svg" role="img" aria-label="Animated ACRS dataflow">
        <defs>
          <marker id="df-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#c4a35a" />
          </marker>
          <linearGradient id="packet" x1="0" x2="1">
            <stop offset="0%" stopColor="#7dcea0" />
            <stop offset="100%" stopColor="#c4a35a" />
          </linearGradient>
        </defs>
        <path
          d="M 70 88 H 820"
          fill="none"
          stroke="#2a3b50"
          strokeWidth="3"
        />
        <path
          d="M 820 70 C 820 28, 70 28, 70 70"
          fill="none"
          stroke="#7dcea0"
          strokeDasharray="6 5"
          strokeWidth="1.6"
        />
        <text x="360" y="24" fill="#9ad4b3" fontSize="12">
          M_t writes back into SATR at t+1
        </text>
        {STAGES.map((stage, index) => {
          const x = 20 + index * 160;
          const on = index === active;
          const done = index < active;
          return (
            <g key={stage.id}>
              <rect
                x={x}
                y={58}
                width={140}
                height={64}
                rx={10}
                fill={on ? "#1f4d3a" : done ? "#1b2a3d" : "#162233"}
                stroke={on ? "#7dcea0" : done ? "#c4a35a" : "#7f93ab"}
                strokeWidth={on ? 2.4 : 1.4}
              />
              <text x={x + 70} y={84} textAnchor="middle" fill="#f4efe4" fontSize="13" fontFamily="Georgia, serif">
                {stage.label}
              </text>
              <text x={x + 70} y={104} textAnchor="middle" fill="#c9d4e0" fontSize="10">
                {stage.sub}
              </text>
              {index < STAGES.length - 1 ? (
                <line
                  x1={x + 140}
                  y1={90}
                  x2={x + 160}
                  y2={90}
                  stroke="#c4a35a"
                  strokeWidth={1.5}
                  markerEnd="url(#df-arrow)"
                />
              ) : null}
            </g>
          );
        })}
        <circle
          cx={packetX}
          cy={90}
          r={8}
          fill="url(#packet)"
          className="dataflow-packet"
        >
          <title>{STAGES[active].label}</title>
        </circle>
        <text x="20" y="150" fill="#c4a35a" fontSize="12" fontFamily="Georgia, serif">
          {source === "live" ? "Live pipeline response" : "Recorded ToolBench-schema trace"} · stage{" "}
          {active + 1}/{STAGES.length}: {STAGES[active].label}
        </text>
        <text x="20" y="172" fill="#9aa8b8" fontSize="11">
          Query tokens: soil, ph, recommended, fertilizer, dose, farm, village. Ranking library ≠ live GET.
        </text>
        <text x="20" y="198" fill="#7f93ab" fontSize="11">
          {trace
            ? `Live SATR top ${trace.satr.truncated[0]?.tool.id ?? "—"} · APRR ${trace.aprr.path.join(" → ") || "—"} · ${trace.liveOk ? "live OGD obtained" : "no live OGD"}`
            : "tb.agri.soil_health ranks first; MNCD then forces datagov.fertilizer."}
        </text>
      </svg>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <ol className="grid gap-2 md:grid-cols-2">
        {STAGES.map((stage, index) => (
          <li
            key={stage.id}
            className={`rounded-lg border px-3 py-2 text-sm ${
              index === active
                ? "border-[var(--gold)] bg-black/25 text-[var(--paper)]"
                : "border-[var(--line)] text-[var(--muted)]"
            }`}
          >
            <button type="button" className="w-full text-left" onClick={() => { setPlaying(false); setActive(index); }}>
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--gold)]">
                {index + 1}. {TOOLBENCH_FLOW.stages[index].title}
              </p>
              <p className="mt-1 leading-relaxed">{payloads[stage.id]}</p>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
