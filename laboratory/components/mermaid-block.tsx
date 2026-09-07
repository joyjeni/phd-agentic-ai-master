"use client";

import { useEffect, useId, useState } from "react";

export function MermaidBlock({ chart, title }: { chart: string; title?: string }) {
  const reactId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string>("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "dark",
          themeVariables: {
            background: "#0f1c2a",
            primaryColor: "#1f4d3a",
            primaryTextColor: "#f4efe4",
            primaryBorderColor: "#7dcea0",
            lineColor: "#c4a35a",
            secondaryColor: "#1b2a3d",
            tertiaryColor: "#3a2f1a",
            fontFamily: "Georgia, serif",
          },
        });
        const { svg: rendered } = await mermaid.render(`mmd-${reactId}`, chart);
        if (!cancelled) setSvg(rendered);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, reactId]);

  return (
    <figure className="overflow-x-auto rounded-md border border-[#5B9BD5]/60 bg-[#0f1c2a] p-3">
      {title ? (
        <figcaption className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[#c4a35a]">
          {title}
        </figcaption>
      ) : null}
      {svg && !failed ? (
        <div
          className="mermaid-svg mermaid-flow min-h-[12rem]"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-[#c9d4e0]">
          {chart}
        </pre>
      )}
    </figure>
  );
}
