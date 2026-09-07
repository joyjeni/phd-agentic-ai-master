import { NextResponse } from "next/server";
import { fetchMandiSnapshot, selectKarnatakaFirstWithFallback } from "@/lib/research/datagov";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state") ?? "";
  const commodity = url.searchParams.get("commodity") ?? "";
  try {
    const snapshot = await fetchMandiSnapshot({});
    const selected = selectKarnatakaFirstWithFallback(snapshot.records, {
      ...(state ? { state } : {}),
      ...(commodity ? { commodity } : {}),
    });
    return NextResponse.json({
      ok: true,
      live: true,
      scanned: snapshot.totalRecordsScanned,
      statesSeen: snapshot.statesSeen,
      fetchedAt: snapshot.fetchedAt,
      keySource: snapshot.keySource,
      notes: selected.notes,
      records: selected.records.slice(0, 20),
      citation: snapshot.sourceUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        live: false,
        error: error instanceof Error ? error.message : "Live fetch failed",
      },
      { status: 502 },
    );
  }
}
