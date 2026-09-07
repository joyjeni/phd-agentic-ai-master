import { buildProposalPptx, readBuiltPptx } from "@/lib/research/pptx";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function savePageHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Save ACRS slides — Jenisha T</title>
  <style>
    body { margin:0; font-family: Georgia, serif; background:#0e1724; color:#f4efe4; }
    main { max-width: 52rem; margin: 0 auto; padding: 1.5rem; }
    a.btn { display:inline-block; margin: .4rem .4rem 0 0; padding:.75rem 1.25rem;
      background:#c4a35a; color:#1a1214; font-weight:700; text-decoration:none; border-radius:.4rem; }
    a.alt { background:transparent; color:#c4a35a; border:1px solid #c4a35a; }
    .note { color:#9aa8b8; font-size:.95rem; line-height:1.45; }
    iframe { width:100%; height:min(70vh,48rem); border:1px solid #c4a35a; background:#fffaf3; }
  </style>
</head>
<body>
  <main>
    <p class="note">M. S. Ramaiah University of Applied Sciences · FET · Jenisha T · 24ETRP720001</p>
    <h1>The in-chat preview cannot save a PowerPoint file</h1>
    <p class="note">That is why Download did nothing. The slides are on this page as a PDF. To get a <code>.pptx</code> onto your computer, use the files attached to this agent chat, or click <strong>Create repo</strong> and download from the repository in a normal browser tab.</p>
    <p>
      <a class="btn" href="/api/slides/pdf">Open PDF</a>
      <a class="btn alt" href="/proposal">Flip through slides</a>
      <a class="btn alt" href="/api/slides/pptx?raw=1">Try .pptx again (real browser tab)</a>
    </p>
    <p class="note">PDF preview:</p>
    <iframe title="Proposal PDF" src="/api/slides/pdf"></iframe>
  </main>
</body>
</html>`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const accept = request.headers.get("accept") ?? "";
  const forceFile =
    url.searchParams.get("raw") === "1" ||
    url.searchParams.get("download") === "1";

  if (!forceFile && accept.includes("text/html")) {
    return new Response(savePageHtml(), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const built = readBuiltPptx();
  const buffer = built ?? (await buildProposalPptx());
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename="JenishaT_ACRS_PhD_Proposal.pptx"`,
      "Cache-Control": "no-store",
      "Content-Length": String(buffer.length),
      "X-Content-Type-Options": "nosniff",
    },
  });
}
