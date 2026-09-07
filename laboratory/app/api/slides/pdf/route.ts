import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PDF_NAME = "JenishaT_ACRS_PhD_Proposal.pdf";

export async function GET() {
  const candidates = [
    join(process.cwd(), "public", PDF_NAME),
    join(process.cwd(), "docs/slides", PDF_NAME),
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
      "Content-Disposition": `inline; filename="${PDF_NAME}"`,
      "Cache-Control": "no-store",
      "Content-Length": String(buffer.length),
    },
  });
}
