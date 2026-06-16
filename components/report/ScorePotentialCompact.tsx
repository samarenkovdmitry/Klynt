"use client";

import { RiBarChartLine, RiArrowRightLine } from "@remixicon/react";
import type {
  ReportScorePotential,
  ReportChecklistItem,
} from "@/lib/audit-report";
import {
  getScoreChipShortLabel,
  resolveChipChecklistItem,
} from "@/lib/normalize-report-checklist";
import type { RequestProUpgrade } from "@/lib/freemium";
import {
  REPORT_SECTION_SCROLL_MARGIN_CLASS,
  REPORT_SECTION_SPACING_CLASS,
} from "@/components/report/reportStyles";

interface ScorePotentialCompactProps {
  score: number;
  scorePotential: ReportScorePotential;
  checklist?: ReportChecklistItem[];
  chipsLocked?: boolean;
  onRequestProUpgrade?: RequestProUpgrade;
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function formatScore(value: number) {
  return value % 1 === 0 ? value.toFixed(1) : String(value);
}

export default function ScorePotentialCompact({
  score,
  scorePotential,
  checklist,
  chipsLocked = false,
  onRequestProUpgrade,
}: ScorePotentialCompactProps) {
  const { target, chips } = scorePotential;

  function handleChipClick(chipLabel: string, index: number) {
    if (chipsLocked) {
      onRequestProUpgrade?.("score-breakdown");
      return;
    }
    const item = resolveChipChecklistItem(chipLabel, index, checklist);
    if (item?.link_to) scrollTo(item.link_to);
  }

  const description =
    chips.length > 0
      ? `Fix ${chips.length} gap${chips.length === 1 ? "" : "s"} to close most of the distance`
      : "Ship the fixes to unlock your score potential";

  return (
    <section className={`${REPORT_SECTION_SPACING_CLASS} ${REPORT_SECTION_SCROLL_MARGIN_CLASS}`}>
      <div className="overflow-hidden rounded-[20px] border border-[rgba(6,28,47,0.06)] bg-white">
        {/* Header row */}
        <div className="flex items-center justify-between gap-4 px-5 pb-4 pt-5">
          <div className="flex items-center gap-2 text-[20px] font-semibold leading-7 tracking-[-0.02em] text-[#061C2F]">
            <RiBarChartLine size={20} className="text-[#7D8C99]" aria-hidden />
            Score potential
          </div>
          <span className="shrink-0 text-[14px] text-[#8E99A2]">estimate, not a promise</span>
        </div>

        {/* Content row */}
        <div className="flex items-center gap-0 px-5 pb-5">
          {/* Score values */}
          <div className="flex shrink-0 items-center gap-3">
            <div className="text-center">
              <div className="text-[40px] font-semibold leading-none tracking-[-0.04em] text-[#F97316]">
                {formatScore(score)}
              </div>
              <div className="mt-1 text-[13px] text-[#8E99A2]">now</div>
            </div>
            <RiArrowRightLine size={20} className="text-[#C0C0C0]" aria-hidden />
            <div className="text-center">
              <div className="text-[40px] font-semibold leading-none tracking-[-0.04em] text-[#1D9E75]">
                {formatScore(target)}
              </div>
              <div className="mt-1 text-[13px] text-[#8E99A2]">potential</div>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="mx-6 h-[60px] w-px shrink-0 bg-[rgba(6,28,47,0.06)]" />

          {/* Right: description + chips */}
          {chips.length > 0 ? (
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-[14px] leading-5 text-[#061C2F]">{description}</p>
              <div className="flex flex-wrap gap-2">
                {chips.map((chip, index) => (
                  <button
                    key={`${chip.label}-${index}`}
                    type="button"
                    onClick={() => handleChipClick(chip.label, index)}
                    className="inline-flex h-7 items-center rounded-[8px] border border-[#E5E5E5] bg-white px-3 text-[14px] transition-colors hover:border-[rgba(6,28,47,0.2)]"
                  >
                    <span className="text-[#061C2F]">
                      {getScoreChipShortLabel(chip.label, checklist)}
                    </span>
                    <span className="ml-[4px] text-[#1D9E75]">{chip.delta}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
