"use client";

import {
  RiDownload2Line,
  RiLightbulbLine,
  RiShareForwardLine,
} from "@remixicon/react";
import { DEMO_REPORT } from "@/lib/demo-report";
import {
  getRiskTier,
  getScoreColor,
  getTierColor,
  normalizeRisk,
} from "@/lib/report-metrics";

const titleSection =
  "text-[24px] md:text-[28px] font-semibold tracking-[-0.03em] text-[#061C2F]";

function ImpactBadges({
  entries,
}: {
  entries: { key: string; value: number }[];
}) {
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {entries.map((entry, i) => (
        <div
          key={i}
          className="inline-flex shrink-0 items-center rounded-full border border-red-200 bg-red-50 px-3.5 py-2 text-[12px] font-semibold text-red-500 md:text-[13px]"
        >
          -{Math.abs(entry.value)}% {entry.key}
        </div>
      ))}
    </div>
  );
}

function getImpactEntries(item: {
  impact_metric_1?: string;
  impact_value_1?: unknown;
  impact_metric_2?: string;
  impact_value_2?: unknown;
}) {
  return [
    { key: item.impact_metric_1, value: item.impact_value_1 },
    { key: item.impact_metric_2, value: item.impact_value_2 },
  ]
    .map((entry) => ({
      key: String(entry.key ?? "").trim(),
      value:
        typeof entry.value === "number" ? entry.value : Number(entry.value),
    }))
    .filter(
      (entry) => entry.key && Number.isFinite(entry.value) && entry.value !== 0
    )
    .slice(0, 2);
}

export function LandingReportMockup() {
  const data = DEMO_REPORT;
  const score = Number(data.score);
  const size = 176;
  const radius = 74;
  const strokeWidth = 6;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;
  const scoreColor = getScoreColor(score);
  const riskColor = getTierColor(getRiskTier(data.risk));
  const firstIssue = data.issues[0];
  const impactEntries = firstIssue ? getImpactEntries(firstIssue) : [];

  return (
    <div
      className="
        relative
        mx-auto
        max-w-[960px]
        overflow-hidden
        rounded-[28px]
        border
        border-[rgba(6,28,47,0.08)]
        bg-white
        shadow-[0_20px_60px_rgba(6,28,47,0.1)]
        md:rounded-[36px]
      "
      role="img"
      aria-label="Demo clarity report preview"
      onCopy={(event) => event.preventDefault()}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-[var(--stroke-light)] bg-[#F8FAFC] px-4 py-3 md:px-5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28CA41]" />
        <div className="ml-2 hidden flex-1 rounded-md bg-white px-3 py-1 text-[11px] text-neutral-400 sm:block">
          klynt.app/report/demo
        </div>
      </div>

      <div
        className="
          pointer-events-none
          max-h-[520px]
          select-none
          overflow-hidden
          bg-[#F5F7FA]
          px-3
          pb-0
          pt-3
          md:max-h-[580px]
          md:px-4
          md:pt-4
        "
        style={{ WebkitUserSelect: "none", userSelect: "none" }}
      >
        <div className="mx-auto max-w-[1040px]">
          <div className="overflow-hidden rounded-[28px] border border-[var(--stroke-light)] bg-white md:rounded-[36px]">
            <div className="flex flex-col gap-6 px-5 py-6 md:px-10 md:py-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2
                    className="
                      text-[34px]
                      font-semibold
                      leading-none
                      tracking-[-0.04em]
                      text-[var(--ink-primary)]
                      md:text-[42px]
                    "
                  >
                    Clarity Report
                  </h2>
                  <div className="rounded-full border border-[#DCE7F8] bg-[#F4F8FF] px-3 py-1 text-[12px] font-semibold text-[#2F6FED]">
                    AI Generated
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--ink-secondary)] md:text-[14px]">
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
                <div className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[var(--stroke-light)] bg-white px-4 py-3 text-[14px] font-medium text-[var(--ink-primary)] md:flex-none md:rounded-full md:px-5">
                  <RiDownload2Line size={18} />
                  <span>Export PDF</span>
                </div>
                <div className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[var(--stroke-light)] bg-white px-4 py-3 text-[14px] font-medium text-[var(--ink-primary)] md:flex-none md:rounded-full md:px-5">
                  <RiShareForwardLine size={18} />
                  <span>Share</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--stroke-light)]">
              <div className="px-5 py-6 md:px-10 md:py-8">
                <h3 className={titleSection}>Summary</h3>

                <div className="mt-5 lg:grid lg:grid-cols-[1.6fr_0.7fr] lg:divide-x lg:divide-[var(--stroke-light)]">
                  <div className="pb-6 lg:pr-8 lg:pb-0">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                      <div className="relative mx-auto flex h-[176px] w-[176px] shrink-0 items-center justify-center sm:mx-0">
                        <svg
                          className="-rotate-90"
                          width={size}
                          height={size}
                          aria-hidden
                        >
                          <circle
                            cx={center}
                            cy={center}
                            r={radius}
                            stroke="#E5E7EB"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                          />
                          <circle
                            cx={center}
                            cy={center}
                            r={radius}
                            stroke={scoreColor}
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={progress}
                          />
                        </svg>
                        <div className="absolute text-center">
                          <p className="text-[12px] font-semibold text-[var(--ink-primary)]">
                            UX Score
                          </p>
                          <p
                            className="text-[44px] leading-none font-semibold tracking-[-0.04em] md:text-[48px] md:tracking-[-0.06em]"
                            style={{ color: scoreColor }}
                          >
                            {score}
                          </p>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-center text-[20px] font-semibold leading-[1.35] tracking-[-0.03em] text-[var(--ink-primary)] sm:text-left md:text-[24px]">
                          {data.verdict}
                        </p>
                        <p className="mt-4 text-center text-[12px] font-medium uppercase tracking-[0.08em] text-neutral-400 sm:text-left">
                          Top insight
                        </p>
                        <p className="mt-1 text-center text-[15px] leading-[1.65] text-[var(--ink-secondary)] sm:text-left md:text-[16px]">
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
                          ["Clarity", data.breakdown.clarity],
                          ["Trust", data.breakdown.trust],
                          ["Conversion", data.breakdown.conversion],
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

                <div className="bg-[#FFFBF5] px-5 py-5 md:px-10 md:py-6">
                  <div className="flex items-start gap-3.5">
                    <RiLightbulbLine
                      size={20}
                      className="mt-0.5 shrink-0 text-amber-600"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-amber-700">
                        Key observation
                      </p>
                      <p className="mt-1.5 text-[15px] font-medium leading-[1.55] tracking-[-0.01em] text-[var(--ink-primary)] md:text-[16px]">
                        {data.key_observation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className={`${titleSection} mb-5`}>UX Issues</h3>

            {firstIssue && (
              <div className="rounded-[28px] border border-[var(--stroke-light)] bg-white px-5 py-6 md:px-8">
                <div className="flex flex-col gap-5 md:flex-row md:gap-6">
                  <div className="hidden md:flex items-start justify-center pt-0.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5F7FA] text-[15px] font-semibold text-neutral-400">
                      1
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex items-center gap-3 md:hidden">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F7FA] text-[15px] font-semibold text-neutral-400">
                        1
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-[20px] font-semibold leading-[1.3] tracking-[-0.02em] text-[var(--ink-primary)] md:text-[22px]">
                          {firstIssue.title}
                        </p>
                        <div className="lg:hidden">
                          <ImpactBadges entries={impactEntries} />
                        </div>
                      </div>
                      <div className="hidden shrink-0 lg:block">
                        <ImpactBadges entries={impactEntries} />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {firstIssue.bullets.slice(0, 3).map((bullet) => (
                        <span
                          key={bullet}
                          className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-[12px] font-medium text-neutral-600 md:text-[13px]"
                        >
                          {bullet}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-10 cursor-default" aria-hidden />
    </div>
  );
}
