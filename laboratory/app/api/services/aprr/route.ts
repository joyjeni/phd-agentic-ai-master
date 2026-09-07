import { NextResponse } from "next/server";
import { runAprrService } from "@/lib/research/pipeline";
import type { SatrResult, SessionState } from "@/lib/research/types";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    service: "aprr",
    repo: "aprr-multi-agent-routing",
    formula: "P(a_j|a_i,q) ∝ W_ij^α · η_ij^β · ψ_j(q)^γ",
    ok: true,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      query?: string;
      satr?: SatrResult;
      session?: SessionState;
    };
    if (!body.satr) {
      return NextResponse.json({ error: "satr result is required" }, { status: 400 });
    }
    const result = await runAprrService({
      query: (body.query ?? "").toString(),
      satr: body.satr,
      session: body.session,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "APRR failed" },
      { status: 500 },
    );
  }
}
