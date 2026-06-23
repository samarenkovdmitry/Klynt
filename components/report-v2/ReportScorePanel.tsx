"use client";

import { RiBarChartLine } from "@remixicon/react";
import type { ReportChecklistItem, ReportScorePotential } from "@/lib/audit-report";

type Props = {
  score: number;
  scorePotential?: ReportScorePotential | null;
  checklist?: ReportChecklistItem[] | null;
};

export function ReportScorePanel({ score, scorePotential, checklist }: Props) {
  const scoreDisplay = score.toFixed(1);
  const potentialTarget = scorePotential?.target;
  const potentialDisplay = potentialTarget ? potentialTarget.toFixed(1) : null;

  const scorePct = Math.min(Math.max(score / 10, 0), 1);
  const potentialPct = potentialTarget ? Math.min(Math.max(potentialTarget / 10, 0), 1) : null;

  const topFixes = scorePotential?.chips?.slice(0, 3) ?? [];

  const fixRows = topFixes.length > 0
    ? topFixes.map((chip) => ({ label: chip.label, delta: chip.delta }))
    : checklist
        ?.filter((i) => i.status !== "pass")
        .slice(0, 3)
        .map((i) => ({ label: i.text, delta: null })) ?? [];

  return (
    <section className="overflow-hidden rounded-[16px] bg-v2-dark text-[#F5F2EA]">
      <div className="px-6 pb-[22px] pt-[26px] md:px-9">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="font-mono mb-3 inline-flex items-center gap-2 text-[11.5px] tracking-[0.1em] text-[rgba(245,242,234,0.5)]">
              <RiBarChartLine size={14} className="text-[rgba(245,242,234,0.5)]" />
              OVERALL SCORE
            </span>
            <div className="flex items-baseline gap-4">
              <span className="text-[48px] font-semibold leading-[0.8] tracking-[-0.04em] text-[#F5F2EA] md:text-[54px]">
                {scoreDisplay}
              </span>
              <span className="text-[20px] text-[rgba(245,242,234,0.4)]">/ 10</span>
            </div>
          </div>

          {potentialDisplay && (
            <div className="text-right">
              <span className="font-mono text-[13px] tracking-[0.08em] text-[rgba(245,242,234,0.7)]">
                POTENTIAL
              </span>
              <div className="mt-1.5 text-[30px] font-semibold leading-none tracking-[-0.03em] text-v2-potential md:text-[34px]">
                {potentialDisplay}
              </div>
            </div>
          )}
        </div>

        {/* Score gauge */}
        <div className="mt-4">
          <div className="relative h-4 overflow-hidden rounded-full bg-[rgba(245,242,234,0.07)]">
            {/* Current score fill */}
            <div
              className="absolute inset-y-0 left-0 bg-v2-potential"
              style={{ width: `${scorePct * 100}%` }}
            />
            {/* Potential zone (hatched) */}
            {potentialPct && potentialPct > scorePct && (
              <div
                className="absolute inset-y-0 opacity-85"
                style={{
                  left: `${scorePct * 100}%`,
                  width: `${(potentialPct - scorePct) * 100}%`,
                  background: "repeating-linear-gradient(45deg, #46C988 0 2px, transparent 2px 6px)",
                }}
              />
            )}
            {/* Tick marks */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "repeating-linear-gradient(90deg, transparent 0 calc(10% - 1px), rgba(245,242,234,0.13) calc(10% - 1px) 10%)",
              }}
            />
            {/* Current score marker */}
            <div
              className="absolute inset-y-0 w-[3px] bg-[#F5F2EA]"
              style={{ left: `calc(${scorePct * 100}% - 1.5px)` }}
            />
            {/* Potential marker */}
            {potentialPct && (
              <div
                className="absolute inset-y-0 w-[3px] bg-v2-potential-dark"
                style={{ left: `calc(${potentialPct * 100}% - 1.5px)` }}
              />
            )}
          </div>
          <div className="font-mono mt-2 flex justify-between text-[10.5px] tracking-[0.04em] text-[rgba(245,242,234,0.42)]">
            <span>0</span>
            <span className="text-[#F5F2EA]">NOW {scoreDisplay}</span>
            {potentialDisplay && (
              <span className="text-v2-potential">TARGET {potentialDisplay}</span>
            )}
            <span>10</span>
          </div>
        </div>
      </div>

      {fixRows.length > 0 && (
        <div className="border-t border-[rgba(245,242,234,0.1)] px-6 pb-5 pt-4 md:px-9">
          <p className="mb-3 text-[14px] font-semibold text-[#F5F2EA]">
            Fix {fixRows.length} gap{fixRows.length !== 1 ? "s" : ""} to close most of the distance{" "}
            <span className="font-normal text-[rgba(245,242,234,0.5)]">· estimate, not a promise</span>
          </p>
          <div className="flex flex-col gap-2.5">
            {fixRows.map((fix, i) => (
              <div key={i} className="flex items-center gap-2.5 text-[14px] text-[rgba(245,242,234,0.85)]">
                <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-v2-potential" />
                <span className="shrink-0 flex-1 min-w-0 truncate">{fix.label}</span>
                <span
                  className="shrink-0 flex-1 border-b border-dotted border-[rgba(245,242,234,0.22)]"
                  style={{ margin: "0 2px 3px" }}
                />
                {fix.delta && (
                  <span className="font-mono shrink-0 text-[13px] text-v2-potential-dark">
                    {fix.delta}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
