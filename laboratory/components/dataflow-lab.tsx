"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { TOOLBENCH_FLOW } from "@/lib/research/algorithms";
import { TOOLBENCH_SOIL } from "@/lib/research/walkthrough";
import type { PipelineTrace } from "@/lib/research/types";

const STAGES = [
  { id: "intake", label: "q_t", sub: "ToolBench schema", tag: "q: soil pH + fertilizer" },
  { id: "satr", label: "SATR", sub: "O1 fused rank", tag: "shortlist: soil_health #1" },
  { id: "aprr", label: "APRR", sub: "O2 hops", tag: "hops: analyst → planner" },
  { id: "mncd", label: "MNCD", sub: "O3 live gate", tag: "GET datagov.fertilizer" },
  { id: "fcnp", label: "FCNP", sub: "O4 prune", tag: "pin citation + M_t" },
  { id: "writeback", label: "M_t", sub: "write-back", tag: "M_t → SATR at t+1" },
] as const;

type StageId = (typeof STAGES)[number]["id"];

const BOX_W = 142;
const BOX_H = 68;
const BOX_Y = 86;
const BOX_GAP = 16;
const BOX_START = 22;
const CYCLE_MS = 14000;
const FORWARD = 0.78;

const CENTERS = STAGES.map((_, i) => ({
  x: BOX_START + i * (BOX_W + BOX_GAP) + BOX_W / 2,
  y: BOX_Y + BOX_H / 2,
}));

function bezier(
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
) {
  const u = 1 - t;
  return {
    x: u ** 3 * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t ** 3 * p3.x,
    y: u ** 3 * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t ** 3 * p3.y,
  };
}

function wrap(t: number): number {
  const v = t % 1;
  return v < 0 ? v + 1 : v;
}

function pointOnFlow(cycle: number): {
  x: number;
  y: number;
  stage: number;
  phase: "forward" | "return";
} {
  const t = wrap(cycle);
  const first = CENTERS[0];
  const last = CENTERS[CENTERS.length - 1];
  if (t <= FORWARD) {
    const u = t / FORWARD;
    const scaled = u * (CENTERS.length - 1);
    const i = Math.min(CENTERS.length - 2, Math.floor(scaled));
    const local = scaled - i;
    const a = CENTERS[i];
    const b = CENTERS[i + 1];
    return {
      x: a.x + (b.x - a.x) * local,
      y: a.y,
      stage: Math.min(CENTERS.length - 1, Math.round(scaled)),
      phase: "forward",
    };
  }
  const u = (t - FORWARD) / (1 - FORWARD);
  const p = bezier(u, last, { x: last.x, y: 28 }, { x: first.x, y: 28 }, first);
  return { x: p.x, y: p.y, stage: 0, phase: "return" };
}

function payloadsFromTrace(trace: PipelineTrace): Record<StageId, string> {
  const top = trace.satr.truncated
    .slice(0, 4)
    .map(
      (item, i) =>
        `${i + 1}. ${item.tool.id} s=${item.score.toFixed(3)}${item.tool.liveExecutable ? " live" : " ranking-only"}`,
    )
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

export function DataflowLab({ compact = false }: { compact?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [epoch, setEpoch] = useState(0);
  const progressRef = useRef(0);
  progressRef.current = progress;
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
    const started = performance.now() - progressRef.current * CYCLE_MS;
    let frame = 0;
    const tick = (now: number) => {
      const next = ((now - started) % CYCLE_MS) / CYCLE_MS;
      progressRef.current = next;
      setProgress(next);
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [playing, epoch]);

  function replayRecorded() {
    setSource("recorded");
    setTrace(null);
    setError(null);
    progressRef.current = 0;
    setProgress(0);
    setEpoch((value) => value + 1);
    setPlaying(true);
  }

  async function runLive() {
    setLoading(true);
    setError(null);
    setPlaying(false);
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
      progressRef.current = 0;
      setProgress(0);
      setEpoch((value) => value + 1);
      setPlaying(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  const head = pointOnFlow(progress);
  const active = head.phase === "return" ? 5 : head.stage;
  const tag = head.phase === "return" ? STAGES[5].tag : STAGES[active].tag;
  const trail = [0.035, 0.07, 0.105, 0.14].map((delta, i) => ({
    key: i,
    pt: pointOnFlow(progress - delta),
    opacity: 0.45 - i * 0.08,
    r: 7 - i,
  }));

  const pipeId = `pipe-${uid}`;
  const backId = `back-${uid}`;
  const packetFill = `packet-${uid}`;

  return (
    <section
      id="flow"
      className="space-y-4 rounded-xl border border-[var(--gold)] bg-[var(--panel)] p-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
            Animated information flow · ToolBench datum
          </p>
          <h2 className="mt-1 font-serif text-2xl">
            {compact ? "ACRS dataflow" : `Information flow of ${TOOLBENCH_SOIL.toolId}`}
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
            Packets carry the ToolBench-schema query through SATR → APRR → MNCD → FCNP,
            then M_t writes back into SATR. Ranking-only soil_health never GETs RapidAPI;
            MNCD forces live data.gov.in fertilizer rows. The loop repeats.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => setPlaying((value) => !value)}>
            {playing ? "Pause flow" : "Play flow"}
          </Button>
          <Button size="sm" variant="secondary" onClick={replayRecorded} disabled={loading}>
            Restart
          </Button>
          <Button size="sm" onClick={runLive} disabled={loading}>
            {loading ? "Running pipeline…" : "Pass query live"}
          </Button>
        </div>
      </div>

      <svg
        viewBox="0 0 1000 250"
        className="h-auto w-full dataflow-svg"
        role="img"
        aria-label="Animated ACRS information flow"
      >
        <defs>
          <marker id={`arr-${uid}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#c4a35a" />
          </marker>
          <linearGradient id={packetFill} x1="0" x2="1">
            <stop offset="0%" stopColor="#7dcea0" />
            <stop offset="100%" stopColor="#c4a35a" />
          </linearGradient>
          <filter id={`glow-${uid}`}>
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          id={pipeId}
          d={`M ${CENTERS[0].x} ${CENTERS[0].y} H ${CENTERS[CENTERS.length - 1].x}`}
          fill="none"
          stroke="#2a3b50"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d={`M ${CENTERS[0].x} ${CENTERS[0].y} H ${CENTERS[CENTERS.length - 1].x}`}
          fill="none"
          stroke="#c4a35a"
          strokeWidth="2.4"
          strokeDasharray="10 8"
          className="dataflow-pipe"
        />
        <path
          id={backId}
          d={`M ${CENTERS[CENTERS.length - 1].x} ${CENTERS[0].y} C ${CENTERS[CENTERS.length - 1].x} 28, ${CENTERS[0].x} 28, ${CENTERS[0].x} ${CENTERS[0].y}`}
          fill="none"
          stroke="#7dcea0"
          strokeWidth="2"
          strokeDasharray="6 7"
          className="dataflow-return"
        />
        <text x="500" y="22" textAnchor="middle" fill="#9ad4b3" fontSize="12">
          write-back: FCNP citations become the next SATR prior
        </text>
        {STAGES.map((stage, index) => {
          const x = BOX_START + index * (BOX_W + BOX_GAP);
          const on =
            (head.phase === "forward" && active === index) ||
            (head.phase === "return" && (index === 0 || index === 5));
          const done = head.phase === "forward" && index < active;
          return (
            <g key={stage.id}>
              <rect
                x={x}
                y={BOX_Y}
                width={BOX_W}
                height={BOX_H}
                rx={10}
                fill={on ? "#1f4d3a" : done ? "#1b2a3d" : "#162233"}
                stroke={on ? "#7dcea0" : done ? "#c4a35a" : "#7f93ab"}
                strokeWidth={on ? 2.6 : 1.4}
                filter={on ? `url(#glow-${uid})` : undefined}
              />
              <text
                x={x + BOX_W / 2}
                y={BOX_Y + 28}
                textAnchor="middle"
                fill="#f4efe4"
                fontSize="14"
                fontFamily="Georgia, serif"
              >
                {stage.label}
              </text>
              <text x={x + BOX_W / 2} y={BOX_Y + 48} textAnchor="middle" fill="#c9d4e0" fontSize="10">
                {stage.sub}
              </text>
            </g>
          );
        })}
        {trail.map((dot) => (
          <circle
            key={dot.key}
            cx={dot.pt.x}
            cy={dot.pt.y}
            r={dot.r}
            fill="#7dcea0"
            opacity={dot.opacity}
          />
        ))}
        <g>
          <circle
            cx={head.x}
            cy={head.y}
            r={11}
            fill={`url(#${packetFill})`}
            filter={`url(#glow-${uid})`}
          />
          <rect
            x={head.x - 108}
            y={head.y - 42}
            width={216}
            height={24}
            rx={8}
            fill="#0e1724"
            stroke="#7dcea0"
            strokeWidth={1.2}
          />
          <text
            x={head.x}
            y={head.y - 26}
            textAnchor="middle"
            fill="#7dcea0"
            fontSize="11"
            fontFamily="ui-sans-serif, system-ui"
          >
            {tag}
          </text>
        </g>
      </svg>

      <p className="rounded-lg border border-[var(--gold)]/50 bg-black/25 px-4 py-3 text-sm leading-relaxed text-[var(--paper)]">
        <span className="text-[var(--gold)]">
          {source === "live" ? "Live" : "Recorded"} ·{" "}
          {head.phase === "return" ? "Write-back" : STAGES[active].label}
        </span>
        {" — "}
        {payloads[head.phase === "return" ? "writeback" : STAGES[active].id]}
      </p>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {compact ? null : (
        <ol className="grid gap-2 md:grid-cols-2">
          {STAGES.map((stage, index) => (
            <li
              key={stage.id}
              className={`rounded-lg border px-3 py-2 text-sm ${
                active === index && head.phase === "forward"
                  ? "border-[var(--gold)] bg-black/25 text-[var(--paper)]"
                  : "border-[var(--line)] text-[var(--muted)]"
              }`}
            >
              <button
                type="button"
                className="w-full text-left"
                onClick={() => {
                  const p = (index / Math.max(STAGES.length - 1, 1)) * FORWARD * 0.98;
                  progressRef.current = p;
                  setPlaying(false);
                  setProgress(p);
                }}
              >
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--gold)]">
                  {index + 1}. {TOOLBENCH_FLOW.stages[index].title}
                </p>
                <p className="mt-1 leading-relaxed">{payloads[stage.id]}</p>
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
