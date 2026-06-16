"use client";

import {
  RiBrainLine,
  RiErrorWarningLine,
  RiFilePdf2Line,
  RiFocus3Line,
  RiLayoutGridLine,
  RiShare2Line,
  RiShieldCheckLine,
} from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";

import { KlyntFooterLogo } from "@/components/report/KlyntFooterLogo";
import { ReportPagePreview } from "@/components/report/ReportPagePreview";
import {
  REPORT_HERO_CARD_BORDER_CLASS,
  REPORT_HERO_RADIUS_CLASS,
  REPORT_SURFACE_SHADOW_CLASS,
} from "@/components/report/reportStyles";
import type {
  ReportBreakdown,
  ReportIssue,
  ReportMetricObservations,
} from "@/lib/audit-report";
import { getMetricObservationFallbacks } from "@/lib/metric-observations";
import {
  formatAnalyzedDate,
  formatReportDomain,
  formatReportHref,
  getFrictionScore,
  getReportHeroTheme,
} from "@/lib/report-hero-theme";

type ReportHeroSummaryProps = {
  url?: string;
  generatedAt?: string;
  score?: number;
  verdict?: string;
  summary?: string;
  risk?: string;
  breakdown?: ReportBreakdown;
  confidence?: number;
  keyObservation?: string;
  previewImage?: string;
  metricObservations?: ReportMetricObservations;
  issues?: ReportIssue[];
  onShare: () => void;
  onExport: () => void;
};

const HERO_ACTION_BUTTON_CLASS =
  "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full border border-[rgba(6,28,47,0.12)] bg-white px-3 text-[13px] font-medium text-[rgba(6,28,47,0.7)] transition-[background-color,box-shadow] hover:bg-[#F8F9FA] hover:shadow-[0_1px_4px_rgba(6,28,47,0.08)]";

const HERO_GRID_LINE = "rgba(6,28,47,0.06)";

function getMetricStatus(value: number): { label: string; color: string } {
  if (value >= 70) return { label: "Good", color: "#639922" };
  if (value >= 55) return { label: "Medium", color: "#BA7517" };
  if (value >= 35) return { label: "Weak", color: "#BA7517" };
  return { label: "Low", color: "#E24B4A" };
}

function CompactMetric({
  icon: Icon,
  name,
  value,
  description,
}: {
  icon: RemixiconComponentType;
  name: string;
  value: number;
  description: string;
}) {
  const { label, color } = getMetricStatus(value);

  return (
    <div className="flex flex-col gap-[5px]">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-[4px] text-[11px] text-[rgba(6,28,47,0.5)]">
          <Icon size={12} aria-hidden />
          {name}
        </span>
        <span className="text-[11px] font-medium" style={{ color }}>
          {label}
        </span>
      </div>
      <div className="h-[2px] overflow-hidden rounded-full bg-[#EBEBEA]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[12px] leading-[1.4] text-[rgba(6,28,47,0.45)]">
        {description}
      </span>
    </div>
  );
}

export function ReportHeroSummary({
  url,
  generatedAt,
  score = 0,
  verdict,
  breakdown,
  confidence = 0,
  previewImage,
  metricObservations,
  issues = [],
  onShare,
  onExport,
}: ReportHeroSummaryProps) {
  const theme = getReportHeroTheme(score);
  const domain = formatReportDomain(url);
  const reportHref = formatReportHref(url);
  const trust = Math.max(0, Math.min(100, Number(breakdown?.trust ?? 0)));
  const clarity = Math.max(0, Math.min(100, Number(breakdown?.clarity ?? 0)));
  const friction = Math.max(0, Math.min(100, getFrictionScore(breakdown)));
  const visuals = Math.max(0, Math.min(100, Number(breakdown?.visuals ?? 0)));
  const topIssueTitle = issues[0]?.title?.trim();
  const signalsCount = Math.max(0, Math.min(100, Number(confidence)));
  const criticalGaps = issues.length;

  const trustDesc = metricObservations?.trust?.trim() || getMetricObservationFallbacks({ trust }).trust || "";
  const clarityDesc = metricObservations?.clarity?.trim() || getMetricObservationFallbacks({ clarity }).clarity || "";
  const frictionDesc = metricObservations?.friction?.trim() || getMetricObservationFallbacks(breakdown).friction || "";
  const visualsDesc = metricObservations?.visuals?.trim() || getMetricObservationFallbacks(breakdown).visuals || "";

  const gridStyle = {
    backgroundImage: `linear-gradient(${HERO_GRID_LINE} 1px, transparent 1px), linear-gradient(90deg, ${HERO_GRID_LINE} 1px, transparent 1px)`,
    backgroundSize: "24px 24px",
  };

  return (
    <div
      className={`overflow-hidden bg-white ${REPORT_HERO_RADIUS_CLASS} ${REPORT_HERO_CARD_BORDER_CLASS} ${REPORT_SURFACE_SHADOW_CLASS}`}
    >
      {/* ── TOP BAR ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[rgba(6,28,47,0.06)] px-5 py-3 md:px-[30px]">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
          <div className="flex min-w-0 items-center gap-1.5">
            {url && (
              <img
                src={`https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(url)}&sz=32`}
                alt=""
                className="h-[18px] w-[18px] shrink-0 rounded-sm"
              />
            )}
            {reportHref ? (
              <a
                href={reportHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#1a1a1a] transition-opacity hover:opacity-70"
              >
                {domain}
              </a>
            ) : (
              <span className="font-medium text-[#1a1a1a]">{domain}</span>
            )}
          </div>
          <span className="text-[rgba(6,28,47,0.4)]">
            · {formatAnalyzedDate(generatedAt)}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onShare}
            className={HERO_ACTION_BUTTON_CLASS}
            aria-label="Share report"
          >
            <RiShare2Line size={14} aria-hidden />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button
            type="button"
            onClick={onExport}
            className={HERO_ACTION_BUTTON_CLASS}
            aria-label="Export PDF"
          >
            <RiFilePdf2Line size={14} aria-hidden />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>

      {/* ── HERO 2-COL GRID ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] lg:grid-cols-[1fr_220px]">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-3.5 p-5 md:px-[30px] md:py-5">

          {/* Critical gaps badge */}
          {criticalGaps > 0 && (
            <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#FEF3E2] px-3 py-1 text-[11px] font-medium text-[#7A3E00]">
              <RiErrorWarningLine size={13} className="text-[#BA7517]" aria-hidden />
              {criticalGaps} critical gap{criticalGaps !== 1 ? "s" : ""}
            </div>
          )}

          {/* Verdict headline */}
          <h1 className="text-[17px] font-medium leading-[1.38] tracking-[-0.01em] text-[#1a1a1a]">
            {verdict || "UX assessment complete"}
          </h1>

          {/* Divider — bleeds to card edges */}
          <hr className="-mx-5 border-none border-t border-[rgba(6,28,47,0.06)] md:-mx-[30px]" style={{ borderTopWidth: "0.5px" }} />

          {/* 2×2 metrics grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <CompactMetric
              icon={RiShieldCheckLine}
              name="Trust"
              value={trust}
              description={trustDesc}
            />
            <CompactMetric
              icon={RiFocus3Line}
              name="Clarity"
              value={clarity}
              description={clarityDesc}
            />
            <CompactMetric
              icon={RiBrainLine}
              name="Friction"
              value={friction}
              description={frictionDesc}
            />
            <CompactMetric
              icon={RiLayoutGridLine}
              name="Hierarchy"
              value={visuals}
              description={visualsDesc}
            />
          </div>
        </div>

        {/* RIGHT COLUMN — screenshot + grid bg */}
        <div
          className="relative flex flex-col items-stretch border-t border-[rgba(6,28,47,0.06)] bg-[#FAFAF9] px-3 pb-2 pt-3 md:border-l md:border-t-0"
          style={gridStyle}
        >
          <div className="relative z-[1] flex-1">
            <ReportPagePreview
              domain={domain}
              previewImage={previewImage}
              topIssueTitle={undefined}
            />
          </div>

          {topIssueTitle && (
            <p className="relative z-[1] px-1 pb-1 pt-0 text-center text-[10px] leading-[1.4] text-[rgba(6,28,47,0.45)]">
              Top issue:{" "}
              <span className="font-medium text-[#BA7517]">{topIssueTitle}</span>
            </p>
          )}
        </div>
      </div>

      {/* ── BOTTOM ROW ──────────────────────────────────────── */}
      <div className="flex flex-col gap-3 border-t border-[rgba(6,28,47,0.06)] px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:px-[30px]">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {signalsCount > 0 && (
            <span className="inline-flex shrink-0 items-center rounded-md border border-[rgba(6,28,47,0.10)] bg-[#F5F5F4] px-2 py-[3px] text-[11px] font-medium text-[rgba(6,28,47,0.55)]">
              {signalsCount} signals analysed
            </span>
          )}
          <span className="text-[12px] text-[rgba(6,28,47,0.45)]">
            UI structure, messaging and conversion signals
          </span>
        </div>

        <a
          href="https://klynt.one"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 self-start text-[12px] font-normal text-[rgba(6,28,47,0.45)] transition-opacity hover:opacity-80 sm:self-auto"
        >
          Generated with
          <KlyntFooterLogo />
        </a>
      </div>
    </div>
  );
}
