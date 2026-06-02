import { ScoreStatusChip } from "@/components/report/ScoreStatusChip";

import { LANDING_SURFACE_BG } from "./landingPageStyles";

const UI_FRAME = `overflow-hidden rounded-[12px] border border-white/[0.08] ${LANDING_SURFACE_BG} shadow-[0_8px_32px_rgba(0,0,0,0.14)]`;

const REPORT_FRAME =
  "overflow-hidden rounded-[12px] border border-black/[0.06] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)]";

export function StepAddPageVisual() {
  return (
    <div className={UI_FRAME} aria-hidden>
      <div className="px-3.5 py-3">
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-400/70" />
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
    <div className={REPORT_FRAME} aria-hidden>
      <div className="px-3.5 py-3">
        <ScoreStatusChip score="6.5" tierLabel="At risk" badgeBg="#FF7A00" />
        <ul className="mt-3 space-y-2 border-t border-black/[0.06] pt-3">
          {[
            "Hero headline lacks a clear first outcome",
            "Multiple CTAs compete above the fold",
          ].map((line) => (
            <li key={line} className="flex gap-2 text-[11px] leading-[15px] text-[#18181B]/55">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#18181B]/25" />
              <span className="line-clamp-2">{line}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 inline-flex rounded-md border border-black/[0.06] bg-[#F4F4F5] px-2 py-1 text-[10px] text-[#18181B]/50">
          Copy refinement
        </div>
      </div>
    </div>
  );
}
