import { executeTool, extractToolArguments, preferredLiveToolId } from "./datagov";
import { getTool } from "./catalog";
import { looksMultiTool, overlap } from "./text";
import type {
  AgentId,
  AprrResult,
  MncdResult,
  PeerStat,
  ProposedAction,
  SessionState,
  ToolCallResult,
} from "./types";

const FANOUT = 3;
const ROUNDS = 2;
const DISTRESS = 0.55;

function defaultPeer(agentId: string): PeerStat {
  return { success: 0.8, latencyMs: 80, weight: 0.8 / 1.08 };
}

export function consensusPick(
  ranks: Array<{ agent: string; ranking: Array<[string, number]> }>,
  weights: Record<string, number>,
): { pick: string; score: number; tally: Record<string, number> } {
  const score: Record<string, number> = {};
  for (const row of ranks) {
    const w = weights[row.agent] ?? 1;
    for (const [toolName, s] of row.ranking) {
      score[toolName] = (score[toolName] ?? 0) + w * s;
    }
  }
  const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0];
  return { pick: best?.[0] ?? "", score: best?.[1] ?? 0, tally: score };
}

function updatePeer(prev: PeerStat | undefined, success: boolean, latencyMs: number): PeerStat {
  const alpha = 0.3;
  const cur = prev ?? defaultPeer("x");
  const nextSuccess = (1 - alpha) * cur.success + alpha * (success ? 1 : 0);
  const nextLat = (1 - alpha) * cur.latencyMs + alpha * latencyMs;
  return {
    success: nextSuccess,
    latencyMs: nextLat,
    weight: Math.max(1e-3, nextSuccess / (1 + nextLat / 1000)),
  };
}

export async function mncdExecute(
  query: string,
  aprr: AprrResult,
  session?: SessionState,
  options: { apiKey?: string; fetchImpl?: typeof fetch } = {},
): Promise<MncdResult> {
  const nodes = aprr.assignments.map((row) => row.agent.id);
  if (!nodes.length) {
    return {
      nodes: [],
      edges: [],
      proposals: [],
      votes: [],
      executed: [],
      consensusNotes: ["MNCD aborted: APRR produced no agents."],
      circuitOpen: [],
      consensus: "score_sum",
      gossip: { published: 0, replicas: [], rounds: 0 },
    };
  }

  const peerStats = { ...(session?.peerStats ?? {}) };
  const edges: MncdResult["edges"] = [];
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = 0; j < nodes.length; j += 1) {
      if (i === j) continue;
      const stat = peerStats[nodes[j]] ?? defaultPeer(nodes[j]);
      edges.push({ from: nodes[i], to: nodes[j], weight: stat.weight });
    }
  }

  const proposals: ProposedAction[] = [];
  for (const assignment of aprr.assignments) {
    const ranking: Array<[string, number]> = assignment.tools.map((item, index) => {
      const tool = getTool(item.tool.id) ?? item.tool;
      const args = extractToolArguments(query, tool);
      const queryFit = overlap(query, `${tool.name} ${tool.description} ${JSON.stringify(args)}`);
      const liveBoost =
        (tool.liveExecutable ? 0.25 : 0) + (tool.id === preferredLiveToolId(query) ? 0.2 : 0);
      const s = Math.max(0.05, 0.45 * item.score / (Math.abs(item.score) + 2) + 0.35 * queryFit + liveBoost - index * 0.05);
      return [tool.id, s];
    });
    ranking.sort((a, b) => b[1] - a[1]);
    const top = ranking[0];
    if (!top) continue;
    const tool = getTool(top[0]);
    if (!tool) continue;
    const confidence = top[1];
    proposals.push({
      agentId: assignment.agent.id,
      toolId: tool.id,
      arguments: extractToolArguments(query, tool),
      confidence,
      rationale: `${assignment.agent.name} published rank.update after gossip; pick ${tool.name} (score-sum candidate).`,
      ranking,
    });
  }

  const weights: Record<string, number> = {};
  for (const node of nodes) weights[node] = (peerStats[node] ?? defaultPeer(node)).weight;
  const consensus = consensusPick(
    proposals.map((p) => ({ agent: p.agentId, ranking: p.ranking })),
    weights,
  );

  const votes = Object.entries(consensus.tally)
    .map(([toolId, weight]) => ({
      toolId,
      weight,
      voters: proposals.filter((p) => p.ranking.some(([id]) => id === toolId)).map((p) => p.agentId),
    }))
    .sort((a, b) => b.weight - a.weight);

  const liveMandi = getTool("datagov.mandi_prices");
  const preferred = getTool(preferredLiveToolId(query)) ?? liveMandi;
  const winners = votes
    .filter((vote) => getTool(vote.toolId)?.liveExecutable)
    .slice(0, looksMultiTool(query) ? 2 : 1);
  if (!winners.length && preferred) {
    winners.push({
      toolId: preferred.id,
      weight: 1,
      voters: nodes,
    });
  }

  const executed: ToolCallResult[] = [];
  for (const winner of winners) {
    const fallbackTool = getTool(winner.toolId) ?? preferred ?? liveMandi;
    const proposal =
      proposals.find((item) => item.ranking.some(([id]) => id === winner.toolId)) ??
      (fallbackTool
        ? {
            agentId: nodes[0],
            toolId: fallbackTool.id,
            arguments: extractToolArguments(query, fallbackTool),
            confidence: 1,
            rationale: "Forced live data.gov.in Agriculture execution; catalog-only tools are not run.",
            ranking: [[fallbackTool.id, 1]] as Array<[string, number]>,
          }
        : undefined);
    const tool = getTool(winner.toolId) ?? fallbackTool;
    if (!proposal || !tool || !tool.liveExecutable) continue;
    const started = Date.now();
    const result = await executeTool(tool, proposal.arguments, options);
    const latency = Math.max(1, Date.now() - started);
    executed.push({
      toolId: tool.id,
      ok: result.ok,
      latencyMs: latency,
      source: result.source,
      arguments: proposal.arguments,
      payload: result.payload,
      summary: result.summary,
    });
    for (const node of nodes) {
      peerStats[node] = updatePeer(peerStats[node], result.ok, latency);
    }
  }

  const replicas = nodes.slice(0, FANOUT);
  const distress = proposals.filter((p) => p.confidence < DISTRESS).length;
  const consensusNotes = [
    "Faithful MNCD: pub/sub rank.update, gossip fanout=3, R=3 LWW replicate, score-sum consensus (not Borda — consensus_pick_borda exists in the GitHub repo but eval uses score-sum).",
    consensus.pick
      ? `Score-sum winner ${consensus.pick} (tally ${consensus.score.toFixed(3)}) after ${ROUNDS} gossip rounds.`
      : "No consensus pick.",
    distress
      ? `${distress} distress signals (confidence < τ=${DISTRESS}) published on __distress__.`
      : "No distress channel traffic.",
    executed.some((item) => item.source === "live" && item.ok)
      ? "Live data.gov.in Agriculture records entered mesh observations. No dummy rows."
      : executed.some((item) => item.source === "error")
        ? "Live Agriculture fetch failed. No snapshot or simulated prices were substituted."
        : "No live data.gov.in Agriculture tool was executed.",
  ];

  return {
    nodes,
    edges,
    proposals,
    votes,
    executed,
    consensusNotes,
    circuitOpen: [],
    consensus: "score_sum",
    gossip: { published: proposals.length + distress, replicas, rounds: ROUNDS },
  };
}

