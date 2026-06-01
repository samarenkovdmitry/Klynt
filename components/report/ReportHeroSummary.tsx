"use client";

import type { ReactNode } from "react";

import {
  RiBrainLine,
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
  REPORT_METRIC_DESCRIPTION_CLASS,
  REPORT_SURFACE_SHADOW_CLASS,
} from "@/components/report/reportStyles";
import type {
  ReportBreakdown,
  ReportIssue,
  ReportMetricObservations,
} from "@/lib/audit-report";
import { getMetricObservationFallbacks } from "@/lib/metric-observations";
import { normalizeRisk } from "@/lib/report-metrics";
import {
  formatAnalyzedDate,
  formatOverallScore,
  formatReportDomain,
  formatReportHref,
  getFrictionScore,
  getMetricBarColor,
  getReportHeroTheme,
  getTierLabel,
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

type MetricCardProps = {
  icon: RemixiconComponentType;
  label: string;
  description: string;
  value: number;
};

const HERO_ACTION_BUTTON_CLASS =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-[rgba(6,28,47,0.12)] bg-white px-4 text-[14px] font-medium text-[var(--ink-primary)] transition hover:bg-[#F8FAFC]";

function MetricCard({ icon: Icon, label, description, value }: MetricCardProps) {
  const barColor = getMetricBarColor(value);

  return (
    <div className="flex min-w-0 flex-col md:h-full">
      <div className="flex items-center gap-2">
        <Icon size={18} className="relative top-[1px] shrink-0 text-[#8E99A2]" aria-hidden />
        <p className="text-[16px] font-semibold text-[var(--ink-primary)]">{label}</p>
      </div>

      <p className={REPORT_METRIC_DESCRIPTION_CLASS}>{description}</p>

      <div className="mt-auto flex items-center gap-3">
        <div className="h-[5px] min-w-0 flex-1 overflow-hidden rounded-full bg-[#F5F5F5]">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${value}%`, backgroundColor: barColor }}
          />
        </div>
        <p
          className="shrink-0 text-[12px] font-semibold tabular-nums leading-[18px]"
          style={{ color: barColor }}
        >
          {value}%
        </p>
      </div>
    </div>
  );
}

function getTrustDescription(value: number) {
  return getMetricObservationFallbacks({ trust: value }).trust ?? "";
}

function getClarityDescription(value: number) {
  return getMetricObservationFallbacks({ clarity: value }).clarity ?? "";
}

function getFrictionDescription(value: number, breakdown?: ReportBreakdown) {
  return getMetricObservationFallbacks(breakdown).friction ?? "";
}

function getVisualsDescription(value: number, breakdown?: ReportBreakdown) {
  return getMetricObservationFallbacks(breakdown).visuals ?? "";
}

function isDistinctInsight(insight: string, summary?: string, verdict?: string) {
  if (!insight) return false;

  const normalizedInsight = insight.trim().toLowerCase();
  const normalizedSummary = summary?.trim().toLowerCase() ?? "";
  const normalizedVerdict = verdict?.trim().toLowerCase() ?? "";

  return (
    normalizedInsight !== normalizedSummary && normalizedInsight !== normalizedVerdict
  );
}

function LabeledTakeaway({
  label,
  children,
  className = "mt-3",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`${className} text-[15px] leading-[22px] md:text-[16px] md:leading-[24px]`}
    >
      <span className="font-medium text-[var(--ink-primary)]">{label}</span>
      <span className="text-[rgba(6,28,47,0.5)]"> — {children}</span>
    </p>
  );
}

function ScoreStatusChip({
  score,
  tierLabel,
  badgeBg,
}: {
  score: string;
  tierLabel: string;
  badgeBg: string;
}) {
  return (
    <div
      className="inline-flex h-7 items-center gap-1.5 rounded-full border pl-1 pr-2.5"
      style={{
        borderColor: `${badgeBg}33`,
        backgroundColor: `${badgeBg}14`,
      }}
    >
      <span
        className="inline-flex h-5 min-w-[26px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold leading-none tracking-[-0.03em] text-white"
        style={{ backgroundColor: badgeBg }}
      >
        {score}
      </span>
      <span className="text-[12px] font-medium leading-none" style={{ color: badgeBg }}>
        {tierLabel}
      </span>
    </div>
  );
}

export function ReportHeroSummary({
  url,
  generatedAt,
  score = 0,
  verdict,
  summary,
  risk,
  breakdown,
  confidence = 0,
  keyObservation,
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
  const topIssueTitle = issues[0]?.title?.trim() || verdict?.trim();
  const overallScore = formatOverallScore(score);
  const confidenceValue = Math.max(0, Math.min(100, Number(confidence)));
  const tierLabel = risk ? normalizeRisk(risk) : getTierLabel(theme.tier);
  const trustDescription =
    metricObservations?.trust?.trim() || getTrustDescription(trust);
  const clarityDescription =
    metricObservations?.clarity?.trim() || getClarityDescription(clarity);
  const frictionDescription =
    metricObservations?.friction?.trim() ||
    getFrictionDescription(friction, breakdown);
  const visualsDescription =
    metricObservations?.visuals?.trim() || getVisualsDescription(visuals, breakdown);
  const keyInsight = keyObservation?.trim() ?? "";
  const showKeyInsight = isDistinctInsight(keyInsight, summary, verdict);

  return (
    <div
      className={`overflow-hidden bg-white ${REPORT_HERO_RADIUS_CLASS} ${REPORT_HERO_CARD_BORDER_CLASS} ${REPORT_SURFACE_SHADOW_CLASS}`}
    >
      <div className="relative overflow-hidden">
        <section
          className="relative overflow-hidden px-5 pb-5 pt-5 md:px-[30px] md:pb-6 md:pt-6"
          style={{ backgroundColor: theme.heroBg }}
        >
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-[min(520px,58%)]"
            style={{
              background: `radial-gradient(ellipse 75% 70% at 72% 38%, ${theme.gridColor}66, transparent 72%)`,
            }}
            aria-hidden
          />

          <div className="relative z-[1]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-[14px]">
                <div className="flex min-w-0 items-center gap-2">
                  {url && (
                    <img
                      src={`https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(url)}&sz=32`}
                      alt=""
                      className="h-4 w-4 shrink-0 rounded-sm"
                    />
                  )}
                  {reportHref ? (
                    <a
                      href={reportHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[var(--ink-primary)] transition-opacity hover:opacity-70"
                    >
                      {domain}
                    </a>
                  ) : (
                    <span className="font-medium text-[var(--ink-primary)]">{domain}</span>
                  )}
                </div>

                <span className="hidden h-4 w-px bg-[rgba(6,28,47,0.1)] sm:inline-block" />

                <span className="text-[rgba(6,28,47,0.5)]">
                  {formatAnalyzedDate(generatedAt)}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button type="button" onClick={onShare} className={HERO_ACTION_BUTTON_CLASS}>
                  <RiShare2Line size={16} aria-hidden />
                  Share
                </button>
                <button type="button" onClick={onExport} className={HERO_ACTION_BUTTON_CLASS}>
                  <RiFilePdf2Line size={16} aria-hidden />
                  Export PDF
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-5 md:mt-6 md:flex-row md:items-start md:justify-between md:gap-8">
              <div className="min-w-0 flex-1 md:max-w-[560px]">
                <h1 className="text-[22px] font-bold leading-[1.25] tracking-[-0.01em] text-black md:text-[26px] md:leading-[1.2]">
                  {verdict || "UX assessment complete"}
                </h1>

                <div className="mt-3">
                  <ScoreStatusChip
                    score={overallScore}
                    tierLabel={tierLabel}
                    badgeBg={theme.badgeBg}
                  />
                </div>

                <LabeledTakeaway label="Visitor takeaway" className="mt-4">
                  {summary || "No summary generated."}
                </LabeledTakeaway>

                {showKeyInsight && (
                  <LabeledTakeaway label="Key insight">{keyInsight}</LabeledTakeaway>
                )}
              </div>

              <div className="flex shrink-0 justify-center md:justify-end">
                <ReportPagePreview
                  domain={domain}
                  previewImage={previewImage}
                  topIssueTitle={topIssueTitle}
                  atmosphereColor={`${theme.gridColor}88`}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-6 md:px-[30px] md:py-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-stretch md:gap-6 xl:grid-cols-4">
            <MetricCard
              icon={RiShieldCheckLine}
              label="Trust Signals"
              value={trust}
              description={trustDescription}
            />
            <MetricCard
              icon={RiFocus3Line}
              label="Decision Clarity"
              value={clarity}
              description={clarityDescription}
            />
            <MetricCard
              icon={RiBrainLine}
              label="Cognitive Friction"
              value={friction}
              description={frictionDescription}
            />
            <MetricCard
              icon={RiLayoutGridLine}
              label="Visual Hierarchy"
              value={visuals}
              description={visualsDescription}
            />
          </div>

          <div className="mt-5 md:mt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
              <p className="min-w-0 text-[13px] leading-[18px]">
                <span className="font-medium text-[var(--ink-primary)]">
                  AI confidence: {confidenceValue}%
                </span>
                <span className="font-normal text-[rgba(6,28,47,0.5)]">
                  {" "}
                  – Based on visible UI structure, messaging clarity and conversion signals.
                </span>
              </p>
              <a
                href="https://klynt.one"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 self-start text-[13px] leading-[18px] font-normal text-[rgba(6,28,47,0.5)] transition-opacity hover:opacity-80 md:self-auto"
              >
                Generated with
                <KlyntFooterLogo />
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
