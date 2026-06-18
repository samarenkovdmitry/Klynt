"use client";

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
import {
  formatAnalyzedDate,
  formatOverallScore,
  formatReportDomain,
  formatReportHref,
  getFrictionScore,
  getReportHeroTheme,
} from "@/lib/report-hero-theme";
import { STATUS_COLORS } from "@/lib/status-colors";

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
  /** Count of non-pass checklist items (replaces issues.length for new reports) */
  criticalCount?: number;
  /** Count of "missing" checklist items */
  missingCount?: number;
  /** Count of "weak" checklist items */
  weakCount?: number;
  /** Potential score after fixes (from score_potential.target) */
  scorePotential?: number;
  onShare: () => void;
  onExport: () => void;
};

const HERO_ACTION_BUTTON_CLASS =
  "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border border-[#E5E5E5] bg-white px-3.5 text-[14px] font-medium text-[#061C2F] transition-[background-color,box-shadow] hover:bg-[#F8F9FA] hover:shadow-[0_1px_4px_rgba(6,28,47,0.08)]";

const SCORE_COLORS: Record<string, string> = {
  healthy:  STATUS_COLORS.good,
  medium:   STATUS_COLORS.weak,
  critical: STATUS_COLORS.low,
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
  if (value >= 70) return { label: "Good",   color: STATUS_COLORS.good };
  if (value >= 55) return { label: "Medium", color: STATUS_COLORS.medium };
  if (value >= 35) return { label: "Weak",   color: STATUS_COLORS.weak };
  return            { label: "Low",    color: STATUS_COLORS.low };
}

function CompactMetric({
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
    <div className="flex flex-col gap-[5px]">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-[8px] text-[14px] font-semibold text-[#061C2F]">
          <Icon size={14} color="#8E99A2" aria-hidden />
          {name}
        </span>
        <span className="text-[13px] font-semibold" style={{ color }}>
          {label}
        </span>
      </div>
      <div className="my-[1px] h-[3px] overflow-hidden rounded-full bg-[rgba(6,28,47,0.08)]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[13px] font-normal leading-[18px] text-[rgba(6,28,47,0.45)]">
        {shortDesc}
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
  issues = [],
  criticalCount,
  missingCount,
  weakCount,
  scorePotential,
  onShare,
  onExport,
}: ReportHeroSummaryProps) {
  const theme = getReportHeroTheme(score);
  const scoreColor = SCORE_COLORS[theme.tier] ?? "#BA7517";
  const domain = formatReportDomain(url);
  const reportHref = formatReportHref(url);
  const trust = Math.max(0, Math.min(100, Number(breakdown?.trust ?? 0)));
  const clarity = Math.max(0, Math.min(100, Number(breakdown?.clarity ?? 0)));
  const friction = Math.max(0, Math.min(100, getFrictionScore(breakdown)));
  const visuals = Math.max(0, Math.min(100, Number(breakdown?.visuals ?? 0)));
  const signalsCount = Math.max(0, Math.min(100, Number(confidence)));
  const criticalGaps = criticalCount ?? issues.length;

  const displayScore = parseFloat(formatOverallScore(score));
  const potentialScore =
    scorePotential != null
      ? formatOverallScore(scorePotential)
      : Math.min(10, displayScore + 1.5).toFixed(1);

  const dotStyle = {
    backgroundImage: `radial-gradient(circle, ${RIGHT_COL_DOT} 1px, transparent 1px)`,
    backgroundSize: "16px 16px",
    backgroundColor: "#FAFAFA",
  };

  return (
    <div
      className={`overflow-hidden bg-white ${REPORT_HERO_RADIUS_CLASS} ${REPORT_HERO_CARD_BORDER_CLASS} ${REPORT_SURFACE_SHADOW_CLASS}`}
    >
      {/* ── TOP BAR ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[rgba(6,28,47,0.06)] px-5 py-3 md:px-[30px]">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[14px]">
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
          <span
            aria-hidden
            className="mx-[4px] hidden h-[16px] w-[1px] shrink-0 bg-[rgba(6,28,47,0.10)] md:inline-block"
          />
          <span className="font-normal text-[rgba(6,28,47,0.4)]">
            {formatAnalyzedDate(generatedAt)}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onShare}
            className={HERO_ACTION_BUTTON_CLASS}
            aria-label="Share report"
          >
            <RiShare2Line size={16} aria-hidden />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button
            type="button"
            onClick={onExport}
            className={HERO_ACTION_BUTTON_CLASS}
            aria-label="Export PDF"
          >
            <RiFilePdf2Line size={16} aria-hidden />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>

      {/* ── HERO 2-COL GRID ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_324px] lg:grid-cols-[1fr_356px]">

        {/* LEFT COLUMN */}
        <div className="flex flex-col p-5 md:px-[30px] md:py-5">

          {/* Score */}
          <div className="flex items-baseline gap-[5px]">
            <span
              className="font-semibold leading-none"
              style={{ fontSize: 40, letterSpacing: "-2px", color: scoreColor }}
            >
              {formatOverallScore(score)}
            </span>
            <span className="text-[14px] font-normal text-[rgba(6,28,47,0.35)]" style={{ fontVariantNumeric: "proportional-nums lining-nums" }}>/10</span>
          </div>

          {/* Verdict headline */}
          <h1 className="mt-[8px] text-[24px] font-semibold leading-[28px] tracking-[-0.02em] text-[#061C2F]">
            {verdict || "UX assessment complete"}
          </h1>

          {/* Divider — bleeds to card edges */}
          <hr className="-mx-5 mt-[20px] border-none border-t border-[rgba(6,28,47,0.06)] md:-mx-[30px]" style={{ borderTopWidth: "1px" }} />

          {/* 2×2 metrics grid */}
          <div className="mt-[10px] mb-6 grid grid-cols-2 gap-x-[30px] gap-y-3">
            <CompactMetric icon={RiShieldCheckLine} name="Trust" value={trust} />
            <CompactMetric icon={RiFocus3Line} name="Clarity" value={clarity} />
            <CompactMetric icon={RiBrainLine} name="Friction" value={friction} />
            <CompactMetric icon={RiLayoutGridLine} name="Hierarchy" value={visuals} />
          </div>

          {/* Signals — pinned to bottom of left column */}
          {signalsCount > 0 && (
            <div className="mt-auto -mx-5 border-t border-[rgba(6,28,47,0.08)] px-5 pt-4 md:-mx-[30px] md:px-[30px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex shrink-0 items-center rounded-md border border-[rgba(6,28,47,0.10)] bg-[rgba(6,28,47,0.04)] px-2 py-[3px] text-[13px] font-medium text-[rgba(6,28,47,0.55)]">
                  {signalsCount} signals analysed
                </span>
                <span className="text-[13px] text-[rgba(6,28,47,0.45)]">
                  UI structure, messaging and conversion signals
                </span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN — screenshot + dot bg */}
        <div
          className="relative flex flex-col items-center justify-center border-t border-[rgba(6,28,47,0.06)] px-3 py-4 md:border-l md:border-t-0"
          style={dotStyle}
        >
          <div className="relative z-[1] w-full">
            <ReportPagePreview
              domain={domain}
              previewImage={previewImage}
              topIssueTitle={undefined}
            />
          </div>

          {/* Pills row: critical gaps + score improvement */}
          <div className="relative z-[1] mt-[10px] flex flex-wrap items-center justify-center gap-2">
            {criticalGaps > 0 && (
              <div className="inline-flex h-6 items-center gap-1 rounded-full border border-[rgba(185,117,37,0.20)] bg-[#FEF3E2] pl-1 pr-2 text-[13px] font-medium text-[#7A3E00]">
                <RiErrorWarningFill size={16} className="shrink-0 text-status-weak" aria-hidden />
                <span style={{ position: "relative", top: -1 }}>
                  {criticalGaps} critical gap{criticalGaps !== 1 ? "s" : ""}
                </span>
              </div>
            )}
            {displayScore > 0 && (
              <div className="inline-flex items-center gap-1 rounded-full bg-status-good px-2 py-[5px]">
                <span className="text-[13px] font-bold leading-none text-white">
                  {formatOverallScore(score)}
                </span>
                <RiArrowRightLine size={12} className="shrink-0 text-white" aria-hidden />
                <span className="text-[13px] font-bold leading-none text-white">
                  {potentialScore}
                </span>
                <span className="mx-0.5 h-4 w-px shrink-0 bg-[rgba(255,255,255,0.15)]" aria-hidden />
                <span className="text-[13px] font-normal leading-none text-white">
                  after fixes
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
