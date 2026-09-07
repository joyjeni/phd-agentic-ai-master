import { NextResponse } from "next/server";
import { runMncdService } from "@/lib/research/pipeline";
import type { AprrResult, SessionState } from "@/lib/research/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  return NextResponse.json({
    service: "mncd",
    repo: "mncd-mesh-agents",
    formula: "score-sum consensus over gossiped rank.update; R=3 replicate",
    ok: true,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      query?: string;
      aprr?: AprrResult;
      session?: SessionState;
      apiKey?: string;
    };
    if (!body.aprr) {
      return NextResponse.json({ error: "aprr result is required" }, { status: 400 });
    }
    const result = await runMncdService({
      query: (body.query ?? "").toString(),
      aprr: body.aprr,
      session: body.session,
      apiKey: body.apiKey,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "MNCD failed" },
      { status: 500 },
    );
  }
}
