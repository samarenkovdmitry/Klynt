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

const STRIP_ACTION_CLASS =
  "inline-flex h-[37px] items-center justify-center gap-2 rounded-full border border-[rgba(6,28,47,0.10)] bg-white px-4 text-[14px] font-medium leading-[21px] text-[var(--ink-primary)]";

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
        <Icon size={16} className="shrink-0 text-[#8E99A2]" aria-hidden />
        <p className="truncate text-[14px] font-semibold text-[var(--ink-primary)]">{label}</p>
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        <div className="h-[5px] min-w-0 flex-1 overflow-hidden rounded-full bg-[#F5F5F5]">
          <div
            className="h-full rounded-full"
            style={{ width: `${value}%`, backgroundColor: barColor }}
          />
        </div>
        <span
          className="shrink-0 text-[12px] font-semibold tabular-nums leading-[18px]"
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
      aria-label="View sample UX report for zapier.com"
    >
      <div
        className="overflow-hidden rounded-[24px] border border-white/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.28)] ring-1 ring-black/[0.06] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_32px_96px_rgba(0,0,0,0.32)] md:rounded-[32px]"
        onCopy={(event) => event.preventDefault()}
      >
        <div
          className="pointer-events-none select-none"
          style={{ WebkitUserSelect: "none", userSelect: "none" }}
        >
          <div className="rounded-t-[24px] bg-[#ECF0F6] px-5 py-[11px] md:rounded-t-[32px] md:pl-6 md:pr-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
              <p className="text-center text-[14px] font-normal leading-[21px] text-[var(--ink-primary)] md:text-left">
                Turn this analysis into a conversation starter.
              </p>
              <div className="flex gap-2">
                <span className={`${STRIP_ACTION_CLASS} flex-1 md:flex-none`}>
                  <RiShare2Line size={18} aria-hidden />
                  Share
                </span>
                <span className={`${STRIP_ACTION_CLASS} flex-1 md:flex-none`}>
                  <RiFilePdf2Line size={18} aria-hidden />
                  Export
                </span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-[#12161F] px-5 pb-6 pt-6 md:px-[30px] md:pb-8 md:pt-[30px]">
            <div className="relative z-[1] flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="min-w-0 flex-1">
                <p className="text-[20px] font-bold leading-[1.25] tracking-[-0.01em] text-white md:text-[22px] md:leading-[1.2]">
                  {data.verdict}
                </p>

                <p className={`mt-2 text-[14px] leading-[20px] text-white/50 md:text-[15px] md:leading-[19px] ${textClamp}`}>
                  {data.summary}
                </p>

                <div className="mt-5 md:mt-6">
                  <p className="text-[14px] text-white/50">Key Insight</p>
                  <p
                    className={`mt-0 text-[15px] leading-[19px] text-white md:text-[16px] md:leading-[26px] ${textClamp}`}
                  >
                    {data.key_observation}
                  </p>
                </div>
              </div>

              <div className="mx-auto shrink-0 sm:mx-0">
                <div className="relative w-[200px] md:w-[220px]">
                  <div className="overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-[#1A2030] to-[#12161F] shadow-[0_10px_40px_rgba(0,0,0,0.24)]">
                    <div className="flex items-center gap-1.5 border-b border-white/10 px-2.5 py-2">
                      <span className="h-2 w-2 rounded-full bg-[#FF5F57]" />
                      <span className="h-2 w-2 rounded-full bg-[#FFBD2E]" />
                      <span className="h-2 w-2 rounded-full bg-[#28CA41]" />
                      <span className="ml-1 truncate text-[10px] text-white/40">{domain}</span>
                    </div>
                    <div className="space-y-2 px-3 py-3">
                      <div className="h-2 w-3/4 rounded bg-white/12" />
                      <div className="h-2 w-1/2 rounded bg-white/8" />
                      <div className="mt-3 h-14 rounded-md bg-white/6" />
                      <div className="flex gap-2">
                        <div className="h-6 flex-1 rounded bg-[#FF4F00]/30" />
                        <div className="h-6 flex-1 rounded border border-white/10 bg-white/5" />
                      </div>
                    </div>
                  </div>

                  {topIssue && (
                    <div className="absolute -bottom-3 left-1/2 w-[calc(100%-12px)] max-w-[240px] -translate-x-1/2 rounded-[13px] bg-white px-2.5 py-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.06]">
                      <p className={`text-[12px] leading-[16px] text-[var(--ink-primary)] ${textClamp}`}>
                        {topIssue}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-[rgba(32,52,94,0.09)] bg-white px-5 py-5 md:gap-6 md:px-[30px] md:py-6">
            <MockMetric icon={RiShieldCheckLine} label="Trust" value={trust} />
            <MockMetric icon={RiFocus3Line} label="Clarity" value={clarity} />
            <MockMetric icon={RiBrainLine} label="Friction" value={friction} />
          </div>

          <div className="flex flex-col gap-2 border-t border-[rgba(32,52,94,0.09)] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-[30px]">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex h-6 min-w-[30px] items-center justify-center rounded-full px-2 text-[12px] font-bold leading-none tracking-[-0.05em] text-white"
                style={{ backgroundColor: theme.badgeBg }}
              >
                {overallScore}
              </span>
              <p className="text-[14px] font-semibold text-[var(--ink-primary)] md:text-[16px]">
                Overall Assessment
              </p>
            </div>
            <p className="text-[13px] leading-[18px] text-[rgba(6,28,47,0.5)]">
              <span className="font-medium text-[var(--ink-primary)]">
                AI confidence: {confidence}%
              </span>
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-[13px] font-medium text-white/45 transition group-hover:text-white/65">
        View full sample report →
      </p>
    </Link>
  );
}
