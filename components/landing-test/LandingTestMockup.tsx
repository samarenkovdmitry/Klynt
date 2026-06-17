"use client";

import Link from "next/link";
import {
  RiArrowRightLine,
  RiBrainLine,
  RiErrorWarningFill,
  RiFilePdf2Line,
  RiFocus3Line,
  RiLayoutGridLine,
  RiShare2Line,
  RiShieldCheckLine,
} from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";

import { DEMO_REPORT, DEMO_REPORT_PATH } from "@/lib/demo-report";
import {
  formatAnalyzedDate,
  formatOverallScore,
  formatReportDomain,
  getReportHeroTheme,
} from "@/lib/report-hero-theme";
import {
  REPORT_PREVIEW_HEIGHT,
  REPORT_PREVIEW_WIDTH,
} from "@/lib/report-preview-size";

const SCORE_COLORS: Record<string, string> = {
  healthy: "#059669",
  medium: "#BA7517",
  critical: "#E24B4A",
};

const RIGHT_COL_DOT = "rgba(0,0,0,0.10)";

const METRIC_SHORT_DESC: Record<string, Record<string, string>> = {
  Trust: {
    Good: "Social proof builds confidence",
    Medium: "Some trust signals present",
    Weak: "Trust cues feel incomplete",
    Low: "No credibility signals found",
  },
  Clarity: {
    Good: "Value is immediately obvious",
    Medium: "Benefit mostly comes through",
    Weak: "Core message needs sharpening",
    Low: "Value proposition not clear",
  },
  Friction: {
    Good: "User flow feels effortless",
    Medium: "Minor obstacles slow users down",
    Weak: "Several friction points present",
    Low: "Heavy friction blocks conversion",
  },
  Hierarchy: {
    Good: "Attention lands in right place",
    Medium: "Visual order mostly works",
    Weak: "Hierarchy needs clearer structure",
    Low: "No clear visual focal point",
  },
};

function getMetricStatus(value: number): { label: string; color: string } {
  if (value >= 70) return { label: "Good", color: "#639922" };
  if (value >= 55) return { label: "Medium", color: "#BA7517" };
  if (value >= 35) return { label: "Weak", color: "#BA7517" };
  return { label: "Low", color: "#E24B4A" };
}

function MockCompactMetric({
  icon: Icon,
  name,
  value,
}: {
  icon: RemixiconComponentType;
  name: string;
  value: number;
}) {
  const { label, color } = getMetricStatus(value);
  const shortDesc = METRIC_SHORT_DESC[name]?.[label] ?? label;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-1">
        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[#061C2F] md:gap-2 md:text-[13px]">
          <Icon size={13} className="shrink-0 text-[#8E99A2]" aria-hidden />
          {name}
        </span>
        <span className="text-[11px] font-semibold md:text-[12px]" style={{ color }}>
          {label}
        </span>
      </div>
      <div className="h-[3px] overflow-hidden rounded-full bg-[rgba(6,28,47,0.08)]">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[11px] leading-[15px] text-[rgba(6,28,47,0.45)] md:text-[12px] md:leading-[16px]">
        {shortDesc}
      </span>
    </div>
  );
}

function countCriticalGaps(checklist: typeof DEMO_REPORT.checklist) {
  return checklist.filter((item) => item.status === "missing" || item.status === "weak")
    .length;
}

export function LandingTestMockup() {
  const data = DEMO_REPORT;
  const score = Number(data.score);
  const theme = getReportHeroTheme(score);
  const scoreColor = SCORE_COLORS[theme.tier] ?? "#BA7517";
  const domain = formatReportDomain(data.url);
  const trust = Math.max(0, Math.min(100, Number(data.breakdown?.trust ?? 0)));
  const clarity = Math.max(0, Math.min(100, Number(data.breakdown?.clarity ?? 0)));
  const friction = Math.max(0, Math.min(100, Number(data.breakdown?.friction ?? 0)));
  const hierarchy = Math.max(0, Math.min(100, Number(data.breakdown?.visuals ?? 0)));
  const signalsCount = Math.max(0, Math.min(100, Number(data.confidence ?? 0)));
  const criticalGaps = countCriticalGaps(data.checklist ?? []);
  const displayScore = formatOverallScore(score);
  const potentialScore = formatOverallScore(
    data.score_potential?.target ?? Math.min(10, Number(score) + 1.5)
  );

  const dotStyle = {
    backgroundImage: `radial-gradient(circle, ${RIGHT_COL_DOT} 1px, transparent 1px)`,
    backgroundSize: "16px 16px",
    backgroundColor: "#FAFAFA",
  };

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
          {/* Top bar */}
          <div className="flex items-center justify-between border-b border-[rgba(6,28,47,0.06)] px-4 py-2.5 md:px-5">
            <div className="flex min-w-0 items-center gap-x-2 text-[12px] md:text-[13px]">
              <div className="flex min-w-0 items-center gap-1.5">
                <img
                  src={`https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(data.url)}&sz=32`}
                  alt=""
                  className="h-4 w-4 shrink-0 rounded-sm md:h-[18px] md:w-[18px]"
                />
                <span className="truncate font-medium text-[#1a1a1a]">{domain}</span>
              </div>
              <span
                aria-hidden
                className="mx-1 inline-block h-3.5 w-px shrink-0 bg-[rgba(6,28,47,0.10)]"
              />
              <span className="truncate font-normal text-[rgba(6,28,47,0.4)]">
                {formatAnalyzedDate(data.generatedAt)}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E5E5] bg-white text-[rgba(6,28,47,0.55)]"
                aria-hidden
              >
                <RiShare2Line size={14} />
              </span>
              <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E5E5] bg-white text-[rgba(6,28,47,0.55)]"
                aria-hidden
              >
                <RiFilePdf2Line size={14} />
              </span>
            </div>
          </div>

          {/* 2-col body */}
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_190px] md:grid-cols-[minmax(0,1fr)_210px]">
            {/* Left column */}
            <div className="flex flex-col p-4 md:p-5">
              <div className="flex items-baseline gap-1">
                <span
                  className="text-[34px] font-semibold leading-none tracking-[-0.05em] md:text-[40px]"
                  style={{ color: scoreColor }}
                >
                  {displayScore}
                </span>
                <span className="text-[13px] font-normal text-[rgba(6,28,47,0.35)]">/10</span>
              </div>

              <h2 className="mt-2 line-clamp-2 text-[17px] font-semibold leading-[1.25] tracking-[-0.02em] text-[#061C2F] md:text-[20px] md:leading-[24px]">
                {data.verdict}
              </h2>

              <hr className="-mx-4 mt-4 border-none border-t border-[rgba(6,28,47,0.06)] md:-mx-5" />

              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 md:gap-x-5 md:gap-y-3">
                <MockCompactMetric icon={RiShieldCheckLine} name="Trust" value={trust} />
                <MockCompactMetric icon={RiFocus3Line} name="Clarity" value={clarity} />
                <MockCompactMetric icon={RiBrainLine} name="Friction" value={friction} />
                <MockCompactMetric icon={RiLayoutGridLine} name="Hierarchy" value={hierarchy} />
              </div>

              {signalsCount > 0 ? (
                <div className="mt-4 border-t border-[rgba(6,28,47,0.08)] pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex shrink-0 items-center rounded-md border border-[rgba(6,28,47,0.10)] bg-[rgba(6,28,47,0.04)] px-2 py-0.5 text-[11px] font-medium text-[rgba(6,28,47,0.55)] md:text-[12px]">
                      {signalsCount} signals analysed
                    </span>
                    <span className="hidden text-[11px] text-[rgba(6,28,47,0.45)] sm:inline md:text-[12px]">
                      UI structure, messaging and conversion signals
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Right column */}
            <div
              className="flex flex-col items-center justify-center border-t border-[rgba(6,28,47,0.06)] px-3 py-3 sm:border-l sm:border-t-0"
              style={dotStyle}
            >
              <div className="relative z-[1] w-full max-w-[180px]">
                <div className="overflow-hidden rounded-lg border border-black/[0.08] bg-[#F8FAFC] shadow-[0_8px_28px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-1 border-b border-black/[0.06] bg-white px-2 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FF5F57]" aria-hidden />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FFBD2E]" aria-hidden />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#28CA41]" aria-hidden />
                    <span className="ml-0.5 truncate text-[8px] text-[rgba(6,28,47,0.45)]">
                      {domain}
                    </span>
                  </div>
                  {data.previewImage ? (
                    <img
                      src={data.previewImage}
                      alt=""
                      width={REPORT_PREVIEW_WIDTH}
                      height={REPORT_PREVIEW_HEIGHT}
                      className="block aspect-[620/380] w-full object-cover object-top"
                      draggable={false}
                    />
                  ) : (
                    <div className="aspect-[620/380] w-full bg-gradient-to-b from-[#F8FAFC] to-[#EEF2F7]" />
                  )}
                </div>
              </div>

              <div className="relative z-[1] mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
                {criticalGaps > 0 ? (
                  <div className="inline-flex h-6 items-center gap-1 rounded-full border border-[rgba(185,117,37,0.20)] bg-[#FEF3E2] pl-1 pr-2 text-[11px] font-medium text-[#7A3E00]">
                    <RiErrorWarningFill size={14} className="shrink-0 text-[#BA7517]" aria-hidden />
                    {criticalGaps} critical gap{criticalGaps !== 1 ? "s" : ""}
                  </div>
                ) : null}
                {Number(displayScore) > 0 ? (
                  <div className="inline-flex items-center gap-1 rounded-full bg-[#65982D] px-2 py-1">
                    <span className="text-[11px] font-bold leading-none text-white">
                      {displayScore}
                    </span>
                    <RiArrowRightLine size={10} className="shrink-0 text-white" aria-hidden />
                    <span className="text-[11px] font-bold leading-none text-white">
                      {potentialScore}
                    </span>
                    <span className="mx-0.5 h-3 w-px shrink-0 bg-white/15" aria-hidden />
                    <span className="text-[10px] font-normal leading-none text-white">
                      after fixes
                    </span>
                  </div>
                ) : null}
              </div>
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
