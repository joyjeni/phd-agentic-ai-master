"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { TOOLBENCH_FLOW } from "@/lib/research/algorithms";
import { TOOLBENCH_SOIL } from "@/lib/research/walkthrough";
import type { PipelineTrace } from "@/lib/research/types";

type StageId = "intake" | "satr" | "aprr" | "mncd" | "fcnp" | "writeback";

type Box = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub: string;
  tone: "new" | "io" | "live";
};

type Segment = {
  id: string;
  d: string;
  t0: number;
  t1: number;
  hold?: { x: number; y: number };
  reverse?: boolean;
  stage: StageId;
  highlight: string[];
  tag: string;
  kind: "forward" | "live" | "return";
};

const BOXES: Box[] = [
  { id: "query", x: 18, y: 154, w: 152, h: 76, title: "q_t + M_{t-1}", sub: "ToolBench schema", tone: "io" },
  { id: "satr", x: 190, y: 154, w: 152, h: 76, title: "SATR", sub: "O1 fused rank", tone: "new" },
  { id: "aprr", x: 362, y: 154, w: 152, h: 76, title: "APRR", sub: "O2 specialist hops", tone: "new" },
  { id: "mncd", x: 534, y: 154, w: 162, h: 76, title: "MNCD", sub: "O3 score-sum gate", tone: "new" },
  { id: "fcnp", x: 716, y: 154, w: 152, h: 76, title: "FCNP", sub: "O4 prune + pin", tone: "new" },
  { id: "answer", x: 888, y: 154, w: 134, h: 76, title: "a_t + M_t", sub: "citations", tone: "io" },
  { id: "live", x: 458, y: 312, w: 236, h: 64, title: "Live data.gov.in", sub: "fertilizer UUID — GET only here", tone: "live" },
];

const BY_ID = Object.fromEntries(BOXES.map((box) => [box.id, box])) as Record<string, Box>;

function cx(box: Box) {
  return box.x + box.w / 2;
}
function cy(box: Box) {
  return box.y + box.h / 2;
}
function right(box: Box) {
  return { x: box.x + box.w, y: cy(box) };
}
function left(box: Box) {
  return { x: box.x, y: cy(box) };
}
function bottom(box: Box) {
  return { x: cx(box), y: box.y + box.h };
}
function top(box: Box) {
  return { x: cx(box), y: box.y };
}

function hPath(a: Box, b: Box) {
  const from = right(a);
  const to = left(b);
  return `M ${from.x} ${from.y} H ${to.x}`;
}

const Q = BY_ID.query;
const SATR = BY_ID.satr;
const APRR = BY_ID.aprr;
const MNCD = BY_ID.mncd;
const FCNP = BY_ID.fcnp;
const ANS = BY_ID.answer;
const LIVE = BY_ID.live;

const SEGMENTS: Segment[] = [
  {
    id: "hold-q",
    d: `M ${cx(Q)} ${cy(Q)} h 0.1`,
    t0: 0,
    t1: 0.06,
    hold: { x: cx(Q), y: cy(Q) },
    stage: "intake",
    highlight: ["query"],
    tag: "q: soil pH + fertilizer",
    kind: "forward",
  },
  {
    id: "q-satr",
    d: hPath(Q, SATR),
    t0: 0.06,
    t1: 0.14,
    stage: "intake",
    highlight: ["query", "satr"],
    tag: "q + H + M → SATR",
    kind: "forward",
  },
  {
    id: "hold-satr",
    d: `M ${cx(SATR)} ${cy(SATR)} h 0.1`,
    t0: 0.14,
    t1: 0.22,
    hold: { x: cx(SATR), y: cy(SATR) },
    stage: "satr",
    highlight: ["satr"],
    tag: "shortlist: soil_health #1",
    kind: "forward",
  },
  {
    id: "satr-aprr",
    d: hPath(SATR, APRR),
    t0: 0.22,
    t1: 0.3,
    stage: "satr",
    highlight: ["satr", "aprr"],
    tag: "shortlist → APRR hops",
    kind: "forward",
  },
  {
    id: "hold-aprr",
    d: `M ${cx(APRR)} ${cy(APRR)} h 0.1`,
    t0: 0.3,
    t1: 0.36,
    hold: { x: cx(APRR), y: cy(APRR) },
    stage: "aprr",
    highlight: ["aprr"],
    tag: "hops: analyst → planner",
    kind: "forward",
  },
  {
    id: "aprr-mncd",
    d: hPath(APRR, MNCD),
    t0: 0.36,
    t1: 0.44,
    stage: "aprr",
    highlight: ["aprr", "mncd"],
    tag: "path + tools → MNCD",
    kind: "forward",
  },
  {
    id: "hold-mncd",
    d: `M ${cx(MNCD)} ${cy(MNCD)} h 0.1`,
    t0: 0.44,
    t1: 0.5,
    hold: { x: cx(MNCD), y: cy(MNCD) },
    stage: "mncd",
    highlight: ["mncd"],
    tag: "gate: ranking-only, force live",
    kind: "forward",
  },
  {
    id: "mncd-live",
    d: `M ${bottom(MNCD).x} ${bottom(MNCD).y} L ${top(LIVE).x} ${top(LIVE).y}`,
    t0: 0.5,
    t1: 0.58,
    stage: "mncd",
    highlight: ["mncd", "live"],
    tag: "GET datagov.fertilizer",
    kind: "live",
  },
  {
    id: "hold-live",
    d: `M ${cx(LIVE)} ${cy(LIVE)} h 0.1`,
    t0: 0.58,
    t1: 0.64,
    hold: { x: cx(LIVE), y: cy(LIVE) },
    stage: "mncd",
    highlight: ["live"],
    tag: "urea subsidy rows (live)",
    kind: "live",
  },
  {
    id: "live-mncd",
    d: `M ${top(LIVE).x} ${top(LIVE).y} L ${bottom(MNCD).x} ${bottom(MNCD).y}`,
    t0: 0.64,
    t1: 0.72,
    stage: "mncd",
    highlight: ["live", "mncd"],
    tag: "observations → mesh",
    kind: "live",
  },
  {
    id: "mncd-fcnp",
    d: hPath(MNCD, FCNP),
    t0: 0.72,
    t1: 0.8,
    stage: "mncd",
    highlight: ["mncd", "fcnp"],
    tag: "trace + citations → FCNP",
    kind: "forward",
  },
  {
    id: "hold-fcnp",
    d: `M ${cx(FCNP)} ${cy(FCNP)} h 0.1`,
    t0: 0.8,
    t1: 0.86,
    hold: { x: cx(FCNP), y: cy(FCNP) },
    stage: "fcnp",
    highlight: ["fcnp"],
    tag: "pin citation + prune M_t",
    kind: "forward",
  },
  {
    id: "fcnp-ans",
    d: hPath(FCNP, ANS),
    t0: 0.86,
    t1: 0.92,
    stage: "fcnp",
    highlight: ["fcnp", "answer"],
    tag: "a_t + pinned citations",
    kind: "forward",
  },
  {
    id: "fcnp-satr",
    d: `M ${top(FCNP).x} ${top(FCNP).y} C ${top(FCNP).x} 58, ${top(SATR).x} 58, ${top(SATR).x} ${top(SATR).y}`,
    t0: 0.86,
    t1: 1,
    stage: "writeback",
    highlight: ["fcnp", "satr", "query"],
    tag: "M_t → SATR at t+1",
    kind: "return",
  },
];

const CYCLE_MS = 16000;
const VB = { w: 1040, h: 430 };

function wrap(t: number) {
  const v = t % 1;
  return v < 0 ? v + 1 : v;
}

function segmentAt(cycle: number): { seg: Segment; u: number } {
  const t = wrap(cycle);
  const seg = SEGMENTS.find((row) => t >= row.t0 && t < row.t1) ?? SEGMENTS[SEGMENTS.length - 1];
  const span = Math.max(1e-6, seg.t1 - seg.t0);
  const u = Math.min(1, Math.max(0, (t - seg.t0) / span));
  return { seg, u: seg.reverse ? 1 - u : u };
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

function Packet({
  x,
  y,
  tag,
  kind,
  opacity = 1,
  glowId,
  fillId,
}: {
  x: number;
  y: number;
  tag: string;
  kind: Segment["kind"];
  opacity?: number;
  glowId: string;
  fillId: string;
}) {
  const tagW = Math.min(248, 14 + tag.length * 7.2);
  const tagX = Math.min(Math.max(x - tagW / 2, 8), VB.w - tagW - 8);
  const tagY = y < 92 ? y + 18 : y - 46;
  const stroke = kind === "live" ? "#7dcea0" : kind === "return" ? "#9ad4b3" : "#c4a35a";
  return (
    <g opacity={opacity} className="dataflow-packet">
      <circle cx={x} cy={y} r={13} fill={`url(#${fillId})`} filter={`url(#${glowId})`} />
      <circle cx={x} cy={y} r={5.5} fill="#0e1724" />
      <rect
        x={tagX}
        y={tagY}
        width={tagW}
        height={26}
        rx={8}
        fill="#0e1724"
        stroke={stroke}
        strokeWidth={1.3}
      />
      <text
        x={tagX + tagW / 2}
        y={tagY + 17}
        textAnchor="middle"
        fill={stroke}
        fontSize="11"
        fontFamily="ui-sans-serif, system-ui"
      >
        {tag}
      </text>
    </g>
  );
}

export function DataflowLab({ compact = false }: { compact?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [epoch, setEpoch] = useState(0);
  const [cycleNo, setCycleNo] = useState(1);
  const progressRef = useRef(0);
  progressRef.current = progress;
  const lastProgress = useRef(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trace, setTrace] = useState<PipelineTrace | null>(null);
  const [source, setSource] = useState<"recorded" | "live">("recorded");
  const [pathsReady, setPathsReady] = useState(0);

  useLayoutEffect(() => {
    setPathsReady((value) => value + 1);
  }, []);

  const payloads = useMemo(
    () => (trace ? payloadsFromTrace(trace) : recordedPayloads()),
    [trace],
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      setPlaying(false);
      setProgress(0.2);
    }
  }, []);

  useEffect(() => {
    if (!playing) return;
    const started = performance.now() - progressRef.current * CYCLE_MS;
    let frame = 0;
    const tick = (now: number) => {
      const next = ((now - started) % CYCLE_MS) / CYCLE_MS;
      if (next + 0.4 < lastProgress.current) {
        setCycleNo((value) => value + 1);
      }
      lastProgress.current = next;
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
    lastProgress.current = 0;
    setProgress(0);
    setCycleNo(1);
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
      lastProgress.current = 0;
      setProgress(0);
      setCycleNo(1);
      setEpoch((value) => value + 1);
      setPlaying(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  const primary = segmentAt(progress);
  const writeback = SEGMENTS.find((row) => row.id === "fcnp-satr")!;
  const answerSeg = SEGMENTS.find((row) => row.id === "fcnp-ans")!;

  function pointOnSegment(seg: Segment, uRaw: number): { x: number; y: number; seg: Segment; u: number } {
    const u = Math.min(1, Math.max(0, uRaw));
    if (seg.hold) return { x: seg.hold.x, y: seg.hold.y, seg, u };
    const el = svgRef.current?.getElementById(`${uid}-${seg.id}`) as SVGPathElement | null;
    if (!el) {
      return { x: cx(SATR), y: cy(SATR), seg, u };
    }
    const len = el.getTotalLength();
    const pt = el.getPointAtLength(u * Math.max(len, 0.01));
    return { x: pt.x, y: pt.y, seg, u };
  }

  function pointOf(cycle: number): { x: number; y: number; seg: Segment; u: number } {
    const { seg, u } = segmentAt(cycle);
    return pointOnSegment(seg, u);
  }

  const head = pointOf(progress);
  const ghostPt = pointOf(progress - 0.5);
  const writeU = (progress - writeback.t0) / (writeback.t1 - writeback.t0);
  const twin =
    progress >= writeback.t0 && primary.seg.id !== "fcnp-satr"
      ? pointOnSegment(writeback, writeU)
      : progress >= answerSeg.t1 && primary.seg.id === "fcnp-satr"
        ? { x: cx(ANS), y: cy(ANS), seg: answerSeg, u: 1 }
        : null;
  const trail = [0.018, 0.036, 0.054, 0.072].map((delta, i) => ({
    key: i,
    pt: pointOf(progress - delta),
    opacity: 0.42 - i * 0.08,
    r: 7 - i,
  }));

  const glowId = `glow-${uid}`;
  const fillId = `packet-${uid}`;
  const liveFill = `live-${uid}`;
  const active = new Set(head.seg.highlight);
  if (twin) twin.seg.highlight.forEach((id) => active.add(id));

  const phaseLabel =
    head.seg.kind === "return"
      ? "Write-back"
      : head.seg.kind === "live"
        ? "Live GET"
        : TOOLBENCH_FLOW.stages.find((row) => row.id === head.seg.stage)?.title ?? head.seg.stage;

  return (
    <section
      id="flow"
      className="space-y-4 rounded-xl border border-[var(--gold)] bg-[var(--panel)] p-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
            Animated information flow · ToolBench datum · loop {cycleNo}
          </p>
          <h2 className="mt-1 font-serif text-2xl">
            {compact ? "ACRS dataflow" : `Information flow of ${TOOLBENCH_SOIL.toolId}`}
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
            Labels ride the packet. Gold is ranking payload, green is the live
            data.gov.in GET, sage is M_t writing back into SATR. The loop does not
            stop: turn t becomes the prior for t+1.
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
        ref={svgRef}
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        className="h-auto w-full dataflow-svg"
        data-paths-ready={pathsReady}
        role="img"
        aria-label="Animated ACRS information flow along SATR, APRR, MNCD, FCNP, live data.gov.in, and write-back"
      >
        <defs>
          <marker id={`arr-${uid}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#c4a35a" />
          </marker>
          <marker id={`arr-live-${uid}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#7dcea0" />
          </marker>
          <linearGradient id={fillId} x1="0" x2="1">
            <stop offset="0%" stopColor="#7dcea0" />
            <stop offset="100%" stopColor="#c4a35a" />
          </linearGradient>
          <linearGradient id={liveFill} x1="0" y2="1">
            <stop offset="0%" stopColor="#c4a35a" />
            <stop offset="100%" stopColor="#7dcea0" />
          </linearGradient>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="2.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="18" y="18" width="1004" height="44" rx="10" fill="#1f4d3a" stroke="#7dcea0" strokeWidth="1.4" />
        <text x="520" y="36" textAnchor="middle" fill="#f4efe4" fontSize="13" fontFamily="Georgia, serif">
          SATR — Session-Aware Tool Retrieval. Closed loop SATR → APRR → MNCD → FCNP → SATR
        </text>
        <text x="520" y="52" textAnchor="middle" fill="#9ad4b3" fontSize="11">
          Live Indian OGD enters only at MNCD. Ranking-only soil_health never GETs RapidAPI.
        </text>

        <text x="520" y="78" textAnchor="middle" fill="#9ad4b3" fontSize="12">
          write-back: FCNP citations become the next SATR prior
        </text>

        {SEGMENTS.filter((seg) => !seg.hold).map((seg) => {
          const on = head.seg.id === seg.id || (twin && twin.seg.id === seg.id);
          const live = seg.kind === "live";
          const ret = seg.kind === "return";
          return (
            <path
              key={seg.id}
              id={`${uid}-${seg.id}`}
              d={seg.d}
              fill="none"
              stroke={live ? "#7dcea0" : ret ? "#9ad4b3" : "#c4a35a"}
              strokeWidth={on ? 3.2 : 2}
              strokeDasharray={ret || live ? "7 6" : "10 8"}
              className={ret ? "dataflow-return" : "dataflow-pipe"}
              markerEnd={`url(#${live ? `arr-live-${uid}` : `arr-${uid}`})`}
              opacity={on ? 1 : 0.55}
            />
          );
        })}

        {!head.seg.hold ? (
          <path
            d={head.seg.d}
            fill="none"
            stroke={head.seg.kind === "live" ? "#f4efe4" : "#fff3c4"}
            strokeWidth={4.2}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="18 82"
            strokeDashoffset={-head.u * 100}
            opacity={0.9}
          />
        ) : null}

        {BOXES.map((box) => {
          const on = active.has(box.id);
          const fill =
            box.tone === "live"
              ? on
                ? "#1f4d3a"
                : "#163226"
              : box.tone === "io"
                ? on
                  ? "#4a3b1f"
                  : "#3a2f1a"
                : on
                  ? "#1f4d3a"
                  : "#162233";
          const stroke =
            box.tone === "live" || box.tone === "new" ? "#7dcea0" : "#c4a35a";
          return (
            <g key={box.id}>
              <rect
                x={box.x}
                y={box.y}
                width={box.w}
                height={box.h}
                rx={10}
                fill={fill}
                stroke={stroke}
                strokeWidth={on ? 2.6 : 1.4}
                filter={on ? `url(#${glowId})` : undefined}
              />
              <text
                x={cx(box)}
                y={box.y + 30}
                textAnchor="middle"
                fill="#f4efe4"
                fontSize="14"
                fontFamily="Georgia, serif"
              >
                {box.title}
              </text>
              <text x={cx(box)} y={box.y + 50} textAnchor="middle" fill="#c9d4e0" fontSize="10">
                {box.sub}
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
            fill={dot.pt.seg.kind === "live" ? "#7dcea0" : "#c4a35a"}
            opacity={dot.opacity}
          />
        ))}

        <Packet
          x={ghostPt.x}
          y={ghostPt.y}
          tag={ghostPt.seg.tag}
          kind={ghostPt.seg.kind}
          opacity={0.38}
          glowId={glowId}
          fillId={fillId}
        />
        {twin && twin.seg.id !== head.seg.id ? (
          <Packet
            x={twin.x}
            y={twin.y}
            tag={twin.seg.tag}
            kind={twin.seg.kind}
            opacity={0.9}
            glowId={glowId}
            fillId={fillId}
          />
        ) : null}
        <Packet
          x={head.x}
          y={head.y}
          tag={head.seg.tag}
          kind={head.seg.kind}
          glowId={glowId}
          fillId={head.seg.kind === "live" ? liveFill : fillId}
        />

        <g>
          <rect x="18" y="392" width="14" height="14" rx="3" fill="#c4a35a" />
          <text x="38" y="403" fill="#c9d4e0" fontSize="11">
            ranking payload
          </text>
          <rect x="168" y="392" width="14" height="14" rx="3" fill="#7dcea0" />
          <text x="188" y="403" fill="#c9d4e0" fontSize="11">
            live GET
          </text>
          <rect x="278" y="392" width="14" height="14" rx="3" fill="#9ad4b3" />
          <text x="298" y="403" fill="#c9d4e0" fontSize="11">
            write-back M_t
          </text>
          <text x="1022" y="403" textAnchor="end" fill="#c4a35a" fontSize="11">
            turn t → t+1 · cycle {cycleNo}
          </text>
        </g>
      </svg>

      <p className="rounded-lg border border-[var(--gold)]/50 bg-black/25 px-4 py-3 text-sm leading-relaxed text-[var(--paper)]">
        <span className="text-[var(--gold)]">
          {source === "live" ? "Live" : "Recorded"} · {phaseLabel} · {head.seg.tag}
        </span>
        {" — "}
        {payloads[head.seg.stage]}
      </p>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {compact ? null : (
        <ol className="grid gap-2 md:grid-cols-2">
          {TOOLBENCH_FLOW.stages.map((stage, index) => (
            <li
              key={stage.id}
              className={`rounded-lg border px-3 py-2 text-sm ${
                head.seg.stage === stage.id
                  ? "border-[var(--gold)] bg-black/25 text-[var(--paper)]"
                  : "border-[var(--line)] text-[var(--muted)]"
              }`}
            >
              <button
                type="button"
                className="w-full text-left"
                onClick={() => {
                  const target = SEGMENTS.find((seg) => seg.stage === stage.id && seg.hold) ?? SEGMENTS.find((seg) => seg.stage === stage.id);
                  const p = target ? (target.t0 + target.t1) / 2 : 0;
                  progressRef.current = p;
                  lastProgress.current = p;
                  setPlaying(false);
                  setProgress(p);
                }}
              >
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--gold)]">
                  {index + 1}. {stage.title}
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
