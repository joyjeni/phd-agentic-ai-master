import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PDF_FILENAME } from "@/lib/research/college";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const download = url.searchParams.get("download") === "1";
  const candidates = [
    join(process.cwd(), "public", PDF_FILENAME),
    join(process.cwd(), "docs/slides", PDF_FILENAME),
  ];
  const path = candidates.find((item) => existsSync(item));
  if (!path) {
    return new Response("PDF not built yet. Open /proposal/print and use Print.", {
      status: 404,
    });
  }
  const buffer = readFileSync(path);
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${PDF_FILENAME}"`,
      "Cache-Control": "no-store",
      "Content-Length": String(buffer.length),
      "X-Content-Type-Options": "nosniff",
    },
  });
}
