import { describe, expect, it } from "vitest";
import { APRR_CONFIG } from "@/lib/research/aprr";
import { FCNP_CONFIG } from "@/lib/research/fcnp";
import {
  APRR_FORMULA,
  FCNP_FORMULA,
  MNCD_FORMULA,
  SATR_FORMULA,
} from "@/lib/research/formulas";
import { SATR_WEIGHTS, satrRerank } from "@/lib/research/satr";
import { CONTENTS, SLIDES } from "@/lib/research/slides";
import {
  DATAGOV_MANDI,
  TOOLBENCH_G1_ROW,
  TOOLBENCH_SOIL,
  WALKTHROUGH_QUERIES,
} from "@/lib/research/walkthrough";

describe("implementation formulas", () => {
  it("exports the same SATR / APRR / FCNP constants the runtime uses", () => {
    expect(SATR_FORMULA.weights).toEqual(SATR_WEIGHTS);
    expect(SATR_FORMULA.weights.w_base).toBe(1);
    expect(SATR_FORMULA.weights.w_cat).toBe(0.45);
    expect(APRR_FORMULA.config).toEqual(APRR_CONFIG);
    expect(APRR_FORMULA.config.alpha).toBe(2);
    expect(APRR_FORMULA.config.gamma).toBe(2.5);
    expect(FCNP_FORMULA.config).toEqual(FCNP_CONFIG);
    expect(FCNP_FORMULA.config.mu).toBe(0.1);
    expect(MNCD_FORMULA.consensus).toMatch(/score-sum/);
  });
});

describe("walkthrough queries", () => {
  it("ranks the ToolBench-schema soil tool first on the soil query", () => {
    const result = satrRerank(WALKTHROUGH_QUERIES.soil);
    expect(result.truncated[0]?.tool.id).toBe(TOOLBENCH_SOIL.toolId);
    expect(result.truncated[0]?.tool.source).toBe("toolbench");
    expect(result.truncated[0]?.tool.liveExecutable).toBe(false);
    expect(result.truncated[0]?.score).toBeGreaterThan(4);
  });

  it("ranks live AGMARKNET in the SATR shortlist for the mandi query", () => {
    const result = satrRerank(WALKTHROUGH_QUERIES.mandi);
    const ids = result.truncated.map((item) => item.tool.id);
    expect(ids).toContain("datagov.mandi_prices");
    expect(ids.some((id) => id === "karnataka::agmarknet_ka" || id === "datagov.mandi_prices")).toBe(
      true,
    );
    expect(DATAGOV_MANDI.resourceId).toBe("9ef84268-d588-465a-a308-a864a43d0070");
  });

  it("keeps the bundled ToolBench G1 aircraft row as ranking-library context only", () => {
    expect(TOOLBENCH_G1_ROW.qid).toBe("6491");
    expect(WALKTHROUGH_QUERIES.aircraft).toMatch(/aircraft/);
    const result = satrRerank(WALKTHROUGH_QUERIES.aircraft);
    expect(result.truncated.some((item) => item.tool.id.includes("flight"))).toBe(false);
  });
});

describe("proposal slides", () => {
  it("includes implementation formulas and both walkthroughs in methodology", () => {
    for (const id of ["method-formulas", "method-walk-tb", "method-walk-ogd"]) {
      expect(SLIDES.some((slide) => slide.id === id)).toBe(true);
      expect(CONTENTS.some((item) => item.slideId === id)).toBe(true);
    }
    const blob = JSON.stringify(SLIDES);
    expect(blob).toMatch(/w_base/);
    expect(blob).toMatch(/tb\.agri\.soil_health/);
    expect(blob).toMatch(/9ef84268-d588-465a-a308-a864a43d0070/);
    expect(blob).not.toMatch(/NDCG@/);
  });
});
