"use client";

import { RiBarChartLine } from "@remixicon/react";
import type {
  ReportScorePotential,
  ReportChecklistItem,
} from "@/lib/audit-report";

// ---------------------------------------------------------------------------
// Design tokens (docs/report-mvp-v4.html §4 SCORE POTENTIAL)
// --amber:#BA7517  --green:#1D9E75  --gd:#0F6E56
// --bs:#F5F5F3  --b1:rgba(0,0,0,.07)  --t1:#111  --t2:#555  --tm:#C0C0BC
// --fd:'Familjen Grotesk'  --rsm:10px  --rp:20px
// ---------------------------------------------------------------------------

interface ScorePotentialCompactProps {
  score: number;
  scorePotential: ReportScorePotential;
  /** Used to resolve chip.label → link_to for scroll navigation */
  checklist?: ReportChecklistItem[];
}

function truncateLabel(label: string, max = 32) {
  return label.length > max ? label.slice(0, max).trimEnd() + "…" : label;
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildTitle(count: number) {
  if (count === 0) return "Your score has improvement potential";
  if (count === 1) return "Fix 1 gap to close most of the distance";
  return `Fix ${count} gaps to close most of the distance`;
}

export default function ScorePotentialCompact({
  score,
  scorePotential,
  checklist,
}: ScorePotentialCompactProps) {
  const { target, chips } = scorePotential;

  function handleChipClick(label: string) {
    const item = checklist?.find((c) => c.text === label);
    if (item?.link_to) scrollTo(item.link_to);
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_1px_rgba(0,0,0,0.04),0_4px_20px_rgba(0,0,0,0.07)] overflow-hidden mb-2.5">
      {/* Section header */}
      <div className="flex items-center justify-between px-5 pt-[14px] pb-[10px]">
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#999] uppercase tracking-[0.07em]">
          <RiBarChartLine className="w-4 h-4" />
          Score potential
        </span>
        <span className="text-[12px] text-[#C0C0BC]">estimate · not a promise</span>
      </div>

      {/* Content row */}
      <div className="flex flex-wrap items-center px-5 py-4">
        {/* Left: numbers */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div>
            <div className="font-['Familjen_Grotesk',sans-serif] text-[32px] font-semibold leading-none tracking-[-1.5px] text-[#BA7517]">
              {score % 1 === 0 ? score.toFixed(1) : String(score)}
            </div>
            <div className="text-[11px] text-[#C0C0BC] mt-0.5 text-center">Now</div>
          </div>
          <span className="text-[18px] text-[#C0C0BC] mx-2.5">→</span>
          <div>
            <div className="font-['Familjen_Grotesk',sans-serif] text-[32px] font-semibold leading-none tracking-[-1.5px] text-[#1D9E75]">
              {target % 1 === 0 ? target.toFixed(1) : String(target)}
            </div>
            <div className="text-[11px] text-[#C0C0BC] mt-0.5 text-center">Potential</div>
          </div>
        </div>

        {/* Divider — hidden on small screens */}
        <div className="hidden sm:block w-px bg-[rgba(0,0,0,0.07)] h-10 mx-4 flex-shrink-0" />

        {/* Right: title + chips */}
        {chips.length > 0 && (
          <div className="flex-1 min-w-0 mt-3 sm:mt-0">
            <div className="font-['Familjen_Grotesk',sans-serif] text-[14px] font-medium text-[#111] mb-2 tracking-[-0.2px]">
              {buildTitle(chips.length)}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {chips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleChipClick(chip.label)}
                  className="text-[12px] bg-[#F5F5F3] rounded-[10px] px-2.5 py-[5px] text-[#555] border border-[rgba(0,0,0,0.07)] cursor-pointer transition-all duration-[120ms] hover:border-[#1D9E75] hover:text-[#0F6E56] text-left"
                >
                  {i + 1} · {truncateLabel(chip.label)}{" "}
                  <strong className="text-[#1D9E75] font-medium">{chip.delta}</strong>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
