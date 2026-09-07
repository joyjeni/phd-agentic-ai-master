export type ToolSource = "toolbench" | "datagov" | "karnataka";

export type ToolParameter = {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: string;
};

export type Tool = {
  id: string;
  name: string;
  apiName: string;
  description: string;
  toolDescription: string;
  category: string;
  collection: string;
  method: "GET" | "POST";
  endpoint?: string;
  resourceId?: string;
  parameters: ToolParameter[];
  seen: boolean;
  source: ToolSource;
  tags: string[];
  schemaSignature: string;
  endpointPattern: string;
  liveExecutable: boolean;
};

export type RankedTool = {
  tool: Tool;
  score: number;
  semantic: number;
  session: number;
  hierarchy: number;
  failPenalty: number;
  recency: number;
  cat: number;
  sch: number;
  ept: number;
  cooc: number;
  seenUnseen: "seen" | "unseen";
  reasons: string[];
};

export type SessionTurn = {
  turn: number;
  query: string;
  selectedToolIds: string[];
  failedToolIds: string[];
  observations: string[];
  answer: string;
};

export type ContextElement = {
  id: string;
  text: string;
  source: string;
  timestamp: number;
  accessCount: number;
  importance: number;
  pinned: boolean;
  feedback: number;
  kind:
    | "query"
    | "tool"
    | "observation"
    | "consensus"
    | "session"
    | "citation"
    | "answer";
  embedding: number[];
  tier?: "keep_verbatim" | "summarize" | "drop" | "persistent";
  summaryText?: string;
};

export type CoactivationEdges = Record<string, Record<string, number>>;

export type PeerStat = {
  success: number;
  latencyMs: number;
  weight: number;
};

export type SessionState = {
  id: string;
  email: string;
  sector: string;
  history: SessionTurn[];
  memory: ContextElement[];
  agentRewards: Record<string, number>;
  agentCounts: Record<string, number>;
  coactivation: CoactivationEdges;
  affinityW: number[][];
  epsilon: number;
  peerStats: Record<string, PeerStat>;
};

export type AgentId =
  | "agriculture_analyst"
  | "schema_planner"
  | "tool_executor"
  | "mesh_critic"
  | "retrieval_specialist";

export type AgentSpec = {
  id: AgentId;
  name: string;
  role: string;
  categories: string[];
  cost: number;
  latencyMs: number;
  terminal: boolean;
  embedding: number[];
};

export type RouteAssignment = {
  agent: AgentSpec;
  tools: RankedTool[];
  utility: number;
  exploration: number;
  preference: number;
  expectedReward: number;
  hop: number;
  probability: number;
  reasons: string[];
};

export type ProposedAction = {
  agentId: AgentId;
  toolId: string;
  arguments: Record<string, string>;
  confidence: number;
  rationale: string;
  ranking: Array<[string, number]>;
};

export type MeshVote = {
  toolId: string;
  weight: number;
  voters: AgentId[];
};

export type ToolCallResult = {
  toolId: string;
  ok: boolean;
  latencyMs: number;
  source: "live" | "catalog-only" | "error";
  arguments: Record<string, string>;
  payload: unknown;
  summary: string;
};

export type MncdResult = {
  nodes: AgentId[];
  edges: Array<{ from: AgentId; to: AgentId; weight: number }>;
  proposals: ProposedAction[];
  votes: MeshVote[];
  executed: ToolCallResult[];
  consensusNotes: string[];
  circuitOpen: AgentId[];
  consensus: "score_sum";
  gossip: {
    published: number;
    replicas: string[];
    rounds: number;
  };
};

export type FcnpStats = {
  original: number;
  retained: number;
  evicted: number;
  pinned: number;
  evictionRatio: number;
  avgRetained: number;
  avgEvicted: number;
  iterations: number;
  converged: boolean;
};

export type SatrResult = {
  query: string;
  ranked: RankedTool[];
  truncated: RankedTool[];
  intentDrift: number;
  queryMode: "single-tool" | "multi-tool";
  notes: string[];
  formula: string;
};

export type AprrResult = {
  assignments: RouteAssignment[];
  unassigned: RankedTool[];
  notes: string[];
  path: AgentId[];
  formula: string;
  W: number[][];
};

export type FcnpResult = {
  retained: ContextElement[];
  evicted: ContextElement[];
  stats: FcnpStats;
  notes: string[];
  formula: string;
};

export type PipelineRequest = {
  query: string;
  session?: SessionState;
  email?: string;
  sector?: string;
  topK?: number;
  apiKey?: string;
};

export type PipelineTrace = {
  requestId: string;
  query: string;
  satr: SatrResult;
  aprr: AprrResult;
  mncd: MncdResult;
  fcnp: FcnpResult;
  session: SessionState;
  answer: string;
  timingsMs: Record<string, number>;
  pipelineOk: boolean;
  liveOk: boolean;
  stages: Array<{
    id: "satr" | "aprr" | "mncd" | "fcnp";
    title: string;
    status: "ok" | "degraded" | "empty";
    summary: string;
  }>;
};
