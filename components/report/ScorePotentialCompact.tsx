"use client";

import { RiBarChartLine } from "@remixicon/react";
import type {
  ReportScorePotential,
  ReportChecklistItem,
} from "@/lib/audit-report";
import {
  getScoreChipShortLabel,
  resolveChipChecklistItem,
} from "@/lib/normalize-report-checklist";
import { FreemiumProBadge } from "@/components/report/FreemiumProBadge";
import type { RequestProUpgrade } from "@/lib/freemium";
import {
  REPORT_PANEL_HEADER_CLASS,
  REPORT_PANEL_META_CLASS,
  REPORT_PANEL_TITLE_CLASS,
  REPORT_SURFACE_CARD_CLASS,
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

  return (
    <section className="mt-12 scroll-mt-24">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-[20px] font-semibold leading-7 tracking-[-0.02em] text-[#061C2F]">
          <RiBarChartLine size={20} className="text-[#7D8C99]" aria-hidden />
          Score potential
        </h2>
        <span className="text-[14px] text-[#7D8C99]">estimate · not a promise</span>
      </div>

      <div className={REPORT_SURFACE_CARD_CLASS}>
        <div className={REPORT_PANEL_HEADER_CLASS}>
          <div className={REPORT_PANEL_TITLE_CLASS}>
            <RiBarChartLine size={20} className="text-[#7D8C99]" aria-hidden />
            If you ship the fixes
            {chipsLocked ? <FreemiumProBadge /> : null}
          </div>
          <span className={REPORT_PANEL_META_CLASS}>
            {formatScore(score)} → {formatScore(target)}
          </span>
        </div>

        <div className="flex flex-col gap-5 px-5 py-5 md:flex-row md:items-center md:px-6 md:py-6">
          <div className="flex shrink-0 items-center gap-4">
            <div className="text-center">
              <div className="text-[32px] font-semibold leading-none tracking-[-0.04em] text-[#BA7517]">
                {formatScore(score)}
              </div>
              <div className="mt-1 text-[13px] text-[#7D8C99]">Now</div>
            </div>
            <span className="text-[20px] text-[#C0C0BC]">→</span>
            <div className="text-center">
              <div className="text-[32px] font-semibold leading-none tracking-[-0.04em] text-[#10B981]">
                {formatScore(target)}
              </div>
              <div className="mt-1 text-[13px] text-[#7D8C99]">Potential</div>
            </div>
          </div>

          {chips.length > 0 ? (
            <div className="flex min-w-0 flex-1 flex-wrap gap-2">
              {chips.map((chip, index) => (
                <button
                  key={`${chip.label}-${index}`}
                  type="button"
                  onClick={() => handleChipClick(chip.label, index)}
                  className="rounded-full border border-[rgba(6,28,47,0.08)] bg-[#FAFBFC] px-3 py-1.5 text-[13px] text-[#061C2F] transition-colors hover:border-[rgba(6,28,47,0.16)]"
                >
                  <span className="font-medium">{getScoreChipShortLabel(chip.label)}</span>
                  <span className="ml-1 font-semibold text-[#10B981]">{chip.delta}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
