import { describe, expect, it } from "vitest";
import { ALGORITHMS, INTEGRATION, TOOLBENCH_FLOW } from "./algorithms";
import { MOTIVATION, OVERALL_OBJECTIVE } from "./objectives";
import { CONTENTS, SLIDES } from "./slides";

describe("implemented algorithms and motivation", () => {
  it("states motivation and the overall objective without metric commitments", () => {
    const blob = `${MOTIVATION.paragraphs.join(" ")} ${OVERALL_OBJECTIVE.statement}`;
    expect(blob).not.toMatch(/NDCG/);
    expect(blob).not.toMatch(/\d+(\.\d+)?%/);
    expect(blob).toMatch(/architectural/);
    expect(OVERALL_OBJECTIVE.statement).toMatch(/SATR \(Session-Aware Tool Retrieval\)/);
    expect(OVERALL_OBJECTIVE.statement).toMatch(/live-pipeline integrity/);
  });

  it("gives formula, pseudocode, mermaid, and diagram logic for each objective", () => {
    expect(ALGORITHMS.map((algo) => algo.id)).toEqual(["satr", "aprr", "mncd", "fcnp"]);
    for (const algo of ALGORITHMS) {
      expect(algo.formula.length).toBeGreaterThan(10);
      expect(algo.pseudocode.length).toBeGreaterThan(8);
      expect(algo.mermaid).toMatch(/flowchart/);
      expect(algo.logic.length).toBeGreaterThan(2);
    }
    expect(ALGORITHMS[2].mermaid).toMatch(/score-sum/);
    expect(ALGORITHMS[2].pseudocode.join(" ")).toMatch(/not Borda/);
    expect(ALGORITHMS.map((algo) => `${algo.formula}\n${algo.mermaid}\n${algo.pseudocode.join("\n")}`).join("\n")).not.toMatch(/NDCG/);
    expect(ALGORITHMS.map((algo) => algo.pseudocode.join(" ")).join(" ")).not.toMatch(/SessionRerank\+/);
  });

  it("passes the ToolBench soil schema as ranking-only then a live gate", () => {
    expect(TOOLBENCH_FLOW.datum.toolId).toBe("tb.agri.soil_health");
    expect(TOOLBENCH_FLOW.honesty).toMatch(/never GET/);
    expect(TOOLBENCH_FLOW.stages.map((row) => row.id)).toEqual([
      "intake",
      "satr",
      "aprr",
      "mncd",
      "fcnp",
      "writeback",
    ]);
    expect(INTEGRATION.mermaid).toMatch(/O1 SATR/);
    expect(INTEGRATION.mermaid).not.toMatch(/NDCG/);
  });

  it("adds motivation and algorithm slides to the proposal deck", () => {
    expect(SLIDES.find((slide) => slide.id === "motivation")?.title).toBe("Motivation");
    expect(SLIDES.find((slide) => slide.id === "method-algorithms")?.diagram).toBe("e2e");
    expect(CONTENTS.some((item) => item.slideId === "motivation")).toBe(true);
    expect(CONTENTS.some((item) => item.slideId === "method-algorithms")).toBe(true);
    expect(JSON.stringify(SLIDES)).not.toMatch(/SessionRerank\+/);
  });
});
