import { readFileSync } from "node:fs";
import { createSession, runPipeline } from "../lib/research/pipeline.ts";
import { satrRerank } from "../lib/research/satr.ts";
import { extractToolArguments, preferredLiveToolId } from "../lib/research/datagov.ts";
import { getTool } from "../lib/research/catalog.ts";

const jsonl = readFileSync("data/toolbench/queries.test.jsonl", "utf8")
  .trim()
  .split("\n")
  .map((line) => JSON.parse(line) as { qid: string; query: string; gold_doc_ids: string[] });
const tb = jsonl.find((row) => row.qid === "6491")!;

const soil = "What is the soil pH and recommended fertilizer dose for a farm village?";
const mandi = "What is the current mandi price of wheat in Punjab?";

function compactSatr(query: string) {
  const session = createSession();
  session.id = "walkthrough";
  const r = satrRerank(query, session, undefined, 8);
  return {
    query,
    mode: r.queryMode,
    top: r.truncated.slice(0, 8).map((item) => ({
      id: item.tool.id,
      name: item.tool.name,
      source: item.tool.source,
      live: item.tool.liveExecutable,
      score: Number(item.score.toFixed(4)),
      semantic: Number(item.semantic.toFixed(4)),
      cat: Number(item.cat.toFixed(4)),
      sch: Number(item.sch.toFixed(4)),
      ept: Number(item.ept.toFixed(4)),
      cooc: Number(item.cooc.toFixed(4)),
      rec: Number(item.recency.toFixed(4)),
      fail: item.failPenalty,
      seen: item.seenUnseen,
    })),
  };
}

function compactTrace(label: string, trace: Awaited<ReturnType<typeof runPipeline>>) {
  return {
    label,
    query: trace.query,
    pipelineOk: trace.pipelineOk,
    liveOk: trace.liveOk,
    answer: trace.answer.slice(0, 900),
    satrTop: trace.satr.truncated.slice(0, 6).map((item) => ({
      id: item.tool.id,
      score: Number(item.score.toFixed(4)),
      live: item.tool.liveExecutable,
      source: item.tool.source,
    })),
    aprrPath: trace.aprr.path,
    assignments: trace.aprr.assignments.map((row) => ({
      hop: row.hop,
      agent: row.agent.id,
      p: Number(row.probability.toFixed(4)),
      tools: row.tools.map((t) => t.tool.id),
    })),
    proposals: trace.mncd.proposals.map((p) => ({
      agent: p.agentId,
      tool: p.toolId,
      conf: Number(p.confidence.toFixed(4)),
      args: p.arguments,
      ranking: p.ranking.map(([id, s]) => [id, Number(s.toFixed(4))]),
    })),
    votes: trace.mncd.votes.slice(0, 6),
    executed: trace.mncd.executed.map((e) => ({
      toolId: e.toolId,
      ok: e.ok,
      source: e.source,
      latencyMs: e.latencyMs,
      arguments: e.arguments,
      summary: e.summary.slice(0, 500),
    })),
    fcnp: {
      original: trace.fcnp.stats.original,
      retained: trace.fcnp.stats.retained,
      evicted: trace.fcnp.stats.evicted,
      pinned: trace.fcnp.stats.pinned,
      iterations: trace.fcnp.stats.iterations,
      converged: trace.fcnp.stats.converged,
      retainedKinds: trace.fcnp.retained.map((el) => `${el.kind}:${el.tier}:${el.id}`),
      evictedKinds: trace.fcnp.evicted.map((el) => `${el.kind}:${el.tier}:${el.id}`),
    },
    writeback: trace.session.memory.slice(0, 8).map((el) => el.id),
  };
}

const sessionSoil = createSession();
sessionSoil.id = "walkthrough";
const sessionMandi = createSession();
sessionMandi.id = "walkthrough";
const sessionTb = createSession();
sessionTb.id = "walkthrough";

const soilTool = getTool("tb.agri.soil_health")!;
const mandiTool = getTool("datagov.mandi_prices")!;

const out = {
  toolbenchJsonl: tb,
  preferred: {
    aircraft: preferredLiveToolId(tb.query),
    soil: preferredLiveToolId(soil),
    mandi: preferredLiveToolId(mandi),
  },
  args: {
    soilOnSoilTool: extractToolArguments(soil, soilTool),
    mandiOnMandi: extractToolArguments(mandi, mandiTool),
  },
  satr: {
    aircraft: compactSatr(tb.query),
    soil: compactSatr(soil),
    mandi: compactSatr(mandi),
  },
};

async function main() {
  const [soilTrace, mandiTrace, tbTrace] = await Promise.all([
    runPipeline({ query: soil, email: "jenisha.t@msruas.ac.in", session: sessionSoil }),
    runPipeline({ query: mandi, email: "jenisha.t@msruas.ac.in", session: sessionMandi }),
    runPipeline({ query: tb.query, email: "jenisha.t@msruas.ac.in", session: sessionTb }),
  ]);

  console.log(
    JSON.stringify(
      {
        ...out,
        traces: {
          soil: compactTrace("toolbench-schema-soil", soilTrace),
          mandi: compactTrace("datagov-agmarknet", mandiTrace),
          aircraft: compactTrace("toolbench-g1-qid6491", tbTrace),
        },
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
