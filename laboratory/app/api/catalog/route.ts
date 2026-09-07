import { NextResponse } from "next/server";
import { CATALOG_STATS, getCatalog } from "@/lib/research/catalog";
import { pipelineContract } from "@/lib/research/pipeline";
import { OBJECTIVES, OVERALL_OBJECTIVE } from "@/lib/research/objectives";

export function GET() {
  return NextResponse.json({
    contract: pipelineContract(),
    catalog: {
      ...CATALOG_STATS,
      tools: getCatalog().map((tool) => ({
        id: tool.id,
        name: tool.name,
        category: tool.category,
        source: tool.source,
        collection: tool.collection,
      })),
    },
    overall: OVERALL_OBJECTIVE,
    objectives: OBJECTIVES,
  });
}
