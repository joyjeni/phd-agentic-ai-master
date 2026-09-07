type Box = {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string;
  tone?: "sota" | "new" | "io";
};

function Node({ box }: { box: Box }) {
  const fill =
    box.tone === "new" ? "#1f4d3a" : box.tone === "io" ? "#3a2f1a" : "#1b2a3d";
  const stroke =
    box.tone === "new" ? "#7dcea0" : box.tone === "io" ? "#c4a35a" : "#7f93ab";
  return (
    <g>
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        rx={10}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.6}
      />
      <text
        x={box.x + box.w / 2}
        y={box.y + 22}
        textAnchor="middle"
        fill="#f4efe4"
        fontSize={12}
        fontFamily="Georgia, serif"
      >
        {box.title}
      </text>
      {box.sub ? (
        <text
          x={box.x + box.w / 2}
          y={box.y + 40}
          textAnchor="middle"
          fill="#c9d4e0"
          fontSize={10}
          fontFamily="ui-sans-serif, system-ui"
        >
          {box.sub}
        </text>
      ) : null}
    </g>
  );
}

function Arrow({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="#c4a35a"
      strokeWidth={1.5}
      markerEnd="url(#arrow)"
    />
  );
}

function Defs() {
  return (
    <defs>
      <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#c4a35a" />
      </marker>
    </defs>
  );
}

export type DiagramKind =
  | "sota"
  | "proposed"
  | "e2e"
  | "satr"
  | "aprr"
  | "mncd"
  | "fcnp"
  | "integrated"
  | "compare-satr"
  | "compare-aprr"
  | "compare-mncd"
  | "compare-fcnp";

export function ArchitectureSvg({ variant }: { variant: DiagramKind }) {
  if (variant === "sota") {
    return (
      <svg viewBox="0 0 920 360" className="h-auto w-full">
        <Defs />
        <text x="20" y="22" fill="#c4a35a" fontSize="13" fontFamily="Georgia, serif">
          Figure 1. SOTA LLM-agent architecture (journal)
        </text>
        <text x="20" y="42" fill="#9aa8b8" fontSize="11">
          After Wang et al., Frontiers of Computer Science 18:186345 (2024), doi:10.1007/s11704-024-40231-1 — Profiling, Memory, Planning, Action.
        </text>
        <Node box={{ x: 20, y: 62, w: 200, h: 62, title: "Profiling", sub: "role / persona" }} />
        <Node box={{ x: 250, y: 62, w: 200, h: 62, title: "Memory", sub: "short- and long-term" }} />
        <Node box={{ x: 480, y: 62, w: 200, h: 62, title: "Planning", sub: "ReAct / DFSDT" }} />
        <Node box={{ x: 710, y: 62, w: 190, h: 62, title: "Action", sub: "tools / APIs", tone: "io" }} />
        <Arrow x1={220} y1={93} x2={248} y2={93} />
        <Arrow x1={450} y1={93} x2={478} y2={93} />
        <Arrow x1={680} y1={93} x2={708} y2={93} />
        <text x="20" y="156" fill="#c4a35a" fontSize="12" fontFamily="Georgia, serif">
          Tool-use instantiation (still SOTA, still turn-amnesic)
        </text>
        <text x="20" y="174" fill="#9aa8b8" fontSize="11">
          Qin et al., ToolLLM, ICLR 2024; Zheng et al., ToolRerank, LREC-COLING 2024. Query only — no session H, no write-back.
        </text>
        <Node box={{ x: 20, y: 192, w: 150, h: 56, title: "Query only", sub: "no session H", tone: "io" }} />
        <Node box={{ x: 190, y: 192, w: 160, h: 56, title: "SBERT retrieve", sub: "Qin ICLR 2024" }} />
        <Node box={{ x: 370, y: 192, w: 170, h: 56, title: "ToolRerank", sub: "Zheng 2024" }} />
        <Node box={{ x: 560, y: 192, w: 160, h: 56, title: "One LLM", sub: "DFSDT / ReAct" }} />
        <Node box={{ x: 740, y: 192, w: 160, h: 56, title: "Answer", sub: "open loop", tone: "io" }} />
        <Arrow x1={170} y1={220} x2={188} y2={220} />
        <Arrow x1={350} y1={220} x2={368} y2={220} />
        <Arrow x1={540} y1={220} x2={558} y2={220} />
        <Arrow x1={720} y1={220} x2={738} y2={220} />
        <text x="20" y="280" fill="#7f93ab" fontSize="11">
          What this figure does not contain: a co-activation cache, a specialist posterior, live data.gov.in, or write-back into retrieval.
        </text>
        <text x="20" y="300" fill="#7f93ab" fontSize="11">
          Citation. Wang L. et al. Front. Comput. Sci. 18, 186345 (2024). Redrawn for this proposal; not a scanned publisher PDF.
        </text>
        <text x="20" y="332" fill="#7f93ab" fontSize="11">
          Related SOTA surveys: He et al., ACM TOSEM 34(5) (2025); Guo et al., IJCAI-24, 8048–8057.
        </text>
      </svg>
    );
  }

  if (variant === "proposed" || variant === "e2e") {
    return (
      <svg viewBox="0 0 940 390" className="h-auto w-full">
        <Defs />
        <text x="20" y="22" fill="#7dcea0" fontSize="13" fontFamily="Georgia, serif">
          Figure 2. Proposed ACRS architecture (this work) — drawn, not copied
        </text>
        <text x="20" y="42" fill="#9ad4b3" fontSize="11">
          SATR = Session-Aware Tool Retrieval. Closed loop SATR → APRR → MNCD → FCNP → SATR. Live Indian OGD at MNCD.
        </text>
        <Node
          box={{
            x: 20,
            y: 48,
            w: 900,
            h: 48,
            title: "SATR — Session-Aware Tool Retrieval (O1)",
            sub: "q + H + M → ranked ToolBench-schema shortlist. Not a new LLM. Not live prices.",
            tone: "new",
          }}
        />
        <Node box={{ x: 20, y: 148, w: 150, h: 64, title: "q_t + M_{t-1}", sub: "session memory", tone: "io" }} />
        <Node box={{ x: 190, y: 148, w: 155, h: 64, title: "SATR", sub: "fused rank", tone: "new" }} />
        <Node box={{ x: 365, y: 148, w: 155, h: 64, title: "APRR", sub: "O2 specialist hops", tone: "new" }} />
        <Node box={{ x: 540, y: 148, w: 165, h: 64, title: "MNCD", sub: "O3 live data.gov.in", tone: "new" }} />
        <Node box={{ x: 725, y: 148, w: 155, h: 64, title: "FCNP", sub: "O4 prune + pin", tone: "new" }} />
        <Arrow x1={170} y1={180} x2={188} y2={180} />
        <Arrow x1={345} y1={180} x2={363} y2={180} />
        <Arrow x1={520} y1={180} x2={538} y2={180} />
        <Arrow x1={705} y1={180} x2={723} y2={180} />
        <path
          d="M802 148 C 802 124, 108 124, 108 148"
          fill="none"
          stroke="#7dcea0"
          strokeDasharray="5 4"
          strokeWidth={1.6}
        />
        <text x="292" y="122" fill="#9ad4b3" fontSize="11">
          M_t writes back into SATR at t+1
        </text>
        <Arrow x1={622} y1={212} x2={622} y2={228} />
        <Node
          box={{
            x: 20,
            y: 236,
            w: 280,
            h: 54,
            title: "Live data.gov.in",
            sub: "AGMARKNET UUID — MNCD only",
            tone: "io",
          }}
        />
        <Arrow x1={300} y1={263} x2={538} y2={212} />
        <Node
          box={{
            x: 320,
            y: 236,
            w: 280,
            h: 54,
            title: "Score-sum consensus",
            sub: "vote object = toolId",
            tone: "new",
          }}
        />
        <Node
          box={{
            x: 620,
            y: 236,
            w: 300,
            h: 54,
            title: "a_t + M_t",
            sub: "answer + pinned citations",
            tone: "io",
          }}
        />
        <text x="20" y="318" fill="#9ad4b3" fontSize="11">
          What SATR is. Session-Aware Tool Retrieval fuses semantic rank with a co-activation cache, then hands a shortlist to APRR.
        </text>
        <text x="20" y="338" fill="#9aa8b8" fontSize="11">
          What SATR is not. A foundation model, a crop-yield predictor, or a live price cache. Mandi rows enter at MNCD.
        </text>
        <text x="20" y="366" fill="#7f93ab" fontSize="11">
          Figure 2 is drawn for this proposal. Contrast with Figure 1 (Wang et al., FCS 2024). No NDCG is drawn.
        </text>
      </svg>
    );
  }

  if (variant === "integrated") {
    return (
      <svg viewBox="0 0 920 340" className="h-auto w-full">
        <Defs />
        <text x="20" y="24" fill="#c4a35a" fontSize="13" fontFamily="Georgia, serif">
          Integrated contrast — SOTA star/SOP/chat (top) vs ACRS four-objective loop (bottom)
        </text>
        <text x="20" y="48" fill="#7f93ab" fontSize="11">
          Novelty is the closed contract + live Indian OGD, not a claimed accuracy
        </text>
        <Node box={{ x: 20, y: 62, w: 150, h: 52, title: "Query", sub: "no M_t", tone: "io" }} />
        <Node box={{ x: 190, y: 62, w: 170, h: 52, title: "SBERT + ToolRerank", sub: "Qin; Zheng" }} />
        <Node box={{ x: 380, y: 62, w: 170, h: 52, title: "Controller LLM", sub: "AutoGen / MetaGPT" }} />
        <Node box={{ x: 570, y: 62, w: 150, h: 52, title: "Optional LLMLingua" }} />
        <Node box={{ x: 740, y: 62, w: 150, h: 52, title: "Answer", sub: "open loop", tone: "io" }} />
        <Arrow x1={170} y1={88} x2={188} y2={88} />
        <Arrow x1={360} y1={88} x2={378} y2={88} />
        <Arrow x1={550} y1={88} x2={568} y2={88} />
        <Arrow x1={720} y1={88} x2={738} y2={88} />

        <Node
          box={{ x: 20, y: 200, w: 130, h: 58, title: "q + M", sub: "session", tone: "io" }}
        />
        <Node box={{ x: 170, y: 200, w: 140, h: 58, title: "SATR", sub: "G1 session", tone: "new" }} />
        <Node box={{ x: 330, y: 200, w: 140, h: 58, title: "APRR", sub: "G2 agents", tone: "new" }} />
        <Node box={{ x: 490, y: 200, w: 150, h: 58, title: "MNCD", sub: "G3 live OGD", tone: "new" }} />
        <Node box={{ x: 660, y: 200, w: 140, h: 58, title: "FCNP", sub: "G4 write-back", tone: "new" }} />
        <Node box={{ x: 820, y: 200, w: 80, h: 58, title: "a_t", tone: "io" }} />
        <Arrow x1={150} y1={229} x2={168} y2={229} />
        <Arrow x1={310} y1={229} x2={328} y2={229} />
        <Arrow x1={470} y1={229} x2={488} y2={229} />
        <Arrow x1={640} y1={229} x2={658} y2={229} />
        <Arrow x1={800} y1={229} x2={818} y2={229} />
        <path
          d="M860 200 C 860 150, 80 150, 80 200"
          fill="none"
          stroke="#7dcea0"
          strokeDasharray="5 4"
          strokeWidth={1.5}
        />
        <text x="300" y="168" fill="#9ad4b3" fontSize="11">
          citations from data.gov.in become SATR priors
        </text>
        <text x="20" y="290" fill="#7f93ab" fontSize="11">
          Grey: published SOTA. Green: this proposal. No numerical targets are drawn.
        </text>
      </svg>
    );
  }

  if (variant === "satr" || variant === "compare-satr") {
    return (
      <svg viewBox="0 0 900 250" className="h-auto w-full">
        <Defs />
        <text x="20" y="22" fill="#c4a35a" fontSize="12" fontFamily="Georgia, serif">
          O1 comparison — SOTA retrieval vs SATR (no NDCG drawn)
        </text>
        <text x="20" y="42" fill="#7f93ab" fontSize="11">
          Top: Qin ToolLLM + Zheng ToolRerank (turn-amnesic). Bottom: session fusion + co-activation.
        </text>
        <Node box={{ x: 20, y: 58, w: 170, h: 50, title: "Query embedding" }} />
        <Node box={{ x: 210, y: 58, w: 180, h: 50, title: "SBERT top-k", sub: "ICLR 2024" }} />
        <Node box={{ x: 410, y: 58, w: 210, h: 50, title: "ToolRerank cut", sub: "LREC-COLING 2024" }} />
        <Node box={{ x: 640, y: 58, w: 180, h: 50, title: "Planner APIs", sub: "no H" }} />
        <Arrow x1={190} y1={83} x2={208} y2={83} />
        <Arrow x1={390} y1={83} x2={408} y2={83} />
        <Arrow x1={620} y1={83} x2={638} y2={83} />
        <Node
          box={{ x: 20, y: 150, w: 200, h: 58, title: "q + H + M_t", sub: "FCNP citations", tone: "io" }}
        />
        <Node
          box={{ x: 240, y: 150, w: 210, h: 58, title: "s=(1−λ)s_sem+λ s_sess", sub: "co-activation C[a,b]", tone: "new" }}
        />
        <Node
          box={{ x: 470, y: 150, w: 190, h: 58, title: "Hierarchy truncate", sub: "kept from Zheng", tone: "new" }}
        />
        <Node
          box={{ x: 680, y: 150, w: 190, h: 58, title: "Shortlist → APRR", tone: "io" }}
        />
        <Arrow x1={220} y1={179} x2={238} y2={179} />
        <Arrow x1={450} y1={179} x2={468} y2={179} />
        <Arrow x1={660} y1={179} x2={678} y2={179} />
      </svg>
    );
  }

  if (variant === "aprr" || variant === "compare-aprr") {
    return (
      <svg viewBox="0 0 900 250" className="h-auto w-full">
        <Defs />
        <text x="20" y="22" fill="#c4a35a" fontSize="12" fontFamily="Georgia, serif">
          O2 comparison — model/SOP routers vs APRR tool-specialist posterior
        </text>
        <text x="20" y="42" fill="#7f93ab" fontSize="11">
          Top: RouteLLM / PILOT / MasRouter / MetaGPT. Bottom: training-free Dirichlet–Thompson over agents.
        </text>
        <Node box={{ x: 20, y: 58, w: 200, h: 50, title: "Query encoder" }} />
        <Node box={{ x: 240, y: 58, w: 220, h: 50, title: "Trained F_θ / SOP", sub: "ACL 2025 / ICLR 2024" }} />
        <Node box={{ x: 480, y: 58, w: 190, h: 50, title: "Pick an LLM" }} />
        <Node box={{ x: 690, y: 58, w: 180, h: 50, title: "Call that model" }} />
        <Arrow x1={220} y1={83} x2={238} y2={83} />
        <Arrow x1={460} y1={83} x2={478} y2={83} />
        <Arrow x1={670} y1={83} x2={688} y2={83} />
        <Node
          box={{ x: 20, y: 150, w: 200, h: 58, title: "SATR shortlist S_t", tone: "io" }}
        />
        <Node
          box={{
            x: 240,
            y: 150,
            w: 250,
            h: 58,
            title: "Dirichlet × Thompson",
            sub: "agent, not model SKU",
            tone: "new",
          }}
        />
        <Node
          box={{ x: 510, y: 150, w: 200, h: 58, title: "Specialist path A_t", tone: "new" }}
        />
        <Node
          box={{ x: 730, y: 150, w: 140, h: 58, title: "→ MNCD", tone: "io" }}
        />
        <Arrow x1={220} y1={179} x2={238} y2={179} />
        <Arrow x1={490} y1={179} x2={508} y2={179} />
        <Arrow x1={710} y1={179} x2={728} y2={179} />
      </svg>
    );
  }

  if (variant === "mncd" || variant === "compare-mncd") {
    return (
      <svg viewBox="0 0 900 270" className="h-auto w-full">
        <Defs />
        <text x="20" y="22" fill="#c4a35a" fontSize="12" fontFamily="Georgia, serif">
          O3 comparison — star/chat SOTA vs mesh vote over live tool IDs
        </text>
        <text x="20" y="42" fill="#7f93ab" fontSize="11">
          Left: AutoGen / MetaGPT / ChatDev / CAMEL. Right: MNCD gossip + score-sum + data.gov.in.
        </text>
        <Node box={{ x: 160, y: 58, w: 150, h: 44, title: "Manager LLM" }} />
        <Node box={{ x: 20, y: 130, w: 110, h: 40, title: "Agent A" }} />
        <Node box={{ x: 150, y: 130, w: 110, h: 40, title: "Agent B" }} />
        <Node box={{ x: 280, y: 130, w: 110, h: 40, title: "Agent C" }} />
        <Arrow x1={200} y1={102} x2={80} y2={130} />
        <Arrow x1={235} y1={102} x2={205} y2={130} />
        <Arrow x1={270} y1={102} x2={320} y2={130} />
        <text x="20" y="196" fill="#7f93ab" fontSize="11">
          Vote object = natural-language message
        </text>
        <circle cx="620" cy="90" r="28" fill="#1f4d3a" stroke="#7dcea0" />
        <circle cx="760" cy="90" r="28" fill="#1f4d3a" stroke="#7dcea0" />
        <circle cx="620" cy="180" r="28" fill="#1f4d3a" stroke="#7dcea0" />
        <circle cx="760" cy="180" r="28" fill="#1f4d3a" stroke="#7dcea0" />
        <line x1="648" y1="90" x2="732" y2="90" stroke="#7dcea0" />
        <line x1="620" y1="118" x2="620" y2="152" stroke="#7dcea0" />
        <line x1="760" y1="118" x2="760" y2="152" stroke="#7dcea0" />
        <line x1="644" y1="168" x2="736" y2="112" stroke="#7dcea0" />
        <line x1="644" y1="102" x2="736" y2="168" stroke="#7dcea0" />
        <text x="560" y="48" fill="#7dcea0" fontSize="12" fontFamily="Georgia, serif">
          MNCD mesh
        </text>
        <text x="560" y="230" fill="#9ad4b3" fontSize="11">
          Vote object = toolId; execute live OGD UUID
        </text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 900 250" className="h-auto w-full">
      <Defs />
      <text x="20" y="22" fill="#c4a35a" fontSize="12" fontFamily="Georgia, serif">
        O4 comparison — token compressors vs FCNP write-back
      </text>
      <text x="20" y="42" fill="#7f93ab" fontSize="11">
        Top: Jiang LLMLingua (EMNLP 2023). Bottom: Kirchhoff/Physarum + citation pin into SATR.
      </text>
      <Node box={{ x: 20, y: 58, w: 190, h: 50, title: "Long prompt" }} />
      <Node box={{ x: 230, y: 58, w: 210, h: 50, title: "Token importance", sub: "LLMLingua" }} />
      <Node box={{ x: 460, y: 58, w: 190, h: 50, title: "Shorter prompt" }} />
      <Node box={{ x: 670, y: 58, w: 200, h: 50, title: "No retrieval write-back" }} />
      <Arrow x1={210} y1={83} x2={228} y2={83} />
      <Arrow x1={440} y1={83} x2={458} y2={83} />
      <Arrow x1={650} y1={83} x2={668} y2={83} />
      <Node
        box={{ x: 20, y: 150, w: 210, h: 58, title: "MNCD trace + live cites", tone: "io" }}
      />
      <Node
        box={{
          x: 250,
          y: 150,
          w: 230,
          h: 58,
          title: "Kirchhoff / Physarum D_ij",
          sub: "Tero et al., Science 2010",
          tone: "new",
        }}
      />
      <Node
        box={{ x: 500, y: 150, w: 180, h: 58, title: "Keep / pin citations", tone: "new" }}
      />
      <Node
        box={{ x: 700, y: 150, w: 170, h: 58, title: "M_t → SATR t+1", tone: "new" }}
      />
      <Arrow x1={230} y1={179} x2={248} y2={179} />
      <Arrow x1={480} y1={179} x2={498} y2={179} />
      <Arrow x1={680} y1={179} x2={698} y2={179} />
    </svg>
  );
}
