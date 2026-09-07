"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DownloadSlides } from "@/components/download-slides";

export function PrintActions() {
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("print") === "1") {
      const timer = window.setTimeout(() => window.print(), 400);
      return () => window.clearTimeout(timer);
    }
  }, [params]);

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button size="sm" onClick={() => window.print()}>
        Print / Save PDF
      </Button>
      <DownloadSlides />
    </div>
  );
}
