"use client";

import { RiBarChartLine, RiArrowRightLine } from "@remixicon/react";
import type {
  ReportScorePotential,
  ReportChecklistItem,
} from "@/lib/audit-report";
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

function formatScore(value: number) {
  return value % 1 === 0 ? value.toFixed(1) : String(value);
}

export default function ScorePotentialCompact({
  score,
  scorePotential,
}: ScorePotentialCompactProps) {
  const { target, chips } = scorePotential;

  const scorePct = Math.min(Math.max(score / 10, 0), 1);
  const potentialPct = Math.min(Math.max(target / 10, 0), 1);
  const showGauge = potentialPct > scorePct;

  const description =
    chips.length > 0
      ? `Fix ${chips.length} gap${chips.length === 1 ? "" : "s"} to close most of the distance`
      : "Ship the fixes to unlock your score potential";

  return (
    <section className={`${REPORT_SECTION_SPACING_CLASS} ${REPORT_SECTION_SCROLL_MARGIN_CLASS}`}>
      <div className="overflow-hidden rounded-[14px] border border-[#e6e9ef] bg-white">
        {/* Header band */}
        <div className="flex items-center gap-2 border-b border-[#eef1f5] bg-[#fafbfc] px-6 py-[18px]">
          <div
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-[#eef1f6]"
            aria-hidden
          >
            <RiBarChartLine size={18} className="text-[#5B6378]" />
          </div>
          <span className="text-[20px] font-semibold leading-7 tracking-[-0.02em] text-[#061C2F]">
            Score potential
          </span>
          <span className="ml-auto text-[14px] font-normal text-[#8E99A2]">estimate, not a promise</span>
        </div>

        <div className="flex flex-col px-5 py-5 md:flex-row md:items-center">
          {/* Score values */}
          <div className="flex shrink-0 flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="text-[40px] font-semibold leading-none tracking-[-0.04em] text-status-weak">
                {formatScore(score)}
              </div>
              <RiArrowRightLine size={20} className="text-[#C0C0C0]" aria-hidden />
              <div className="text-[40px] font-semibold leading-none tracking-[-0.04em] text-status-good">
                {formatScore(target)}
              </div>
            </div>

            {showGauge && (
              <div>
                <div className="relative h-[5px] w-full overflow-hidden rounded-full bg-[#F5F5F5]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${scorePct * 100}%`,
                      backgroundColor: "var(--color-status-weak)",
                    }}
                  />
                  <div
                    className="absolute inset-y-0 opacity-85"
                    style={{
                      left: `${scorePct * 100}%`,
                      width: `${(potentialPct - scorePct) * 100}%`,
                      background:
                        "repeating-linear-gradient(45deg, var(--color-status-good) 0 2px, transparent 2px 6px)",
                    }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[11px] text-[#8E99A2]">
                  <span>now {formatScore(score)}</span>
                  <span>target {formatScore(target)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Vertical divider — desktop only */}
          <div className="mx-6 hidden h-[60px] w-px shrink-0 bg-[rgba(6,28,47,0.06)] md:block" />

          {/* Description + quick-win list */}
          {chips.length > 0 ? (
            <div className="mt-4 min-w-0 flex-1 md:mt-0">
              <p className="mb-3 text-[14px] leading-5 text-[#061C2F]">{description}</p>
              <ul className="space-y-[6px]">
                {chips.map((chip, index) => (
                  <li key={`${chip.label}-${index}`} className="flex items-center gap-1">
                    <span className="shrink-0 text-[13px] text-[#8E99A2]">•</span>
                    <span className="text-[13px] leading-5 text-[#061C2F]">{chip.label}</span>
                    <span
                      className="mx-2 flex-1 self-center border-b border-dotted border-[#C0C0C0]"
                      aria-hidden
                    />
                    <span className="shrink-0 text-[13px] font-medium text-status-good">{chip.delta}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
