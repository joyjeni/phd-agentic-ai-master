import { PPTX_FILENAME } from "@/lib/research/college";
import { buildProposalPptx, readBuiltPptx } from "@/lib/research/pptx";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const built = readBuiltPptx();
  const buffer = built ?? (await buildProposalPptx());
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename="${PPTX_FILENAME}"`,
      "Cache-Control": "no-store",
      "Content-Length": String(buffer.length),
      "X-Content-Type-Options": "nosniff",
    },
  });
}
