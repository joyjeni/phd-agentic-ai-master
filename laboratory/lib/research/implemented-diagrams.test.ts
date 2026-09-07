import { describe, expect, it } from "vitest";
import { ALGORITHMS, INTEGRATION } from "./algorithms";
import {
  GITHUB_DIAGRAM_FILES,
  JOURNAL_FIGURES,
} from "./implemented-diagrams";

const FORBIDDEN_IN_MERMAID = [
  /NDCG/,
  /SessionRerank\+/,
  /\bCDR\b/,
  /\bPDR\b/,
  /Gemma/,
  /IndicTrans/,
  /Hit@5/,
];

describe("journal mermaid redraws of GitHub diagrams/", () => {
  it("covers every archived PNG and GIF in diagrams/", () => {
    const archived = new Set(JOURNAL_FIGURES.map((fig) => fig.archived.replace("diagrams/", "")));
    for (const file of GITHUB_DIAGRAM_FILES) {
      expect(archived.has(file), file).toBe(true);
    }
  });

  it("draws the implemented modules, not the matplotlib claims", () => {
    const blob = JOURNAL_FIGURES.map((fig) => fig.mermaid).join("\n");
    expect(blob).toMatch(/satrRerank|SATR score/);
    expect(blob).toMatch(/aprrRoute|agriculture_analyst/);
    expect(blob).toMatch(/score-sum/);
    expect(blob).toMatch(/fcnpPrune|buildTraceContext/);
    expect(blob).toMatch(/data\.gov\.in/);
    for (const fig of JOURNAL_FIGURES) {
      for (const pattern of FORBIDDEN_IN_MERMAID) {
        expect(fig.mermaid).not.toMatch(pattern);
      }
      expect(fig.caption).toMatch(/Figure /);
      expect(fig.caption).toMatch(/not this figure|laboratory contract/);
    }
  });

  it("keeps algorithm-page mermaid in lock-step with the journal redraws", () => {
    expect(ALGORITHMS[0].mermaid).toBe(JOURNAL_FIGURES.find((fig) => fig.id === "satr-algorithm")?.mermaid);
    expect(ALGORITHMS[1].mermaid).toBe(JOURNAL_FIGURES.find((fig) => fig.id === "aprr-algorithm")?.mermaid);
    expect(ALGORITHMS[2].mermaid).toBe(JOURNAL_FIGURES.find((fig) => fig.id === "mncd-algorithm")?.mermaid);
    expect(ALGORITHMS[2].mermaid).toMatch(/score-sum/);
    expect(ALGORITHMS[3].mermaid).toBe(JOURNAL_FIGURES.find((fig) => fig.id === "fcnp-algorithm")?.mermaid);
    expect(INTEGRATION.mermaid).toBe(JOURNAL_FIGURES.find((fig) => fig.id === "overall-architecture")?.mermaid);
  });
});
