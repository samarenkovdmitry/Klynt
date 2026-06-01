"use client";

import Link from "next/link";
import {
  RiBrainLine,
  RiFilePdf2Line,
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
      <div className="flex items-center gap-1.5">
        <Icon size={14} className="shrink-0 text-[#8E99A2]" aria-hidden />
        <p className="truncate text-[12px] font-semibold text-[var(--ink-primary)]">{label}</p>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-[4px] min-w-0 flex-1 overflow-hidden rounded-full bg-[#F5F5F5]">
          <div
            className="h-full rounded-full"
            style={{ width: `${value}%`, backgroundColor: barColor }}
          />
        </div>
        <span
          className="shrink-0 text-[11px] font-semibold tabular-nums"
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
  const topIssue = data.issues[0]?.title;
  const overallScore = formatOverallScore(score);
  const confidence = Math.max(0, Math.min(100, Number(data.confidence)));

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
          <div className="rounded-t-[16px] bg-[#ECF0F6] px-4 py-3 md:rounded-t-[20px] md:px-5 md:py-[11px]">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <p className="text-center text-[13px] font-normal leading-[18px] text-[var(--ink-primary)] sm:text-left md:text-[14px] md:leading-[21px]">
                Share-ready UX report
              </p>
              <div className="flex gap-2">
                <span className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full border border-[rgba(6,28,47,0.10)] bg-white px-3 text-[12px] font-medium text-[var(--ink-primary)] sm:flex-none md:h-[37px] md:px-4 md:text-[14px]">
                  <RiShare2Line size={16} aria-hidden />
                  Share
                </span>
                <span className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full border border-[rgba(6,28,47,0.10)] bg-white px-3 text-[12px] font-medium text-[var(--ink-primary)] sm:flex-none md:h-[37px] md:px-4 md:text-[14px]">
                  <RiFilePdf2Line size={16} aria-hidden />
                  Export
                </span>
              </div>
            </div>
          </div>

          <div
            className="relative overflow-hidden px-4 pb-5 pt-5 md:px-5 md:pb-6 md:pt-6"
            style={{ backgroundColor: theme.heroBg }}
          >
            <div className="relative z-[1] flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
              <div className="min-w-0 flex-1">
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

                <div className="mt-4 md:mt-5">
                  <p className="text-[12px] text-[rgba(6,28,47,0.5)] md:text-[13px]">Key Insight</p>
                  <p
                    className={`mt-0.5 text-[13px] leading-[1.45] font-medium text-[var(--ink-primary)] md:text-[14px] md:leading-[20px] ${textClamp}`}
                  >
                    {data.key_observation}
                  </p>
                </div>
              </div>

              <div className="mx-auto shrink-0 sm:mx-0">
                <div className="relative w-[220px] md:w-[240px]">
                  <div className="overflow-hidden rounded-lg border border-black/[0.09] bg-[#F8FAFC] shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-1.5 border-b border-black/[0.06] px-2.5 py-2">
                      <span className="h-2 w-2 rounded-full bg-[#FF5F57]" />
                      <span className="h-2 w-2 rounded-full bg-[#FFBD2E]" />
                      <span className="h-2 w-2 rounded-full bg-[#28CA41]" />
                      <span className="ml-1 truncate text-[10px] text-[rgba(6,28,47,0.45)]">
                        {domain}
                      </span>
                    </div>
                    <div className="space-y-2 px-3 py-3">
                      <div className="h-2 w-3/4 rounded bg-[rgba(6,28,47,0.10)]" />
                      <div className="h-2 w-1/2 rounded bg-[rgba(6,28,47,0.07)]" />
                      <div className="mt-3 h-14 rounded-md bg-[rgba(6,28,47,0.05)]" />
                      <div className="flex gap-2">
                        <div className="h-6 flex-1 rounded bg-[#FF4F00]/20" />
                        <div className="h-6 flex-1 rounded border border-[rgba(6,28,47,0.08)] bg-white" />
                      </div>
                    </div>
                  </div>

                  {topIssue && (
                    <div className="absolute -bottom-3 left-1/2 w-[calc(100%-16px)] max-w-[260px] -translate-x-1/2 rounded-[13px] bg-white px-2.5 py-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.06]">
                      <p className="truncate text-[11px] leading-[15px] text-[var(--ink-primary)] md:text-[12px]">
                        {topIssue}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 border-t border-[rgba(32,52,94,0.09)] bg-white px-4 py-4 md:gap-4 md:px-5 md:py-5">
            <MockMetric icon={RiShieldCheckLine} label="Trust" value={trust} />
            <MockMetric icon={RiFocus3Line} label="Clarity" value={clarity} />
            <MockMetric icon={RiBrainLine} label="Friction" value={friction} />
          </div>

          <div className="flex flex-col gap-2 border-t border-[rgba(32,52,94,0.09)] bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between md:px-5 md:py-4">
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
            <p className="text-[12px] text-[rgba(6,28,47,0.5)] md:text-[13px]">
              <span className="font-medium text-[var(--ink-primary)]">
                AI confidence: {confidence}%
              </span>
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-[13px] font-medium text-white/50 transition group-hover:text-white/70">
        View full sample report →
      </p>
    </Link>
  );
}
