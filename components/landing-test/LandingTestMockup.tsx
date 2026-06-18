"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  RiArrowRightLine,
  RiArrowRightSLine,
  RiBrainLine,
  RiFilePdf2Line,
  RiFocus3Line,
  RiLayoutGridLine,
  RiShare2Line,
  RiShieldCheckLine,
} from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";

import { DEMO_REPORT, DEMO_REPORT_PATH } from "@/lib/demo-report";
import { STATUS_COLORS } from "@/lib/status-colors";
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
  healthy:  STATUS_COLORS.good,
  medium:   STATUS_COLORS.weak,
  critical: STATUS_COLORS.low,
};

const RIGHT_COL_DOT = "rgba(0,0,0,0.10)";

const SECTION_LINK_CLASS =
  "inline-flex shrink-0 items-center gap-0 text-[13px] font-medium whitespace-nowrap";

function getMetricStatus(value: number): { label: string; color: string } {
  if (value >= 70) return { label: "Good",   color: STATUS_COLORS.good };
  if (value >= 55) return { label: "Medium", color: STATUS_COLORS.medium };
  if (value >= 35) return { label: "Weak",   color: STATUS_COLORS.weak };
  return            { label: "Low",    color: STATUS_COLORS.low };
}

function MockMetricBar({
  icon: Icon,
  name,
  value,
}: {
  icon: RemixiconComponentType;
  name: string;
  value: number;
}) {
  const { label, color } = getMetricStatus(value);

  return (
    <div>
      <div className="flex items-center justify-between gap-1">
        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[#061C2F] md:gap-2 md:text-[13px]">
          <Icon size={13} className="shrink-0 text-[#8E99A2]" aria-hidden />
          {name}
        </span>
        <span className="text-[11px] font-semibold md:text-[12px]" style={{ color }}>
          {label}
        </span>
      </div>
      <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-[rgba(6,28,47,0.08)] md:mt-2">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function SectionLink({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={[SECTION_LINK_CLASS, className].filter(Boolean).join(" ")}>
      {children}
      <RiArrowRightSLine size={16} className="text-current" aria-hidden />
    </span>
  );
}

function countCriticalGaps(checklist: typeof DEMO_REPORT.checklist) {
  return checklist.filter((item) => item.status === "missing" || item.status === "weak")
    .length;
}

function truncateTeaser(text: string, maxLength = 22) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
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
  const visualInsightCount = Math.min(data.visual_fixes?.length ?? 0, 2);
  const displayScore = formatOverallScore(score);
  const potentialScore = formatOverallScore(
    data.score_potential?.target ?? Math.min(10, Number(score) + 1.5)
  );
  const headlineVariant =
    data.copy_variants?.headline?.variants?.find(
      (variant) => variant.label === "Outcome + audience"
    ) ?? data.copy_variants?.headline?.variants?.[2];
  const trustTeaser = truncateTeaser(data.meta?.proof_suggestion ?? "Add customer logos below CTA");

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

          {/* Hero summary */}
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_200px] md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="flex flex-col p-4 md:p-5">
              <div className="flex items-baseline gap-1">
                <span
                  className="text-[34px] font-semibold leading-none tracking-[-0.05em]"
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

              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 md:gap-x-5 md:gap-y-3.5">
                <MockMetricBar icon={RiShieldCheckLine} name="Trust" value={trust} />
                <MockMetricBar icon={RiFocus3Line} name="Clarity" value={clarity} />
                <MockMetricBar icon={RiBrainLine} name="Friction" value={friction} />
                <MockMetricBar icon={RiLayoutGridLine} name="Hierarchy" value={hierarchy} />
              </div>

              {signalsCount > 0 ? (
                <div className="mt-4 border-t border-[rgba(6,28,47,0.08)] pt-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex shrink-0 items-center rounded-md border border-[rgba(6,28,47,0.10)] bg-[rgba(6,28,47,0.04)] px-2 py-0.5 text-[11px] font-medium text-[rgba(6,28,47,0.55)] md:text-[12px]">
                      {signalsCount} signals analysed
                    </span>
                    <span className="text-[11px] text-[rgba(6,28,47,0.45)] md:text-[12px]">
                      UI structure, messaging and conversion signals
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            <div
              className="flex flex-col items-center justify-center border-t border-[rgba(6,28,47,0.06)] px-3 py-4 sm:border-l sm:border-t-0"
              style={dotStyle}
            >
              <div className="w-full max-w-[180px] overflow-hidden rounded-lg border border-black/[0.08] bg-[#F8FAFC] shadow-[0_8px_28px_rgba(0,0,0,0.05)]">
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
                  <div className="aspect-[620/380] w-full bg-[#F7F5FF]" />
                )}
              </div>

              {Number(displayScore) > 0 ? (
                <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-status-good px-2.5 py-[5px]">
                  <span className="text-[11px] font-bold leading-none text-white md:text-[12px]">
                    {displayScore}
                  </span>
                  <RiArrowRightLine size={10} className="shrink-0 text-white" aria-hidden />
                  <span className="text-[11px] font-bold leading-none text-white md:text-[12px]">
                    {potentialScore}
                  </span>
                  <span className="mx-0.5 h-3.5 w-px shrink-0 bg-white/15" aria-hidden />
                  <span className="text-[10px] font-normal leading-none text-white md:text-[11px]">
                    after fixes
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Report sections preview */}
          <div className="border-t border-[rgba(6,28,47,0.06)]">
            <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-5 md:py-3.5">
              <span className="text-[14px] font-semibold text-[#061C2F]">What needs fixing</span>
              {criticalGaps > 0 ? (
                <SectionLink className="text-status-weak">
                  {criticalGaps} critical gap{criticalGaps !== 1 ? "s" : ""}
                </SectionLink>
              ) : null}
            </div>

            <div className="border-t border-[rgba(6,28,47,0.06)] px-4 py-3 md:px-5 md:py-3.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[14px] font-semibold text-[#061C2F]">Copy studio</span>
                <SectionLink className="text-[rgba(6,28,47,0.45)]">More variants</SectionLink>
              </div>
              {headlineVariant ? (
                <div className="mt-2.5 rounded-[10px] border border-[rgba(32,52,94,0.08)] bg-[#F8FAFC] px-3 py-2.5 md:mt-3 md:px-3.5 md:py-3">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[rgba(6,28,47,0.45)] md:text-[12px]">
                    <span>Headline</span>
                    <span className="text-[rgba(6,28,47,0.20)]">|</span>
                    <span>{headlineVariant.label}</span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.45] text-[#061C2F] md:text-[14px] md:leading-5">
                    {headlineVariant.text}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-1 border-t border-[rgba(6,28,47,0.06)] sm:grid-cols-2">
              <div className="flex items-center justify-between gap-3 px-4 py-3 sm:border-r sm:border-[rgba(6,28,47,0.06)] md:px-5 md:py-3.5">
                <span className="text-[14px] font-semibold text-[#061C2F]">Visual fixes</span>
                {visualInsightCount > 0 ? (
                  <SectionLink className="text-status-good">
                    {visualInsightCount} insight{visualInsightCount !== 1 ? "s" : ""}
                  </SectionLink>
                ) : null}
              </div>
              <div className="flex min-w-0 items-center justify-between gap-3 border-t border-[rgba(6,28,47,0.06)] px-4 py-3 sm:border-t-0 md:px-5 md:py-3.5">
                <span className="shrink-0 text-[14px] font-semibold text-[#061C2F]">
                  Trust &amp; meta
                </span>
                <span className="truncate text-[13px] text-[rgba(6,28,47,0.45)]">
                  {trustTeaser}
                </span>
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
