"use client";

import { RiDownload2Line, RiLightbulbLine, RiShareForwardLine } from "@remixicon/react";

import { ScoreRing } from "@/components/report/ScoreRing";
import { DEMO_REPORT } from "@/lib/demo-report";
import {
  getRiskTier,
  getScoreColor,
  getTierColor,
  normalizeRisk,
} from "@/lib/report-metrics";

const mobileClamp = "line-clamp-2 md:line-clamp-none";

export function LandingTestMockup() {
  const data = DEMO_REPORT;
  const score = 75;
  const riskColor = getTierColor(getRiskTier(data.risk));

  return (
    <div
      className="relative mx-auto max-w-[1040px] overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_rgba(6,28,47,0.1)] md:rounded-[36px]"
      role="img"
      aria-label="Demo clarity report preview"
      onCopy={(event) => event.preventDefault()}
    >
      <div
        className="pointer-events-none select-none"
        style={{ WebkitUserSelect: "none", userSelect: "none" }}
      >
        <div className="flex flex-col gap-6 px-5 py-6 md:flex-row md:items-start md:justify-between md:gap-6 md:px-10 md:py-8">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <h2 className="text-[24px] font-semibold leading-none tracking-[-0.04em] text-[#061C2F] md:text-[38px]">
                Clarity Report
              </h2>
              <div className="rounded-full border border-[#DCE7F8] bg-[#F4F8FF] px-2.5 py-1 text-[11px] font-semibold text-[#2F6FED] md:px-3 md:text-[12px]">
                AI Generated
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[#8E99A2] md:text-[14px]">
              <img
                src={`https://www.google.com/s2/favicons?domain_url=${data.url}&sz=32`}
                alt=""
                className="h-4 w-4 shrink-0 rounded-sm"
              />
              <span className="truncate">{data.url}</span>
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

          <div className="flex w-full gap-2 md:w-auto md:shrink-0 md:items-center md:gap-5 md:text-[14px] md:font-medium md:text-[#061C2F]">
            <span className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#DCE2E7] px-4 py-2.5 text-[14px] font-medium text-[#061C2F] md:flex-none md:rounded-none md:border-0 md:p-0">
              <RiDownload2Line size={18} />
              Export PDF
            </span>
            <span className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#DCE2E7] px-4 py-2.5 text-[14px] font-medium text-[#061C2F] md:flex-none md:rounded-none md:border-0 md:p-0">
              <RiShareForwardLine size={18} />
              Share
            </span>
          </div>
        </div>

        <div className="border-t border-[#DCE2E7] px-5 pt-[18px] pb-6 md:px-10 md:pb-8 md:pt-[26px]">
          <h3 className="text-[18px] font-semibold tracking-[-0.03em] text-[#061C2F] md:text-[26px]">
            Summary
          </h3>

          <div className="mt-4 md:mt-5 md:grid md:grid-cols-[1.6fr_0.7fr] md:divide-x md:divide-[#DCE2E7]">
            <div className="pb-6 md:pr-8 md:pb-0">
              <div className="flex items-start gap-3 md:gap-6">
                <ScoreRing
                  score={score}
                  className="relative flex h-[108px] w-[108px] shrink-0 items-center justify-center md:h-[176px] md:w-[176px]"
                  labelClassName="text-[10px] font-semibold text-[#061C2F] md:text-[12px]"
                  valueClassName="text-[28px] leading-none font-semibold tracking-[-0.04em] md:text-[48px] md:tracking-[-0.06em]"
                />

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-left text-[16px] font-medium leading-[1.35] tracking-[-0.03em] text-[#061C2F] md:text-[24px] ${mobileClamp}`}
                  >
                    {data.verdict}
                  </p>
                  <p className="mt-3 text-left text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400 md:mt-4 md:text-[12px]">
                    Top insight
                  </p>
                  <p
                    className={`mt-1 text-left text-[13px] leading-[1.55] text-[#8E99A2] md:text-[16px] md:leading-[1.65] ${mobileClamp}`}
                  >
                    {data.summary}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-[#DCE2E7] pt-6 md:border-t-0 md:pl-8 md:pt-0">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[14px] font-semibold text-[#061C2F]">
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
                    ["Clarity", data.breakdown.clarity],
                    ["Trust", data.breakdown.trust],
                    ["Conversion", data.breakdown.conversion],
                  ] as const
                ).map(([label, value]) => {
                  const barScore = Math.max(0, Math.min(100, Number(value)));
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
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-neutral-100">
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

              <div className="mt-4 border-t border-[#DCE2E7] pt-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] font-medium text-neutral-500">
                    AI confidence
                  </p>
                  <p className="text-[14px] font-semibold tabular-nums text-[#061C2F]">
                    {data.confidence}%
                  </p>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-[#061C2F]"
                    style={{ width: `${data.confidence}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-[#DCE2E7] pt-6 md:mt-8 md:pt-8">
            <div className="flex items-start gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF7ED]">
                <RiLightbulbLine size={18} className="text-amber-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-normal uppercase tracking-[0.08em] text-amber-700">
                  Key observation
                </p>
                <p
                  className={`mt-1.5 text-[15px] font-normal leading-[1.55] tracking-[-0.01em] text-[#061C2F] md:text-[16px] ${mobileClamp}`}
                >
                  {data.key_observation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-10 cursor-default" aria-hidden />
    </div>
  );
}
