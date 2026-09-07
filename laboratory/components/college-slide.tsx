import type { ReactNode } from "react";
import { COLLEGE, slideDate } from "@/lib/research/college";

export type CollegeSlideVariant = "title" | "student" | "content";

function SideBars() {
  return (
    <>
      <span className="pointer-events-none absolute inset-y-0 left-0 w-[7px] bg-[#5B9BD5]" />
      <span className="pointer-events-none absolute inset-y-0 right-0 w-[7px] bg-[#5B9BD5]" />
    </>
  );
}

function Logo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={COLLEGE.logoSrc}
      alt="Ramaiah University of Applied Sciences"
      className={className ?? "h-12 w-auto object-contain sm:h-14"}
    />
  );
}

function SlideFooter({ index, invert }: { index: number; invert?: boolean }) {
  return (
    <div className="mt-auto flex items-end justify-between px-5 pb-3 pt-2">
      <span className={`text-[11px] ${invert ? "text-white/80" : "text-[#9AA3AE]"}`}>
        {slideDate()}
      </span>
      <span className="flex h-7 min-w-7 items-center justify-center bg-[#3A1C64] px-2 text-[12px] font-semibold text-white">
        {index}
      </span>
    </div>
  );
}

export function CollegeSlideFrame({
  heading,
  variant = "content",
  index,
  total,
  children,
}: {
  heading: string;
  variant?: CollegeSlideVariant;
  index: number;
  total: number;
  children: ReactNode;
}) {
  if (variant === "title") {
    return (
      <article className="college-slide relative overflow-hidden rounded-lg border border-[#d5deea] bg-white text-[#1a1a1a] shadow-lg print:rounded-none print:shadow-none">
        <SideBars />
        <div className="relative grid gap-4 px-6 pt-5 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] sm:items-start">
          <div>
            <Logo className="h-14 w-auto object-contain sm:h-16" />
            <p className="mt-3 text-[10px] italic leading-snug text-[#3A1C64] sm:text-[11px]">
              {COLLEGE.legalEstablished}
            </p>
            <p className="mt-1 text-[11px] font-semibold text-[#1B1464]">{COLLEGE.legalUgc}</p>
            <p className="text-[11px] font-semibold text-[#1B1464]">{COLLEGE.campusAddress}</p>
            <p className="text-[11px] font-semibold text-[#1B1464]">{COLLEGE.office}</p>
          </div>
          <div className="overflow-hidden rounded-md border border-[#d5deea]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={COLLEGE.campusPhotoSrc}
              alt="Gnanagangothri Campus, Ramaiah University of Applied Sciences"
              className="h-36 w-full object-cover sm:h-44"
            />
          </div>
        </div>
        <div className="relative px-6 py-6 text-center sm:py-8">
          <p className="text-sm font-semibold tracking-wide text-[#3A1C64] sm:text-base">
            {COLLEGE.presentationType}
          </p>
          <h2 className="mt-3 font-sans text-2xl font-bold uppercase leading-tight text-[#1B1464] sm:text-3xl">
            {heading}
          </h2>
          <div className="relative z-10">{children}</div>
          <p className="mx-auto mt-6 inline-block border border-[#3A1C64] px-4 py-1 text-[11px] font-semibold tracking-[0.18em] text-[#3A1C64]">
            {COLLEGE.website}
          </p>
        </div>
        <SlideFooter index={index} />
        <span className="sr-only">
          Slide {index} of {total}
        </span>
      </article>
    );
  }

  return (
    <article className="college-slide relative overflow-visible rounded-lg border border-[#d5deea] bg-white text-[#1a1a1a] shadow-lg print:rounded-none print:shadow-none">
      <SideBars />
      <header className="relative flex items-start justify-between gap-4 px-6 pt-4">
        <div className="min-w-0 flex-1">
          {variant === "student" ? (
            <>
              <div className="mb-2 h-[3px] w-full bg-[#3A1C64]" />
              <p className="text-[10px] italic leading-snug text-[#3A1C64] sm:text-[11px]">
                {COLLEGE.legalEstablished}
              </p>
              <p className="mt-1 text-center text-[12px] font-bold text-[#1B1464]">
                {COLLEGE.legalUgc}
              </p>
              <p className="text-center text-[12px] font-bold text-[#1B1464]">{COLLEGE.office}</p>
            </>
          ) : (
            <>
              <h2 className="font-sans text-2xl font-bold leading-tight text-black sm:text-3xl">
                {heading}
              </h2>
              <div className="mt-2 h-[2px] w-40 bg-[#3A1C64] sm:w-56" />
            </>
          )}
        </div>
        <Logo />
      </header>
      <div className="relative px-6 pb-2 pt-3">{children}</div>
      <SlideFooter index={index} />
      <span className="sr-only">
        Slide {index} of {total}
      </span>
    </article>
  );
}
