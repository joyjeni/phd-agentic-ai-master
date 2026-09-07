import { NextResponse } from "next/server";
import { runPipeline, normalizeSector } from "@/lib/research/pipeline";
import type { SessionState } from "@/lib/research/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      query?: string;
      email?: string;
      sector?: string;
      session?: SessionState;
      topK?: number;
      apiKey?: string;
    };
    const origin = new URL(request.url).origin;
    const trace = await runPipeline(
      {
        query: (body.query ?? "").toString(),
        email: body.email,
        sector: normalizeSector(body.sector),
        session: body.session,
        topK: body.topK,
        apiKey: body.apiKey,
      },
      { mode: "http", origin },
    );
    return NextResponse.json(trace);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Pipeline failed" },
      { status: 500 },
    );
  }
}
