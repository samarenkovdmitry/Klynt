"use client";

import {
  RiBarChartLine,
  RiLock2Line,
} from "@remixicon/react";
import type {
  ReportScorePotential,
  ReportChecklistItem,
} from "@/lib/audit-report";
import {
  getScoreChipShortLabel,
  resolveChipChecklistItem,
} from "@/lib/normalize-report-checklist";
import { FreemiumProBadge } from "@/components/report/FreemiumProBadge";
import { scrollToProUpgradeGate } from "@/lib/freemium";

interface ScorePotentialCompactProps {
  score: number;
  scorePotential: ReportScorePotential;
  checklist?: ReportChecklistItem[];
  chipsLocked?: boolean;
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildTitle(count: number) {
  if (count === 0) return "Your score has improvement potential";
  if (count === 1) return "Fix 1 copy & trust gap to close most of the distance";
  return `Fix ${count} copy & trust gaps to close most of the distance`;
}

export default function ScorePotentialCompact({
  score,
  scorePotential,
  checklist,
  chipsLocked = false,
}: ScorePotentialCompactProps) {
  const { target, chips } = scorePotential;

  function handleChipClick(chipLabel: string, index: number) {
    const item = resolveChipChecklistItem(chipLabel, index, checklist);
    if (item?.link_to) scrollTo(item.link_to);
  }

  return (
    <div className="mb-2.5 overflow-hidden rounded-2xl bg-white shadow-[0_1px_1px_rgba(0,0,0,0.04),0_4px_20px_rgba(0,0,0,0.07)]">
      <div className="flex items-center justify-between px-5 pb-[10px] pt-[14px]">
        <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.07em] text-[#999]">
          <RiBarChartLine className="h-4 w-4" />
          Score potential
          {chipsLocked ? <FreemiumProBadge className="normal-case tracking-normal" /> : null}
        </span>
        <span className="text-[12px] text-[#C0C0BC]">estimate · not a promise</span>
      </div>

      <div className="flex flex-wrap items-center px-5 py-4">
        <div className="flex shrink-0 items-center gap-2.5">
          <div>
            <div className="font-['Familjen_Grotesk',sans-serif] text-[32px] font-semibold leading-none tracking-[-1.5px] text-[#BA7517]">
              {score % 1 === 0 ? score.toFixed(1) : String(score)}
            </div>
            <div className="mt-0.5 text-center text-[11px] text-[#C0C0BC]">Now</div>
          </div>
          <span className="mx-2.5 text-[18px] text-[#C0C0BC]">→</span>
          <div>
            <div className="font-['Familjen_Grotesk',sans-serif] text-[32px] font-semibold leading-none tracking-[-1.5px] text-[#1D9E75]">
              {target % 1 === 0 ? target.toFixed(1) : String(target)}
            </div>
            <div className="mt-0.5 text-center text-[11px] text-[#C0C0BC]">Potential</div>
          </div>
        </div>

        <div className="mx-4 hidden h-10 w-px shrink-0 bg-[rgba(0,0,0,0.07)] sm:block" />

        <div className="mt-3 min-w-0 flex-1 sm:mt-0">
          {chips.length > 0 ? (
            <div className="relative">
              <div className={chipsLocked ? "pointer-events-none select-none blur-[2px]" : ""}>
                <div className="mb-2 font-['Familjen_Grotesk',sans-serif] text-[14px] font-medium tracking-[-0.2px] text-[#111]">
                  {buildTitle(chips.length)}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {chips.map((chip, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleChipClick(chip.label, i)}
                      className="cursor-pointer rounded-[10px] border border-[rgba(0,0,0,0.07)] bg-[#F5F5F3] px-2.5 py-[5px] text-left text-[12px] text-[#555] transition-all duration-[120ms] hover:border-[#1D9E75] hover:text-[#0F6E56]"
                    >
                      {i + 1} · {getScoreChipShortLabel(chip.label, checklist)}{" "}
                      <strong className="font-medium text-[#1D9E75]">{chip.delta}</strong>
                    </button>
                  ))}
                </div>
              </div>

              {chipsLocked ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={scrollToProUpgradeGate}
                    className="pointer-events-auto inline-flex items-center gap-1.5 rounded-[10px] border border-black/[0.08] bg-white/95 px-3 py-2 text-[12px] font-medium text-[#111] shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-colors hover:bg-white"
                  >
                    <RiLock2Line size={14} aria-hidden />
                    Upgrade to see breakdown
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-[13px] leading-[1.5] text-[#888]">
              Fix copy and trust gaps above to see how much your score could improve.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
