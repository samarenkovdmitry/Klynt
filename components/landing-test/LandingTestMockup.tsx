"use client";

import Link from "next/link";
import {
  RiArrowRightSLine,
  RiBrainLine,
  RiFocus3Line,
  RiShare2Line,
  RiShieldCheckLine,
} from "@remixicon/react";

import { DEMO_REPORT, DEMO_REPORT_PATH } from "@/lib/demo-report";
import {
  formatOverallScore,
  formatReportDomain,
  getFrictionScore,
  getMetricBarColor,
  getReportHeroTheme,
} from "@/lib/report-hero-theme";

const textClamp = "line-clamp-2";

function MockMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof RiShieldCheckLine;
  label: string;
  value: number;
}) {
  const barColor = getMetricBarColor(value);

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <Icon size={16} className="shrink-0 text-[#8E99A2]" aria-hidden />
        <p className="truncate text-[13px] font-semibold text-[var(--ink-primary)] md:text-[14px]">
          {label}
        </p>
      </div>
      <div className="mt-2.5 flex items-center gap-2.5">
        <div className="h-[5px] min-w-0 flex-1 overflow-hidden rounded-full bg-[#F5F5F5] md:h-[6px]">
          <div
            className="h-full rounded-full"
            style={{ width: `${value}%`, backgroundColor: barColor }}
          />
        </div>
        <span
          className="shrink-0 text-[12px] font-semibold tabular-nums md:text-[13px]"
          style={{ color: barColor }}
        >
          {value}%
        </span>
      </div>
    </div>
  );
}

export function LandingTestMockup() {
  const data = DEMO_REPORT;
  const score = Number(data.score);
  const theme = getReportHeroTheme(score);
  const domain = formatReportDomain(data.url);
  const trust = Math.max(0, Math.min(100, Number(data.breakdown?.trust)));
  const clarity = Math.max(0, Math.min(100, Number(data.breakdown?.clarity)));
  const friction = Math.max(0, Math.min(100, getFrictionScore(data.breakdown)));
  const topIssue = data.issues[0];
  const overallScore = formatOverallScore(score);
  const issueCount = data.issues.length;
  const deliverableBullets = [
    `${issueCount} issues ranked by impact`,
    `${data.suggestions.length} suggested improvements`,
    `${data.copy.length} copy refinements`,
  ] as const;

  return (
    <Link
      href={DEMO_REPORT_PATH}
      id="report"
      className="group relative mx-auto block max-w-[560px] lg:max-w-none"
      aria-label={`View sample UX report for ${domain}`}
    >
      <div
        className="overflow-hidden rounded-[16px] border border-white/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.24)] ring-1 ring-black/[0.06] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_28px_72px_rgba(0,0,0,0.28)] md:rounded-[20px]"
        onCopy={(event) => event.preventDefault()}
      >
        <div
          className="pointer-events-none select-none"
          style={{ WebkitUserSelect: "none", userSelect: "none" }}
        >
          <div className="relative overflow-hidden bg-white px-4 pb-4 pt-4 md:px-5 md:pb-5 md:pt-5">
            <div className="mb-4 flex items-center justify-between gap-3 md:mb-5">
              <p className="text-[12px] font-medium text-[rgba(6,28,47,0.45)] md:text-[13px]">
                Share-ready report
              </p>
              <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[rgba(6,28,47,0.35)]"
                aria-hidden
              >
                <RiShare2Line size={15} />
              </span>
            </div>

            <div className="grid items-start gap-4 sm:grid-cols-[minmax(0,1fr)_200px] md:grid-cols-[minmax(0,1fr)_220px] md:gap-5">
              <div className="min-w-0">
                <p
                  className={`text-[17px] font-bold leading-[1.25] tracking-[-0.01em] text-black md:text-[20px] ${textClamp}`}
                >
                  {data.verdict}
                </p>
                <p
                  className={`mt-2 text-[13px] leading-[1.5] text-[rgba(6,28,47,0.5)] md:text-[14px] md:leading-[20px] ${textClamp}`}
                >
                  {data.summary}
                </p>
                <ul className="mt-3 space-y-1">
                  {deliverableBullets.map((line) => (
                    <li
                      key={line}
                      className="flex gap-2 text-[11px] leading-[16px] text-[rgba(6,28,47,0.45)] md:text-[12px] md:leading-[17px]"
                    >
                      <span
                        className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-[rgba(6,28,47,0.25)]"
                        aria-hidden
                      />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="overflow-hidden rounded-lg border border-black/[0.08] bg-[#F8FAFC] shadow-[0_8px_28px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-1.5 border-b border-black/[0.06] bg-white px-2.5 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF5F57]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FFBD2E]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#28CA41]" />
                  <span className="ml-1 truncate text-[9px] text-[rgba(6,28,47,0.45)]">
                    {domain}
                  </span>
                </div>
                {data.previewImage ? (
                  <img
                    src={data.previewImage}
                    alt=""
                    width={440}
                    height={270}
                    className="block aspect-[310/190] w-full object-cover object-top"
                    draggable={false}
                  />
                ) : (
                  <div className="aspect-[310/190] w-full bg-gradient-to-b from-[#F8FAFC] to-[#EEF2F7]" />
                )}
              </div>
            </div>

            {topIssue && (
              <div className="mt-4 rounded-[10px] border border-[rgba(32,52,94,0.08)] bg-[#F8FAFC] px-3 py-2.5 md:mt-5">
                <p className="text-[11px] font-medium text-[rgba(6,28,47,0.45)] md:text-[12px]">
                  Top issue
                </p>
                <p
                  className={`mt-1 text-[12px] leading-[17px] text-[var(--ink-primary)] md:text-[13px] md:leading-[18px] ${textClamp}`}
                >
                  {topIssue.title}
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-[rgba(32,52,94,0.09)] bg-white">
            <div className="grid grid-cols-3 gap-4 px-4 py-5 md:gap-5 md:px-5 md:py-5">
              <MockMetric icon={RiShieldCheckLine} label="Trust" value={trust} />
              <MockMetric icon={RiFocus3Line} label="Clarity" value={clarity} />
              <MockMetric icon={RiBrainLine} label="Friction" value={friction} />
            </div>

            <div className="flex flex-col gap-2 border-t border-[rgba(32,52,94,0.06)] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between md:px-5 md:py-4">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex h-6 min-w-[30px] items-center justify-center rounded-full px-2 text-[11px] font-bold leading-none tracking-[-0.05em] text-white md:text-[12px]"
                  style={{ backgroundColor: theme.badgeBg }}
                >
                  {overallScore}
                </span>
                <p className="text-[13px] font-semibold text-[var(--ink-primary)] md:text-[14px]">
                  Overall Assessment
                </p>
              </div>
              <p className="inline-flex items-center gap-0.5 text-[12px] font-medium text-[rgba(6,28,47,0.55)] md:text-[13px]">
                View {issueCount} issues
                <RiArrowRightSLine size={16} className="text-[rgba(6,28,47,0.4)]" aria-hidden />
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-[13px] font-medium text-white/50 transition group-hover:text-white/70">
        View full sample report →
      </p>
    </Link>
  );
}
