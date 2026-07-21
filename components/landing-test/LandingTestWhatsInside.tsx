import Link from "next/link";
import {
  RiArrowRightLine,
  RiArrowUpLine,
  RiContrast2Line,
  RiErrorWarningLine,
  RiSearchLine,
} from "@remixicon/react";

import { DEMO_REPORT_PATH } from "@/lib/demo-report";

import {
  LANDING_CONTAINER,
  LANDING_LEAD,
  LANDING_SECTION,
  LANDING_SURFACE_BG,
} from "./landingPageStyles";

/** Brand indigo — matches How it works / landing accent */
const INDIGO_BG = "bg-indigo-400/15";
const INDIGO_TEXT = "text-indigo-300";

/** Amber — score & problem states only (matches report at-risk tone) */
const AMBER_BG = "rgba(232,168,73,0.12)";

const TILE_SUBTITLE =
  "mt-2 max-w-[380px] text-[14px] leading-[22px] text-white/50 md:text-[15px] md:leading-[24px]";

/** Outer bento tile — raised, same family as How it works visuals */
const TILE_SHELL = [
  "relative flex flex-col overflow-hidden rounded-[20px]",
  "border border-white/[0.08]",
  LANDING_SURFACE_BG,
  "p-6 shadow-[0_8px_32px_rgba(0,0,0,0.14)] md:p-7",
].join(" ");

/** Inner UI mockup frame — matches LandingStepVisuals */
const UI_FRAME = [
  "overflow-hidden rounded-[12px] border border-white/[0.08]",
  LANDING_SURFACE_BG,
  "shadow-[0_8px_32px_rgba(0,0,0,0.14)]",
].join(" ");

const SAMPLE_BUTTON =
  "inline-flex h-[50px] items-center justify-center gap-2 rounded-full border border-white/[0.12] bg-transparent px-7 text-[15px] font-semibold text-white transition-colors hover:border-white/25 hover:bg-white/[0.04]";

function TileHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="relative z-10">
      <h3 className="text-[19px] font-semibold leading-[1.2] tracking-[-0.02em] text-white">
        {title}
      </h3>
      <p className={TILE_SUBTITLE}>{subtitle}</p>
    </div>
  );
}

function DeltaPill({ value }: { value: number }) {
  return (
    <span
      className={`inline-flex h-[19px] shrink-0 items-center gap-0.5 rounded-full pl-1.5 pr-2 text-[10px] font-bold ${INDIGO_BG} ${INDIGO_TEXT}`}
    >
      <RiArrowUpLine size={11} aria-hidden />
      {value.toFixed(1)}
    </span>
  );
}

/* ---------------- Tile 1: Close the gap ---------------- */

function CloseTheGap() {
  const CHECKLIST: { text: string; delta: number }[] = [
    { text: "Pricing hidden until signup", delta: 0.8 },
    { text: "Trust proof missing", delta: 0.8 },
    { text: "Headline lacks a use-case", delta: 0.6 },
  ];

  return (
    <article className={`${TILE_SHELL} md:col-span-7`}>
      <TileHeader
        title="Close the gap"
        subtitle="Your score today vs. what's within reach."
      />

      <div className="mt-7 flex flex-1 flex-col justify-center">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:items-center">
          {/* Score motif */}
          <div className={`${UI_FRAME} p-4`}>
            <div className="flex items-end gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/30">
                  Now
                </p>
                <p className="text-[19px] font-semibold leading-[1.2] tracking-[-0.02em] text-white/45 md:text-[44px] md:leading-[0.9] md:tracking-[-0.04em]">
                  6.5
                </p>
              </div>
              <RiArrowRightLine size={20} className="mb-0.5 text-white/20 md:mb-2.5" aria-hidden />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/35">
                  Potential
                </p>
                <p className={`text-[19px] font-semibold leading-[1.2] tracking-[-0.02em] md:text-[44px] md:leading-[0.9] md:tracking-[-0.04em] ${INDIGO_TEXT}`}>
                  8.9
                </p>
              </div>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full w-[89%] rounded-full bg-gradient-to-r from-white/30 to-indigo-400/80" />
            </div>
            <p className="mt-2.5 text-[12px] text-white/35">+2.4 points if you fix the top 3</p>
          </div>

          {/* Checklist */}
          <ul className={`${UI_FRAME} space-y-0.5 p-2`}>
            {CHECKLIST.map((item, index) => (
              <li
                key={item.text}
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-2"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-medium tabular-nums text-white/40">
                    {index + 1}
                  </span>
                  <p className="truncate text-[13px] font-medium text-white/60">{item.text}</p>
                </div>
                <DeltaPill value={item.delta} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

/* ---------------- Tile 2: Copy studio ---------------- */

function CopyStudio() {
  return (
    <article className={`${TILE_SHELL} md:col-span-5`}>
      <TileHeader
        title="Copy studio"
        subtitle="Rewrites ready to paste into your page."
      />

      <div className="mt-7 flex flex-1 flex-col justify-center">
        <div className={`${UI_FRAME} p-3.5`}>
          <p className="text-[11px] text-white/30">
            Headline · Subheadline · CTA
          </p>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-white/25">
                Before
              </p>
              <p className="mt-1.5 text-[13px] font-medium leading-[1.35] text-white/35 line-through decoration-white/15">
                Manage your business relationships
              </p>
            </div>
            <div>
              <p className={`text-[10px] font-medium uppercase tracking-[0.08em] ${INDIGO_TEXT}`}>
                Recommended
              </p>
              <p className="mt-1.5 text-[13px] font-semibold leading-[1.35] tracking-[-0.01em] text-white">
                The CRM built for teams who sell together
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---------------- Tile 3: Visual fixes ---------------- */

function VisualFixes() {
  return (
    <article className={`${TILE_SHELL} md:col-span-5`}>
      <TileHeader
        title="Visual fixes"
        subtitle="Exact UI issues — not vague advice."
      />

      <div className="mt-7 flex flex-1 flex-col justify-center">
        <div className={`${UI_FRAME} p-3.5`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#E8A849]"
                style={{ backgroundColor: AMBER_BG }}
              >
                <RiContrast2Line size={17} aria-hidden />
              </span>
              <p className="text-[14px] font-semibold text-white">Text contrast</p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${INDIGO_BG} ${INDIGO_TEXT}`}
            >
              Medium
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 py-1.5">
              <span className="h-4 w-4 rounded bg-white/20" />
              <span className="text-[11px] font-semibold text-[#E8A849]/70">3.2:1</span>
            </span>
            <RiArrowRightLine size={14} className="text-white/20" aria-hidden />
            <span className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 py-1.5">
              <span className="h-4 w-4 rounded bg-white/80" />
              <span className="text-[11px] font-semibold text-white/75">4.5:1</span>
            </span>
            <span className="ml-auto text-[11px] text-white/40">passes AA</span>
          </div>

          <p className="mt-3.5 border-t border-white/[0.06] pt-3 text-[11px] leading-[16px] text-white/30">
            Also checks visual hierarchy, proof placement, and CTA prominence
          </p>
        </div>
      </div>
    </article>
  );
}

/* ---------------- Tile 4: Trust & discoverability ---------------- */

function TrustMeta() {
  const NOTES = [
    "Add customer logos near the CTA",
    "Include testimonials above the fold",
    "Clarify the free trial terms",
  ];

  return (
    <article className={`${TILE_SHELL} md:col-span-7`}>
      <TileHeader
        title="Trust & discoverability"
        subtitle="How you look in search — and to visitors."
      />

      <div className="mt-7 grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
        {/* SERP snippet */}
        <div className={`${UI_FRAME} flex flex-col justify-center p-4`}>
          <div className="flex items-center gap-2 text-[11px] text-white/30">
            <RiSearchLine size={13} aria-hidden />
            Search preview
          </div>
          <p className="mt-3 text-[11px] text-white/35">folk.app</p>
          <p className="mt-0.5 text-[17px] font-medium leading-6 text-white/75">
            Folk CRM: Simple CRM for Teams
          </p>
          <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-white/40">
            Folk is a simple CRM designed for teams to manage relationships effortlessly.
          </p>
        </div>

        {/* Trust notes */}
        <div className={`${UI_FRAME} p-4`}>
          <ul className="space-y-2.5">
            {NOTES.map((note) => (
              <li key={note} className="flex items-start gap-2.5">
                <RiErrorWarningLine
                  size={16}
                  className="mt-0.5 shrink-0 text-[#E8A849]"
                  aria-hidden
                />
                <span className="text-[13px] leading-[18px] text-white/55">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

/* ---------------- Section ---------------- */

export function LandingTestWhatsInside() {
  return (
    <section className={LANDING_SECTION} aria-labelledby="whats-inside-heading">
      <div className={LANDING_CONTAINER}>
        <div className="mx-auto max-w-[640px] text-center">
          <h2
            id="whats-inside-heading"
            className="text-[28px] font-semibold leading-[1.1] tracking-[-0.03em] text-white md:text-[36px] md:leading-[1.08]"
          >
            One report. Four ways to lift conversion.
          </h2>
          <p className={`${LANDING_LEAD} mx-auto mt-4 max-w-[540px] text-center`}>
            Every audit follows the same structure — so you always know what to fix next.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:mt-14 md:grid-cols-12 md:items-stretch">
          <CloseTheGap />
          <CopyStudio />
          <VisualFixes />
          <TrustMeta />
        </div>

        <div className="mt-10 flex justify-center">
          <Link href={DEMO_REPORT_PATH} className={SAMPLE_BUTTON}>
            Open sample report
            <RiArrowRightLine size={17} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
