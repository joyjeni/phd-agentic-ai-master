import { afterEach, describe, expect, it, vi } from "vitest";
import { getCatalog } from "@/lib/research/catalog";
import { createSession, runPipeline } from "@/lib/research/pipeline";
import { satrRerank } from "@/lib/research/satr";
import { fcnpPrune } from "@/lib/research/fcnp";
import { hashedEmbedding } from "@/lib/research/math";
import { CONTENTS, SLIDES } from "@/lib/research/slides";
import { APRR_CONFIG } from "@/lib/research/aprr";
import { clearMandiCache } from "@/lib/research/datagov";
import type { ContextElement } from "@/lib/research/types";

/** Contract double of api.data.gov.in JSON. Used only by unit tests, never served as lab data. */
const LIVE_JSON = {
  total: 3,
  records: [
    {
      state: "Punjab",
      district: "Ludhiana",
      market: "Ludhiana",
      commodity: "Wheat",
      variety: "FAQ",
      grade: "FAQ",
      arrival_date: "07/09/2026",
      min_price: "2400",
      max_price: "2550",
      modal_price: "2480",
    },
    {
      state: "Punjab",
      district: "Amritsar",
      market: "Amritsar",
      commodity: "Wheat",
      variety: "FAQ",
      grade: "FAQ",
      arrival_date: "07/09/2026",
      min_price: "2380",
      max_price: "2510",
      modal_price: "2440",
    },
    {
      state: "Karnataka",
      district: "Bengaluru",
      market: "Yeshwanthpur",
      commodity: "Ragi",
      variety: "Local",
      grade: "FAQ",
      arrival_date: "07/09/2026",
      min_price: "3100",
      max_price: "3350",
      modal_price: "3225",
    },
  ],
};

function stubLiveMandi() {
  let pages = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (!url.includes("9ef84268-d588-465a-a308-a864a43d0070")) {
        return new Response("not found", { status: 404 });
      }
      pages += 1;
      if (pages > 1) {
        return new Response(JSON.stringify({ records: [], total: 3 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(LIVE_JSON), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  clearMandiCache();
});

describe("catalog", () => {
  it("ships an Agriculture-only catalog with live data.gov.in adapters", () => {
    const catalog = getCatalog();
    expect(catalog.length).toBeGreaterThan(20);
    expect(catalog.every((tool) => tool.category === "Agriculture")).toBe(true);
    expect(catalog.some((tool) => tool.id === "datagov.mandi_prices" && tool.liveExecutable)).toBe(true);
    expect(catalog.some((tool) => tool.id === "datagov.rainfall" && tool.liveExecutable)).toBe(true);
    expect(catalog.some((tool) => tool.id === "karnataka::agmarknet_ka")).toBe(true);
    expect(catalog.some((tool) => tool.category === "Entertainment")).toBe(false);
    expect(catalog.every((tool) => tool.schemaSignature && tool.endpointPattern)).toBe(true);
  });
});

describe("Agriculture routing", () => {
  it("prefers crop production for yield queries and mandi for price queries", async () => {
    const { preferredLiveToolId } = await import("@/lib/research/datagov");
    expect(preferredLiveToolId("Rice production in Karnataka kharif")).toBe("datagov.crop_production");
    expect(preferredLiveToolId("All-India monsoon rainfall series from IMD")).toBe("datagov.rainfall");
    expect(preferredLiveToolId("What is the current mandi price of tomato in Punjab?")).toBe(
      "datagov.mandi_prices",
    );
    expect(createSession("joyjeni@gmail.com", "Entertainment").sector).toBe("Agriculture");
  });
});

describe("SATR SessionRerank", () => {
  it("ranks agriculture / mandi APIs above distractors for a mandi query", () => {
    const result = satrRerank("What is the current mandi price of wheat in Punjab?");
    expect(result.truncated.length).toBeGreaterThan(0);
    expect(result.formula).toMatch(/w_base/);
    const top = result.truncated[0];
    expect(
      top.tool.liveExecutable ||
        top.tool.category === "Agriculture" ||
        top.tool.category === "market" ||
        top.tool.source === "datagov",
    ).toBe(true);
    expect(top.tool.id).not.toMatch(/movie|cricket|flight/);
  });

  it("applies a fail penalty on the next turn", () => {
    const session = createSession();
    session.history.push({
      turn: 1,
      query: "wheat prices",
      selectedToolIds: ["tb.agri.soil_health"],
      failedToolIds: ["tb.agri.soil_health"],
      observations: [],
      answer: "",
    });
    const baseline = satrRerank("wheat mandi price Punjab");
    const result = satrRerank("wheat mandi price Punjab", session);
    const soil = result.ranked.find((item) => item.tool.id === "tb.agri.soil_health");
    const baselineSoil = baseline.ranked.find((item) => item.tool.id === "tb.agri.soil_health");
    const mandi = result.ranked.find((item) => item.tool.id === "datagov.mandi_prices");
    expect(mandi).toBeTruthy();
    expect(soil).toBeTruthy();
    expect(soil?.failPenalty ?? 0).toBeGreaterThan(0);
    expect((soil?.score ?? 0) < (baselineSoil?.score ?? 0)).toBe(true);
    expect((mandi?.score ?? 0) > (soil?.score ?? 0)).toBe(true);
  });
});

describe("FCNP Kirchhoff", () => {
  it("never evicts pinned citations", () => {
    const elements: ContextElement[] = [
      {
        id: "cite",
        text: "citation:datagov.mandi_prices wheat Punjab modal 2480",
        source: "mncd",
        timestamp: 1,
        accessCount: 1,
        importance: 0.2,
        pinned: true,
        feedback: 1,
        kind: "citation",
        embedding: hashedEmbedding("citation mandi wheat punjab 2480"),
      },
      ...Array.from({ length: 12 }, (_, index) => ({
        id: `cold_${index}`,
        text: "unrelated chatter gossip noise",
        source: "noise",
        timestamp: 0,
        accessCount: 0,
        importance: 0.1,
        pinned: false,
        feedback: -0.2,
        kind: "consensus" as const,
        embedding: hashedEmbedding(`noise ${index} chatter`),
      })),
    ];
    const result = fcnpPrune(elements, 2, 0.7, "wheat mandi");
    expect(result.retained.some((element) => element.id === "cite")).toBe(true);
    expect(result.evicted.some((element) => element.id === "cite")).toBe(false);
    expect(result.stats.iterations).toBeGreaterThan(0);
  });
});

describe("end-to-end pipeline", () => {
  it("closes all four arrows on live-shaped AGMARKNET JSON", async () => {
    stubLiveMandi();
    const first = await runPipeline({
      query: "What is the current mandi price of wheat in Punjab?",
      email: "joyjeni@gmail.com",
      sector: "Agriculture",
      apiKey: "test-key",
    });
    expect(first.pipelineOk).toBe(true);
    expect(first.liveOk).toBe(true);
    expect(first.satr.truncated.length).toBeGreaterThan(0);
    expect(first.aprr.assignments.length).toBeGreaterThan(0);
    expect(first.aprr.path.length).toBeGreaterThan(1);
    expect(first.mncd.consensus).toBe("score_sum");
    expect(first.mncd.executed.some((item) => item.source === "live" && item.ok)).toBe(true);
    expect(first.fcnp.retained.length).toBeGreaterThan(0);
    expect(first.answer).toMatch(/2480|2440|Rs /);
    expect(first.answer).not.toMatch(/invent|simulat/i);

    const second = await runPipeline({
      query: "Now compare that with other wheat mandi rows from the same live feed.",
      session: first.session,
      email: "joyjeni@gmail.com",
      sector: "Agriculture",
      apiKey: "test-key",
    });
    expect(second.pipelineOk).toBe(true);
    expect(second.session.history.length).toBe(2);
    expect(second.session.memory.length).toBeGreaterThan(0);
    expect(second.satr.notes.join(" ")).toMatch(/memory|Session prior|Co-activation/i);
  });

  it("reads live-shaped AGMARKNET rows with the portal visualization key when no personal key is set", async () => {
    stubLiveMandi();
    const trace = await runPipeline({
      query: "What is the current mandi price of wheat in Punjab?",
      email: "joyjeni@gmail.com",
      sector: "Agriculture",
    });
    expect(trace.pipelineOk).toBe(true);
    expect(trace.liveOk).toBe(true);
    const called = String(vi.mocked(fetch).mock.calls[0]?.[0] ?? "");
    expect(called).toMatch(/9ef84268-d588-465a-a308-a864a43d0070/);
    expect(called).toMatch(/api-key=/);
    expect(trace.answer).toMatch(/2480|2440|Rs /);
    expect(trace.answer).not.toMatch(/invent|simulat|dummy/i);
  });

  it("degrades cleanly on an empty query without throwing", async () => {
    const trace = await runPipeline({ query: "" });
    expect(trace.pipelineOk).toBe(false);
    expect(
      trace.stages.every(
        (stage) => stage.status === "empty" || stage.status === "degraded" || stage.status === "ok",
      ),
    ).toBe(true);
  });
});

describe("commodity slot", () => {
  it("does not treat the word price as rice", async () => {
    const { extractToolArguments } = await import("@/lib/research/datagov");
    const { getTool } = await import("@/lib/research/catalog");
    const tool = getTool("datagov.mandi_prices");
    expect(tool).toBeTruthy();
    const args = extractToolArguments(
      "What is the current mandi price of tomato in Punjab?",
      tool!,
    );
    expect(args.commodity).toBe("Tomato");
    expect(args.state).toBe("Punjab");
  });

  it("does not inject Wheat or Punjab when the query names neither", async () => {
    const { extractToolArguments } = await import("@/lib/research/datagov");
    const { getTool } = await import("@/lib/research/catalog");
    const tool = getTool("datagov.mandi_prices");
    const args = extractToolArguments("What arrivals are on the live AGMARKNET feed today?", tool!);
    expect(args.commodity).toBeUndefined();
    expect(args.state).toBeUndefined();
  });
});

describe("APRR config", () => {
  it("matches the GitHub RouterConfig exponents", () => {
    expect(APRR_CONFIG.alpha).toBe(2);
    expect(APRR_CONFIG.gamma).toBe(2.5);
    expect(APRR_CONFIG.kappa).toBe(5);
  });
});

describe("open datasets survey", () => {
  it("only marks data.gov.in resources as live tools when they have a UUID", async () => {
    const { SURVEYED_DATASETS } = await import("@/lib/research/open-datasets");
    const live = SURVEYED_DATASETS.filter((item) => item.role === "live-tool");
    expect(live.length).toBeGreaterThan(3);
    expect(live.every((item) => item.wired && Boolean(item.resourceId))).toBe(true);
    expect(SURVEYED_DATASETS.some((item) => item.id === "stabletoolbench" && item.role === "do-not-use")).toBe(
      true,
    );
  });
});

describe("slides", () => {
  it("covers the required proposal outline and per-objective methodology", async () => {
    const { REQUIRED_SECTION_TITLES } = await import("@/lib/research/slides");
    for (const item of CONTENTS) {
      const slide = SLIDES.find((entry) => entry.id === item.slideId);
      expect(slide).toBeTruthy();
    }
    const titles = SLIDES.map((slide) => slide.title);
    for (const heading of REQUIRED_SECTION_TITLES) {
      expect(titles.some((title) => title === heading || title.startsWith(`${heading} —`))).toBe(
        true,
      );
    }
    expect(SLIDES.filter((slide) => slide.section === "Research Methodology").length).toBeGreaterThanOrEqual(
      5,
    );
    expect(SLIDES.some((slide) => slide.id === "method-satr")).toBe(true);
    expect(SLIDES.some((slide) => slide.id === "method-aprr")).toBe(true);
    expect(SLIDES.some((slide) => slide.id === "method-mncd")).toBe(true);
    expect(SLIDES.some((slide) => slide.id === "method-fcnp")).toBe(true);
    expect(SLIDES.some((slide) => slide.id === "method-integrated")).toBe(true);
    expect(SLIDES[0]?.title).toMatch(/Adaptive Context Reasoning System/);
  });

  it("does not commit NDCG, latency, or accuracy targets", () => {
    const blob = JSON.stringify(SLIDES);
    expect(blob).not.toMatch(/NDCG@/);
    expect(blob).not.toMatch(/\+14\.7%/);
    expect(blob).not.toMatch(/23\.8%/);
    expect(blob).not.toMatch(/97\.0%/);
    expect(blob).not.toMatch(/O\(log N\) proof/i);
  });

  it("names Jenisha T and the MSRUAS register number on the title slide", async () => {
    const { COLLEGE } = await import("@/lib/research/college");
    expect(SLIDES[0]?.bullets?.join(" ")).toMatch(/Presented By/);
    expect(SLIDES[0]?.bullets?.join(" ")).toMatch(COLLEGE.scholar);
    expect(SLIDES[0]?.bullets?.join(" ")).toMatch(COLLEGE.registerNo);
    expect(SLIDES[1]?.table?.headers).toEqual(["Attribute", "Details"]);
    expect(SLIDES[1]?.table?.rows).toEqual(
      expect.arrayContaining([
        ["Full Name", COLLEGE.scholar],
        ["Registration Number", COLLEGE.registerNo],
        ["Email Address", COLLEGE.email],
        ["Research Topic", COLLEGE.researchTopic],
        ["Supervisor", COLLEGE.supervisor],
        ["Course Type", "Part Time"],
      ]),
    );
  });
});

describe("college pptx", () => {
  it("builds a ZIP PowerPoint of the proposal deck", async () => {
    const { buildProposalPptx } = await import("@/lib/research/pptx");
    const { PPTX_FILENAME } = await import("@/lib/research/college");
    const buffer = await buildProposalPptx();
    expect(PPTX_FILENAME).toMatch(/JenishaT_24ETRP720001\.pptx$/);
    expect(buffer.subarray(0, 2).toString()).toBe("PK");
    expect(buffer.length).toBeGreaterThan(8000);
  });

  it("embeds PowerPoint auto date and slide-number fields in the PRP copy", async () => {
    const { existsSync } = await import("node:fs");
    const { execFileSync } = await import("node:child_process");
    const { join } = await import("node:path");
    const path = join(process.cwd(), "public", "ACRS_PhD_Proposal_JenishaT_24ETRP720001.pptx");
    if (!existsSync(path)) return;
    const slide1 = execFileSync("unzip", ["-p", path, "ppt/slides/slide1.xml"], {
      encoding: "utf8",
    });
    expect(slide1).toMatch(/datetime3/);
    expect(slide1).toMatch(/slidenum/);
    expect(slide1).toMatch(/<p:hf[^>]*sldNum="1"/);
  });
});

describe("data.gov.in robustness", () => {
  it("rejects non-UUID resource ids", async () => {
    const { assertResourceId } = await import("@/lib/research/datagov");
    expect(() => assertResourceId("not-a-uuid")).toThrow(/non-UUID/);
    expect(assertResourceId("9ef84268-d588-465a-a308-a864a43d0070")).toBe(
      "9ef84268-d588-465a-a308-a864a43d0070",
    );
  });

  it("retries HTTP 500 then succeeds without inventing rows", async () => {
    const { fetchWithRetry } = await import("@/lib/research/datagov");
    let calls = 0;
    const fetchImpl = vi.fn(async () => {
      calls += 1;
      if (calls < 3) return new Response("busy", { status: 500 });
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    const response = await fetchWithRetry(fetchImpl as unknown as typeof fetch, "https://example.test", {
      cache: "no-store",
    }, 4, [0, 0, 0, 0]);
    expect(response.ok).toBe(true);
    expect(calls).toBe(3);
  });
});
