import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ZIP_FILENAME } from "@/lib/research/college";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const candidates = [
    join(process.cwd(), "public", ZIP_FILENAME),
    join(process.cwd(), "docs/slides", ZIP_FILENAME),
  ];
  const path = candidates.find((item) => existsSync(item));
  if (!path) {
    return new Response("ZIP not built yet. Run npm run slides.", { status: 404 });
  }
  const buffer = readFileSync(path);
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${ZIP_FILENAME}"`,
      "Cache-Control": "no-store",
      "Content-Length": String(buffer.length),
      "X-Content-Type-Options": "nosniff",
    },
  });
}
