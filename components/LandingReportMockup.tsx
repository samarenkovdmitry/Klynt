"use client";

import {
  RiDownload2Line,
  RiLightbulbLine,
  RiShareForwardLine,
} from "@remixicon/react";
import { ScoreRing } from "@/components/report/ScoreRing";
import { DEMO_REPORT } from "@/lib/demo-report";
import {
  getRiskTier,
  getScoreColor,
  getTierColor,
  normalizeRisk,
} from "@/lib/report-metrics";
import { getFrictionScore } from "@/lib/report-hero-theme";

const titleSection =
  "text-[18px] font-semibold tracking-[-0.03em] text-[#061C2F] md:text-[26px]";

const mobileClamp = "line-clamp-2 md:line-clamp-none";

export function LandingReportMockup() {
  const data = DEMO_REPORT;
  const score = Number(data.score);
  const riskColor = getTierColor(getRiskTier(data.risk));
  const frictionScore = getFrictionScore(data.breakdown);

  return (
    <div
      className="
        relative
        mx-auto
        max-w-[1040px]
        overflow-hidden
        rounded-[28px]
        bg-white
        shadow-[0_20px_60px_rgba(6,28,47,0.1)]
        md:rounded-[36px]
      "
      role="img"
      aria-label="Demo clarity report preview"
      onCopy={(event) => event.preventDefault()}
    >
      <div
        className="pointer-events-none select-none"
        style={{ WebkitUserSelect: "none", userSelect: "none" }}
      >
          <div className="flex flex-col gap-6 px-5 py-6 md:px-10 md:py-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-nowrap items-center gap-2 md:gap-3">
                <h2
                  className="
                    shrink-0
                    text-[24px]
                    font-semibold
                    leading-none
                    tracking-[-0.04em]
                    text-[var(--ink-primary)]
                    md:text-[38px]
                  "
                >
                  Clarity Report
                </h2>
                <div className="shrink-0 rounded-full border border-[#DCE7F8] bg-[#F4F8FF] px-2.5 py-1 text-[11px] font-semibold text-[#2F6FED] md:px-3 md:text-[12px]">
                  AI Generated
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-1 gap-y-1 text-[13px] text-[var(--ink-secondary)] md:gap-x-2 md:text-[14px]">
                <div className="flex min-w-0 items-center gap-2">
                  <img
                    src={`https://www.google.com/s2/favicons?domain_url=${data.url}&sz=32`}
                    alt=""
                    className="h-4 w-4 shrink-0 rounded-sm"
                  />
                  <span className="truncate">{data.url}</span>
                </div>
                <span className="text-neutral-300">•</span>
                <span className="shrink-0">
                  {new Date(data.generatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="flex w-full gap-2 sm:w-auto">
              <div className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[var(--stroke-light)] bg-white px-4 py-2.5 text-[14px] font-medium text-[var(--ink-primary)] md:flex-none md:rounded-full md:px-5 md:py-3">
                <RiDownload2Line size={18} />
                <span>Export PDF</span>
              </div>
              <div className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[var(--stroke-light)] bg-white px-4 py-2.5 text-[14px] font-medium text-[var(--ink-primary)] md:flex-none md:rounded-full md:px-5 md:py-3">
                <RiShareForwardLine size={18} />
                <span>Copy link</span>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--stroke-light)]">
            <div className="px-5 pt-[18px] pb-6 md:px-10 md:pt-[26px] md:pb-8">
              <h3 className={titleSection}>Summary</h3>

              <div className="mt-4 md:mt-5 lg:grid lg:grid-cols-[1.6fr_0.7fr] lg:divide-x lg:divide-[var(--stroke-light)]">
                <div className="pb-6 lg:pr-8 lg:pb-0">
                  <div className="flex flex-row items-start gap-3 md:gap-6">
                    <ScoreRing
                      score={score}
                      className="relative flex h-[108px] w-[108px] shrink-0 items-center justify-center md:h-[176px] md:w-[176px]"
                      labelClassName="text-[10px] font-semibold text-[var(--ink-primary)] md:text-[12px]"
                      valueClassName="text-[28px] leading-none font-semibold tracking-[-0.04em] md:text-[48px] md:tracking-[-0.06em]"
                    />

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-left text-[16px] font-medium leading-[1.35] tracking-[-0.03em] text-[var(--ink-primary)] md:text-[24px] ${mobileClamp}`}
                      >
                        {data.verdict}
                      </p>
                      <p className="mt-3 text-left text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400 md:mt-4 md:text-[12px]">
                        Top insight
                      </p>
                      <p
                        className={`mt-1 text-left text-[13px] leading-[1.55] text-[var(--ink-secondary)] md:text-[16px] md:leading-[1.65] ${mobileClamp}`}
                      >
                        {data.summary}
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
                        {normalizeRisk(data.risk)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {(
                      [
                        ["Clarity", data.breakdown?.clarity ?? 0],
                        ["Trust", data.breakdown?.trust ?? 0],
                        ["Friction", frictionScore],
                      ] as const
                    ).map(([label, value]) => {
                      const barScore = Math.max(
                        0,
                        Math.min(100, Number(value))
                      );
                      const barColor = getScoreColor(barScore);

                      return (
                        <div key={label}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[12px] text-neutral-500">
                              {label}
                            </span>
                            <span
                              className="text-[12px] font-semibold tabular-nums"
                              style={{ color: barColor }}
                            >
                              {barScore}
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                            <div
                              className="h-full rounded-full"
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
                        {data.confidence}%
                      </p>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-[#061C2F]"
                        style={{ width: `${data.confidence}%` }}
                      />
                    </div>
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
                    <p
                      className={`mt-1.5 text-[15px] font-normal leading-[1.55] tracking-[-0.01em] text-[var(--ink-primary)] md:text-[16px] ${mobileClamp}`}
                    >
                      {data.key_observation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>

      <div className="absolute inset-0 z-10 cursor-default" aria-hidden />
    </div>
  );
}
