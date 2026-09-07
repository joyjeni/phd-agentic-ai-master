import { NextResponse } from "next/server";
import { runSatrService } from "@/lib/research/pipeline";
import type { SessionState } from "@/lib/research/types";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    service: "satr",
    repo: "session-aware-toolbench-rerank",
    formula: "s(a|q,H)=w_base s_base + w_cat cat + w_sch sch + w_ept ept + w_cooc φ + w_rec rec",
    ok: true,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      query?: string;
      session?: SessionState;
      topK?: number;
    };
    const result = await runSatrService({
      query: (body.query ?? "").toString(),
      session: body.session,
      topK: body.topK,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "SATR failed" },
      { status: 500 },
    );
  }
}
