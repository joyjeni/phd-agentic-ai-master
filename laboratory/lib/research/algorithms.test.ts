import { describe, expect, it } from "vitest";
import { ALGORITHMS, INTEGRATION, TOOLBENCH_FLOW } from "./algorithms";
import { MOTIVATION, NON_CLAIMS, OBJECTIVES, OVERALL_OBJECTIVE } from "./objectives";
import { CONTENTS, SLIDES } from "./slides";

describe("implemented algorithms and motivation", () => {
  it("states motivation and the overall objective without metric commitments", () => {
    const blob = `${MOTIVATION.paragraphs.join(" ")} ${OVERALL_OBJECTIVE.statement} ${NON_CLAIMS.statement}`;
    expect(blob).not.toMatch(/NDCG/);
    expect(blob).not.toMatch(/\d+(\.\d+)?%/);
    expect(blob).toMatch(/architectural/);
    expect(OVERALL_OBJECTIVE.statement).toMatch(/SATR \(Session-Aware Tool Retrieval\)/);
    expect(OVERALL_OBJECTIVE.statement).toMatch(/live-pipeline integrity/);
  });

  it("states four individual design objectives without computational scores", () => {
    expect(OBJECTIVES.map((item) => item.code)).toEqual(["O1", "O2", "O3", "O4"]);
    const blob = OBJECTIVES.map(
      (item) => `${item.objective} ${item.journalDefinition} ${item.outputs} ${item.methodology.join(" ")}`,
    ).join("\n");
    expect(blob).not.toMatch(/NDCG/);
    expect(blob).not.toMatch(/Pareto/);
    expect(blob).not.toMatch(/win-rate/);
    expect(blob).not.toMatch(/latency target/i);
    expect(blob).not.toMatch(/token-percentage/);
    expect(blob).not.toMatch(/\d+(\.\d+)?%/);
    expect(OBJECTIVES[0].objective).toMatch(/^To design SATR/);
    expect(OBJECTIVES[1].objective).toMatch(/^To design APRR/);
    expect(OBJECTIVES[2].objective).toMatch(/^To design MNCD/);
    expect(OBJECTIVES[3].objective).toMatch(/^To design FCNP/);
    expect(OBJECTIVES[1].objective).toMatch(/agriculture_analyst/);
    expect(OBJECTIVES[2].objective).toMatch(/score-sum/);
    expect(OBJECTIVES[3].objective).toMatch(/written back/);
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
    expect(CONTENTS.map((item) => item.title)).toEqual([
      "Introduction",
      "Literature Review",
      "Summary of Literature Review",
      "To Solve the Research Gap",
      "Identified Research Problem",
      "Research Title & Aim",
      "Research Objectives",
      "Research Questions",
      "Research Methodology",
      "Conclusion",
      "References",
    ]);
    expect(CONTENTS.every((item) => /^\d{2}$/.test(item.n))).toBe(true);
    expect(JSON.stringify(SLIDES)).not.toMatch(/SessionRerank\+/);
  });

  it("places RESEARCH_OBJECTIVES.md in story flow on the slides", () => {
    const ids = SLIDES.map((slide) => slide.id);
    const motivation = ids.indexOf("motivation");
    const overall = ids.indexOf("overall-objective");
    const table = ids.indexOf("objectives");
    const o1 = ids.indexOf("o1-satr");
    const o4 = ids.indexOf("o4-fcnp");
    const nonclaim = ids.indexOf("objectives-nonclaim");
    const questions = ids.indexOf("questions");
    expect(motivation).toBeGreaterThan(-1);
    expect(motivation).toBeLessThan(overall);
    expect(overall).toBeLessThan(table);
    expect(table).toBeLessThan(o1);
    expect(o1).toBeLessThan(o4);
    expect(o4).toBeLessThan(nonclaim);
    expect(nonclaim).toBeLessThan(questions);
    expect(SLIDES.find((slide) => slide.id === "overall-objective")?.body).toBe(OVERALL_OBJECTIVE.statement);
    expect(SLIDES.find((slide) => slide.id === "o1-satr")?.body).toBe(OBJECTIVES[0].objective);
    expect(SLIDES.find((slide) => slide.id === "objectives-nonclaim")?.body).toBe(NON_CLAIMS.statement);
    expect(CONTENTS.find((item) => item.title === "Research Objectives")?.slideId).toBe(
      "overall-objective",
    );
    expect(CONTENTS.find((item) => item.title === "References")?.slideId).toBe("refs-1");
  });
});
