import { MD_FILENAME } from "@/lib/research/college";
import { allSlidesMarkdown } from "@/lib/research/slides";

export const dynamic = "force-dynamic";

export function GET() {
  const body = allSlidesMarkdown();
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${MD_FILENAME}"`,
      "Cache-Control": "no-store",
    },
  });
}
