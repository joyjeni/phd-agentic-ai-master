import { NextResponse } from "next/server";
import { runFcnpService } from "@/lib/research/pipeline";
import type { MncdResult, SessionState } from "@/lib/research/types";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    service: "fcnp",
    repo: "fcnp-context-pruning",
    formula: "D_ij(t+1)=(1-μ)D_ij + α|Q_ij|^γ",
    ok: true,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      query?: string;
      mncd?: MncdResult;
      session?: SessionState;
      turnIndex?: number;
    };
    if (!body.mncd) {
      return NextResponse.json({ error: "mncd result is required" }, { status: 400 });
    }
    const result = await runFcnpService({
      query: (body.query ?? "").toString(),
      mncd: body.mncd,
      session: body.session,
      turnIndex: body.turnIndex ?? 1,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "FCNP failed" },
      { status: 500 },
    );
  }
}
