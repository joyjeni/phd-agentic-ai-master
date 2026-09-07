"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Lab" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/objectives", label: "Objectives" },
  { href: "/architecture", label: "Architecture" },
  { href: "/proposal", label: "Proposal slides" },
  { href: "/datasets", label: "Datasets" },
  { href: "/kaggle", label: "Kaggle" },
  { href: "/publication", label: "Publication" },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--ink)]/90 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-lg tracking-tight text-[var(--paper)]">
            ACRS
          </span>
          <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]">
            Ph.D. proposal laboratory
          </span>
        </Link>
        <nav className="flex flex-wrap gap-1">
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs font-medium",
                  active
                    ? "bg-[var(--gold)] text-[var(--ink)]"
                    : "text-[var(--muted)] hover:text-[var(--paper)]",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/download"
            className="rounded-md bg-[var(--gold)] px-2.5 py-1.5 text-xs font-semibold text-[var(--ink)]"
          >
            Slides PDF
          </Link>
        </nav>
      </div>
    </header>
  );
}
