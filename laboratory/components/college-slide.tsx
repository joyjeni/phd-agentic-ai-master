import type { ReactNode } from "react";
import { COLLEGE } from "@/lib/research/college";

export function CollegeSlideFrame({
  section,
  index,
  total,
  children,
}: {
  section: string;
  index: number;
  total: number;
  children: ReactNode;
}) {
  return (
    <article className="college-slide overflow-hidden rounded-lg border border-[#c4a35a] bg-[#fffaf3] text-[#1a1214] shadow-lg print:rounded-none print:border print:border-[#7C1D2E] print:shadow-none">
      <header className="bg-[#7C1D2E] px-5 py-2.5">
        <p className="text-[10px] font-semibold tracking-[0.16em] text-white sm:text-[11px]">
          {COLLEGE.university.toUpperCase()}
        </p>
        <p className="text-[10px] text-[#e8c97a]">
          {COLLEGE.facultyHeader} · {COLLEGE.kicker}
        </p>
      </header>
      <div className="h-1 bg-[#c4a35a]" />
      <p className="px-5 pt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7C1D2E]">
        {COLLEGE.kicker} · {section}
      </p>
      <div className="px-5 pb-4 pt-1">{children}</div>
      <footer className="flex flex-wrap items-center justify-between gap-2 bg-[#7C1D2E] px-5 py-1.5 text-[10px] text-[#f4efe4]">
        <span>
          {COLLEGE.scholar} · {COLLEGE.registerNo} · {COLLEGE.mode} · Supervisor:{" "}
          {COLLEGE.supervisor}
        </span>
        <span className="text-[#e8c97a]">
          {index}/{total}
        </span>
      </footer>
    </article>
  );
}
