"use client";

import Link from "next/link";
import {
  RiBrainLine,
  RiCpuLine,
  RiFilePdf2Line,
  RiFocus3Line,
  RiPieChartLine,
  RiShare2Line,
  RiShieldCheckLine,
} from "@remixicon/react";

import { ReportHeroPattern } from "@/components/report/ReportHeroPattern";
import { DEMO_REPORT, DEMO_REPORT_PATH, DEMO_REPORT_PREVIEW_IMAGE } from "@/lib/demo-report";
import {
  getFrictionScore,
  getMetricBarColor,
  getReportHeroTheme,
} from "@/lib/report-hero-theme";
import { REPORT_PREVIEW_HEIGHT, REPORT_PREVIEW_WIDTH } from "@/lib/report-preview-size";

const textClamp = "line-clamp-2";

const summaryTextClass =
  "text-[15px] leading-[19px] text-[rgba(6,28,47,0.5)] md:text-[16px] md:leading-[25px]";

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
  const previewImage = data.previewImage ?? DEMO_REPORT_PREVIEW_IMAGE;
  const trust = Math.max(0, Math.min(100, Number(data.breakdown?.trust)));
  const clarity = Math.max(0, Math.min(100, Number(data.breakdown?.clarity)));
  const friction = Math.max(0, Math.min(100, getFrictionScore(data.breakdown)));
  const topIssue = data.issues[0]?.title;
  const confidence = Math.max(0, Math.min(100, Number(data.confidence)));

  return (
    <Link
      href={DEMO_REPORT_PATH}
      id="report"
      className="group relative mx-auto block max-w-[560px] lg:max-w-none"
      aria-label="View sample UX report for zapier.com"
    >
      <div
        className="overflow-hidden rounded-[16px] border border-white/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.24)] ring-1 ring-black/[0.06] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_28px_72px_rgba(0,0,0,0.28)] md:rounded-[20px]"
        onCopy={(event) => event.preventDefault()}
      >
        <div
          className="pointer-events-none select-none"
          style={{ WebkitUserSelect: "none", userSelect: "none" }}
        >
          <div className="rounded-t-[16px] bg-[#ECF0F6] px-5 py-[11px] md:rounded-t-[20px] md:pl-6 md:pr-4">
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

          <div
            className="relative overflow-hidden px-5 pb-6 pt-6 md:px-[30px] md:pb-8 md:pt-[30px]"
            style={{ backgroundColor: theme.heroBg }}
          >
            <ReportHeroPattern gridColor={theme.gridColor} heroBg={theme.heroBg} />

            <div className="relative z-[1] flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="min-w-0 flex-1">
                <p className="text-[22px] font-bold leading-[1.25] tracking-[-0.01em] text-black md:text-[26px] md:leading-[1.2]">
                  {data.verdict}
                </p>

                <p className={`mt-2 ${summaryTextClass} ${textClamp}`}>{data.summary}</p>

                <div className="mt-6 md:mt-8">
                  <p className="text-[14px] text-[rgba(6,28,47,0.5)]">Key Insight</p>
                  <p className={`mt-0 ${summaryTextClass} ${textClamp}`}>
                    {data.key_observation}
                  </p>
                </div>
              </div>

              <div className="mx-auto w-[200px] shrink-0 md:w-[220px]">
                <img
                  src={previewImage}
                  alt="Analyzed page preview"
                  width={REPORT_PREVIEW_WIDTH}
                  height={REPORT_PREVIEW_HEIGHT}
                  className="block h-[122px] w-full rounded-lg border border-black/[0.09] object-cover object-top shadow-[0_10px_40px_rgba(0,0,0,0.06)] md:h-[135px]"
                />

                {topIssue && (
                  <p
                    className={`mt-3 text-[13px] leading-[17px] text-[var(--ink-primary)] md:text-[14px] md:leading-[19px] ${textClamp}`}
                  >
                    {topIssue}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-t border-[rgba(32,52,94,0.09)] bg-white px-5 py-5 sm:grid-cols-3 md:grid-cols-5 md:gap-6 md:px-[30px] md:py-6">
            <MockMetric icon={RiShieldCheckLine} label="Trust" value={trust} />
            <MockMetric icon={RiFocus3Line} label="Clarity" value={clarity} />
            <MockMetric icon={RiBrainLine} label="Friction" value={friction} />
            <MockMetric icon={RiPieChartLine} label="Overall Assessment" value={score} />
            <MockMetric icon={RiCpuLine} label="AI Confidence" value={confidence} />
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-[13px] font-medium text-white/45 transition group-hover:text-white/65">
        View full sample report →
      </p>
    </Link>
  );
}
