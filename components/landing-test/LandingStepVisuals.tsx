import { RiLinkM } from "@remixicon/react";

import { LANDING_SURFACE_BG } from "./landingPageStyles";

const UI_FRAME = `overflow-hidden rounded-[12px] border border-white/[0.08] ${LANDING_SURFACE_BG} shadow-[0_8px_32px_rgba(0,0,0,0.14)]`;

export function StepAddPageVisual() {
  return (
    <div className={UI_FRAME} aria-hidden>
      <div className="px-3.5 py-3">
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5">
          <RiLinkM size={14} className="shrink-0 text-indigo-400/70" aria-hidden />
          <span className="truncate text-[12px] text-white/45">https://your-landing-page.com</span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[11px] text-white/30">or upload screenshot</span>
          <span className="rounded-full bg-white/[0.92] px-3 py-1.5 text-[11px] font-medium text-[#18181B]">
            Analyze UX
          </span>
        </div>
      </div>
    </div>
  );
}

export function StepAnalyzeVisual() {
  return (
    <div className={UI_FRAME} aria-hidden>
      <div className="px-3.5 py-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-white/40">Analyzing page</span>
          <span className="tabular-nums text-white/55">67%</span>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full w-[67%] rounded-full bg-indigo-400/65" />
        </div>
        <div className="mt-4 space-y-2.5">
          {[
            ["Hero clarity", "82%"],
            ["Trust signals", "71%"],
            ["Conversion flow", "58%"],
          ].map(([label, width]) => (
            <div key={label} className="flex items-center gap-2.5">
              <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-white/30"
                  style={{ width }}
                />
              </div>
              <span className="w-[72px] shrink-0 text-right text-[10px] text-white/35">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StepReportVisual() {
  return (
    <div className={UI_FRAME} aria-hidden>
      <div className="px-3.5 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold text-white/45">Close the gap</span>
          <span className="text-[11px] font-semibold tabular-nums tracking-[-0.02em]">
            <span className="text-white/40">6.5</span>
            <span className="text-white/20"> → </span>
            <span className="text-indigo-300">8.9</span>
          </span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full w-[89%] rounded-full bg-gradient-to-r from-white/30 to-indigo-400/80" />
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-white/[0.04] px-2 py-1.5">
          <span className="truncate text-[11px] text-white/55">Headline lacks a use-case</span>
          <span className="inline-flex shrink-0 items-center rounded-full bg-indigo-400/15 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300">
            ↑0.8
          </span>
        </div>
        <div className="mt-3 border-t border-white/[0.06] pt-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-white/25">
            Copy studio
          </p>
          <p className="mt-1 truncate text-[11px] text-white/35 line-through decoration-white/15">
            The all-in-one platform for modern teams
          </p>
          <p className="truncate text-[11px] font-medium text-white/75">
            Ship landing pages that convert — without a designer
          </p>
        </div>
      </div>
    </div>
  );
}
