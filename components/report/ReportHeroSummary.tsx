"use client";

import {
  RiBrainLine,
  RiFocus3Line,
  RiShieldCheckLine,
} from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";

import { KlyntFooterLogo } from "@/components/report/KlyntFooterLogo";
import { ReportHeroPattern } from "@/components/report/ReportHeroPattern";
import { ReportPagePreview } from "@/components/report/ReportPagePreview";
import { ReportShareStrip } from "@/components/report/ReportShareStrip";
import type {
  ReportBreakdown,
  ReportIssue,
  ReportMetricObservations,
} from "@/lib/audit-report";
import { getMetricObservationFallbacks } from "@/lib/metric-observations";
import {
  formatAnalyzedDate,
  formatOverallScore,
  formatReportDomain,
  formatReportHref,
  getFrictionScore,
  getMetricBarColor,
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

type MetricCardProps = {
  icon: RemixiconComponentType;
  label: string;
  description: string;
  value: number;
};

function MetricCard({ icon: Icon, label, description, value }: MetricCardProps) {
  const barColor = getMetricBarColor(value);

  return (
    <div className="flex min-w-0 flex-col md:h-full">
      <div className="flex items-center gap-2">
        <Icon size={18} className="shrink-0 text-[#8E99A2]" aria-hidden />
        <p className="text-[16px] font-semibold text-[var(--ink-primary)]">{label}</p>
      </div>

      <p className="mt-3 text-[15px] leading-5 text-[rgba(6,28,47,0.5)]">{description}</p>

      <div className="mt-auto pt-3">
        <p
          className="text-right text-[12px] font-semibold tabular-nums leading-[18px]"
          style={{ color: barColor }}
        >
          {value}%
        </p>
        <div className="mt-1 h-[5px] overflow-hidden rounded-full bg-[#F5F5F5]">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${value}%`, backgroundColor: barColor }}
          />
        </div>
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

export function ReportHeroSummary({
  url,
  generatedAt,
  score = 0,
  verdict,
  summary,
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
  const topIssueTitle = issues[0]?.title;
  const overallScore = formatOverallScore(score);
  const confidenceValue = Math.max(0, Math.min(100, Number(confidence)));
  const fallbacks = getMetricObservationFallbacks(breakdown, verdict);
  const trustDescription =
    metricObservations?.trust?.trim() || getTrustDescription(trust);
  const clarityDescription =
    metricObservations?.clarity?.trim() || getClarityDescription(clarity);
  const frictionDescription =
    metricObservations?.friction?.trim() ||
    getFrictionDescription(friction, breakdown);
  const overallDescription =
    metricObservations?.overall?.trim() || fallbacks.overall || summary || "";

  return (
    <div className="space-y-3">
      <ReportShareStrip onShare={onShare} onExport={onExport} />

      <div className="overflow-hidden rounded-[24px] border border-black/[0.10] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] ring-1 ring-inset ring-black/[0.08] md:rounded-[32px]">
        <div className="relative overflow-hidden">
          <section
            className="relative overflow-hidden px-5 pb-8 pt-6 md:px-[30px] md:pb-8 md:pt-[30px]"
            style={{ backgroundColor: theme.heroBg }}
          >
            <ReportHeroPattern gridColor={theme.gridColor} heroBg={theme.heroBg} />

            <div className="relative z-[1] flex flex-col gap-8 md:flex-row md:items-center md:justify-between md:gap-10">
              <div className="min-w-0 flex-1 md:max-w-[647px] md:pr-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px]">
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

                <h1 className="mt-10 text-[22px] font-bold leading-[1.25] tracking-[-0.01em] text-black md:text-[26px] md:leading-[1.2]">
                  {verdict || "UX assessment complete"}
                </h1>

                <p className="mb-10 mt-2 text-[15px] leading-[19px] text-[rgba(6,28,47,0.5)] md:text-[16px] md:leading-[25px]">
                  {summary || "No summary generated."}
                </p>

                <div className="mt-6 md:mt-8">
                  <p className="text-[14px] text-[rgba(6,28,47,0.5)]">Key Insight</p>
                  <p className="mt-1 text-[16px] leading-[19px] text-[var(--ink-primary)] md:leading-[26px]">
                    {keyObservation || "No key observation available."}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 justify-center md:justify-end">
                <ReportPagePreview
                  previewImage={previewImage}
                  topIssueTitle={topIssueTitle}
                />
              </div>
            </div>
          </section>

          <section className="bg-white px-5 py-6 md:px-[30px] md:py-6">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-stretch xl:grid-cols-4 xl:gap-6">
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

              <div className="flex min-w-0 flex-col md:h-full">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex h-6 min-w-[30px] items-center justify-center rounded-full px-2 text-[12px] font-bold leading-none tracking-[-0.05em] text-white"
                    style={{ backgroundColor: theme.badgeBg }}
                  >
                    {overallScore}
                  </span>
                  <p className="text-[16px] font-semibold text-[var(--ink-primary)]">
                    Overall Assessment
                  </p>
                </div>
                <p className="mt-3 text-[15px] leading-5 text-[rgba(6,28,47,0.5)]">
                  {overallDescription}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-[rgba(32,52,94,0.09)] pt-5 md:mt-6">
              <div className="flex flex-col gap-3 text-[13px] leading-[18px] text-[rgba(6,28,47,0.5)] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2">
                <p className="shrink-0 font-medium">
                  AI confidence:
                  <span className="ml-1 font-semibold text-[var(--ink-primary)]">
                    {confidenceValue}%
                  </span>
                </p>

                <span className="hidden h-4 w-px shrink-0 bg-[rgba(6,28,47,0.1)] sm:inline-block" />

                <p className="min-w-0 flex-1 font-normal">
                  Based on visible UI structure, messaging clarity and conversion signals.
                </p>

                <a
                  href="https://klynt.one"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 font-medium transition-opacity hover:opacity-80"
                >
                  Generated with
                  <KlyntFooterLogo />
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
