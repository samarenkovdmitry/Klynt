"use client";

import { RiLightbulbLine, RiShareBoxLine } from "@remixicon/react";

import { DEMO_REPORT } from "@/lib/demo-report";
import {
  getRiskTier,
  getScoreColor,
  getTierColor,
  normalizeRisk,
} from "@/lib/report-metrics";

const mobileClamp = "line-clamp-2 md:line-clamp-none";

function LandingTestScoreRing({ score }: { score: number }) {
  const scoreColor = getScoreColor(score);

  return (
    <>
      <div className="relative mx-auto flex h-[140px] w-[140px] shrink-0 items-center justify-center md:hidden">
        <svg
          className="absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 140 140"
          aria-hidden
        >
          <circle cx="70" cy="70" r="54" fill="rgba(255,255,255,0.55)" />
          <circle
            cx="70"
            cy="70"
            r="54"
            stroke="#E5E7EB"
            strokeWidth="5"
            fill="transparent"
          />
          <circle
            cx="70"
            cy="70"
            r="54"
            stroke={scoreColor}
            strokeWidth="5"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 54}
            strokeDashoffset={2 * Math.PI * 54 * (1 - score / 100)}
          />
        </svg>
        <div className="relative text-center">
          <p className="text-[11px] font-semibold text-[#061C2F]">UX Score</p>
          <p
            className="text-[36px] leading-none font-semibold tracking-[-0.04em]"
            style={{ color: scoreColor }}
          >
            {score}
          </p>
        </div>
      </div>

      <div className="relative hidden h-[160px] w-[160px] shrink-0 items-center justify-center md:flex">
        <svg
          className="absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 160 160"
          aria-hidden
        >
          <circle cx="80" cy="80" r="61" fill="rgba(255,255,255,0.55)" />
          <circle
            cx="80"
            cy="80"
            r="61"
            stroke="#E5E7EB"
            strokeWidth="5"
            fill="transparent"
          />
          <circle
            cx="80"
            cy="80"
            r="61"
            stroke={scoreColor}
            strokeWidth="5"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 61}
            strokeDashoffset={2 * Math.PI * 61 * (1 - score / 100)}
          />
        </svg>
        <div className="relative text-center">
          <p className="text-[12px] font-semibold text-[#061C2F]">UX Score</p>
          <p
            className="text-[40px] leading-none font-semibold tracking-[-0.05em]"
            style={{ color: scoreColor }}
          >
            {score}
          </p>
        </div>
      </div>
    </>
  );
}

export function LandingTestMockup() {
  const data = DEMO_REPORT;
  const score = 75;
  const riskColor = getTierColor(getRiskTier(data.risk));
  const riskLabel = normalizeRisk(data.risk);

  return (
    <div
      className="relative mx-auto max-w-[1040px] overflow-hidden rounded-[28px] border border-[rgba(6,28,47,0.09)] bg-white shadow-[0_20px_60px_rgba(6,28,47,0.1)] md:rounded-[36px]"
      role="img"
      aria-label="Demo clarity report preview"
      onCopy={(event) => event.preventDefault()}
    >
      <div
        className="pointer-events-none select-none"
        style={{ WebkitUserSelect: "none", userSelect: "none" }}
      >
        <div className="flex items-center justify-between gap-4 px-5 py-6 md:px-8">
          <div className="flex min-w-0 flex-wrap items-center gap-2 md:gap-3">
            <h2 className="text-[20px] font-semibold leading-[26px] tracking-[-0.04em] text-[#061C2F] md:text-[26px] md:leading-[30px]">
              Clarity Report
            </h2>
            <div className="rounded-full border border-[#DCE7F8] bg-[#F4F8FF] px-2.5 py-1 text-[11px] font-semibold text-[#2F6FED] md:px-3 md:text-[12px]">
              AI Generated
            </div>
          </div>

          <RiShareBoxLine
            size={22}
            className="shrink-0 text-[#8E99A2] md:hidden"
            aria-hidden
          />

          <div className="hidden shrink-0 items-center gap-4 text-[14px] font-medium text-[#061C2F] md:flex">
            <span>Export PDF</span>
            <span className="h-4 w-px bg-[#DCE2E7]" aria-hidden />
            <span>Share</span>
          </div>
        </div>

        <div className="border-t border-[#DCE2E7] px-5 pt-[18px] pb-6 md:px-8 md:pt-[26px] md:pb-8">
          <h3 className="text-[18px] font-semibold leading-[23px] tracking-[-0.03em] text-[#061C2F] md:text-[20px] md:leading-[28px]">
            Summary
          </h3>

          <div className="mt-4 md:mt-5 md:grid md:grid-cols-[1.6fr_0.7fr] md:divide-x md:divide-[#DCE2E7]">
            <div className="pb-6 md:pr-8 md:pb-0">
              <div className="flex flex-col items-center md:flex-row md:items-start md:gap-6">
                <LandingTestScoreRing score={score} />

                <div className="mt-4 min-w-0 w-full text-center md:mt-0 md:flex-1 md:text-left">
                  <p
                    className={`text-[20px] font-medium leading-[30px] tracking-[-0.03em] text-[#061C2F] md:text-[24px] md:leading-[1.35] ${mobileClamp}`}
                  >
                    {data.verdict}
                  </p>
                  <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400 md:mt-4 md:text-[12px]">
                    Top insight
                  </p>
                  <p
                    className={`mt-1 text-[13px] leading-[1.55] text-[#8E99A2] md:text-[16px] md:leading-[1.65] ${mobileClamp}`}
                  >
                    {data.summary}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-[#DCE2E7] pt-6 md:border-t-0 md:pl-8 md:pt-0">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14px] font-semibold text-[#061C2F]">
                  Conversion Health
                </p>
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold"
                  style={{
                    color: riskColor,
                    backgroundColor: `${riskColor}1A`,
                    border: `1px solid ${riskColor}33`,
                  }}
                >
                  {riskLabel}
                </span>
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

          <div className="mt-6 border-t border-[#DCE2E7] pt-6 md:mt-8 md:pt-8">
            <div className="flex items-start gap-3">
              <RiLightbulbLine size={22} className="mt-0.5 shrink-0 text-amber-600" />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-amber-700">
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
