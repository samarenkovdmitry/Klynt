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

import { TEST_CARD } from "./landingUpdateStyles";

export function LandingTestMockup() {
  const data = DEMO_REPORT;
  const score = 75;
  const riskColor = getTierColor(getRiskTier(data.risk));

  return (
    <div
      className={`relative ${TEST_CARD}`}
      role="img"
      aria-label="Demo clarity report preview"
      onCopy={(event) => event.preventDefault()}
    >
      <div
        className="pointer-events-none relative select-none"
        style={{ WebkitUserSelect: "none", userSelect: "none" }}
      >
        <div className="flex items-center justify-between gap-6 px-10 py-8">
          <div className="flex min-w-0 items-center gap-3">
            <h2 className="text-[38px] font-semibold leading-none tracking-[-0.04em] text-[#061C2F]">
              Clarity Report
            </h2>
            <div className="rounded-full border border-[#DCE7F8] bg-[#F4F8FF] px-3 py-1 text-[12px] font-semibold text-[#2F6FED]">
              AI Generated
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-5 text-[14px] font-medium text-[#061C2F]">
            <span className="inline-flex items-center gap-2">
              <RiDownload2Line size={18} />
              Export PDF
            </span>
            <span className="inline-flex items-center gap-2">
              <RiShareForwardLine size={18} />
              Share
            </span>
          </div>
        </div>

        <div className="border-t border-[#DCE2E7] px-10 pb-8 pt-[26px]">
          <h3 className="text-[26px] font-semibold tracking-[-0.03em] text-[#061C2F]">
            Summary
          </h3>

          <div className="mt-5 grid grid-cols-[1.55fr_0.75fr] divide-x divide-[#DCE2E7]">
            <div className="pr-8">
              <div className="flex items-start gap-6">
                <ScoreRing score={score} />

                <div className="min-w-0 flex-1">
                  <p className="text-left text-[24px] font-medium leading-[1.35] tracking-[-0.03em] text-[#061C2F]">
                    {data.verdict}
                  </p>
                  <p className="mt-4 text-left text-[12px] font-medium uppercase tracking-[0.08em] text-neutral-400">
                    Top insight
                  </p>
                  <p className="mt-1 text-left text-[16px] leading-[1.65] text-[#8E99A2]">
                    {data.summary}
                  </p>
                </div>
              </div>
            </div>

            <div className="pl-8">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[14px] font-semibold text-[#061C2F]">
                  Conversion Health
                </p>
                <div className="flex items-center gap-1.5">
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

              <div className="mt-4 border-t border-[#DCE2E7] pt-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] font-medium text-neutral-500">
                    AI confidence
                  </p>
                  <p className="text-[14px] font-semibold tabular-nums text-[#061C2F]">
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

          <div className="mt-8 border-t border-[#DCE2E7] pt-8">
            <div className="flex items-start gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF7ED]">
                <RiLightbulbLine size={18} className="text-amber-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-normal uppercase tracking-[0.08em] text-amber-700">
                  Key observation
                </p>
                <p className="mt-1.5 text-[16px] font-normal leading-[1.55] tracking-[-0.01em] text-[#061C2F]">
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
