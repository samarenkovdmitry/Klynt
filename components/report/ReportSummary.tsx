import { RiLightbulbLine } from "@remixicon/react";
import type { ReportBreakdown } from "@/lib/audit-report";
import { ScoreRing } from "@/components/report/ScoreRing";
import { REPORT_SECTION_TITLE_CLASS } from "@/components/report/reportStyles";
import {
  getScoreColor,
  getTierColor,
  normalizeRisk,
  getRiskTier,
} from "@/lib/report-metrics";

type ReportSummaryProps = {
  score?: number;
  verdict?: string;
  summary?: string;
  risk?: string;
  breakdown?: ReportBreakdown;
  confidence?: number;
  keyObservation?: string;
};

export function ReportSummary({
  score = 0,
  verdict,
  summary,
  risk,
  breakdown,
  confidence = 0,
  keyObservation,
}: ReportSummaryProps) {
  const numericScore = Number(score);
  const riskTier = getRiskTier(risk ?? "");
  const riskColor = getTierColor(riskTier);

  return (
    <div className="border-t border-[var(--stroke-light)]">
      <div className="px-5 py-6 md:px-10 md:py-8">
        <h2 className={REPORT_SECTION_TITLE_CLASS}>Summary</h2>

        <div className="mt-5 lg:grid lg:grid-cols-[1.6fr_0.7fr] lg:divide-x lg:divide-[var(--stroke-light)]">
          <div className="pb-6 lg:pr-8 lg:pb-0">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <ScoreRing
                score={numericScore}
                className="relative mx-auto flex h-[176px] w-[176px] shrink-0 items-center justify-center sm:mx-0"
              />

              <div className="min-w-0 flex-1">
                <p className="text-center text-[20px] font-medium leading-[1.35] tracking-[-0.03em] text-[var(--ink-primary)] sm:text-left md:text-[24px]">
                  {verdict || "UX assessment complete"}
                </p>

                <p className="mt-4 text-center text-[12px] font-medium uppercase tracking-[0.08em] text-neutral-400 sm:text-left">
                  Top insight
                </p>

                <p className="mt-1 text-center text-[15px] leading-[1.65] text-[var(--ink-secondary)] sm:text-left md:text-[16px]">
                  {summary || "No summary generated."}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--stroke-light)] pt-6 lg:border-t-0 lg:pl-8 lg:pt-0">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[14px] font-semibold text-[var(--ink-primary)]">
                Conversion Health
              </p>

              <div className="flex shrink-0 items-center gap-1.5">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: riskColor }}
                />
                <p
                  className="text-[15px] font-semibold tracking-[-0.02em]"
                  style={{ color: riskColor }}
                >
                  {normalizeRisk(risk ?? "")}
                </p>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {(
                [
                  ["Clarity", breakdown?.clarity],
                  ["Trust", breakdown?.trust],
                  ["Conversion", breakdown?.conversion],
                ] as const
              ).map(([label, value]) => {
                const barScore = Math.max(0, Math.min(100, Number(value ?? 0)));
                const barColor = getScoreColor(barScore);

                return (
                  <div key={label}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] text-neutral-500">{label}</span>
                      <span
                        className="text-[12px] font-semibold tabular-nums"
                        style={{ color: barColor }}
                      >
                        {barScore}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${barScore}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 border-t border-[var(--stroke-light)] pt-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] font-medium text-neutral-500">
                  AI confidence
                </p>
                <p className="text-[14px] font-semibold tabular-nums text-[var(--ink-primary)]">
                  {confidence}%
                </p>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-[#061C2F] transition-all duration-700"
                  style={{
                    width: `${Math.max(0, Math.min(100, Number(confidence)))}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-[11px] leading-[1.45] text-neutral-500">
                Based on visible UI structure, messaging clarity and conversion
                signals.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-[var(--stroke-light)] pt-6 md:mt-8 md:pt-8">
          <div className="flex items-start gap-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF7ED]">
              <RiLightbulbLine size={18} className="text-amber-600" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-normal uppercase tracking-[0.08em] text-amber-700">
                Key observation
              </p>
              <p className="mt-1.5 text-[15px] font-normal leading-[1.55] tracking-[-0.01em] text-[var(--ink-primary)] md:text-[16px]">
                {keyObservation || "No key observation available."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
