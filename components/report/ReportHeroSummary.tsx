import {
  RiBrainLine,
  RiFocus3Line,
  RiShieldCheckLine,
} from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";

import { ReportHeroGrid } from "@/components/report/ReportHeroGrid";
import { ReportPagePreview } from "@/components/report/ReportPagePreview";
import { ReportShareStrip } from "@/components/report/ReportShareStrip";
import type { ReportBreakdown, ReportIssue } from "@/lib/audit-report";
import {
  formatAnalyzedDate,
  formatOverallScore,
  formatReportDomain,
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
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <Icon size={18} className="shrink-0 text-[#8E99A2]" aria-hidden />
        <p className="text-[16px] font-semibold text-[var(--ink-primary)]">{label}</p>
        <p
          className="ml-auto text-[12px] font-semibold tabular-nums"
          style={{ color: barColor }}
        >
          {value}%
        </p>
      </div>

      <p className="mt-3 text-[14px] leading-5 text-[rgba(6,28,47,0.5)]">{description}</p>

      <div className="mt-3 h-[5px] overflow-hidden rounded-full bg-[rgba(6,28,47,0.06)]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}

function getTrustDescription(value: number) {
  if (value >= 70) return "Feels polished and credible from the first screen.";
  if (value >= 40) return "Some trust signals are present, but not immediately convincing.";
  return "Trust cues are weak or missing at the first impression.";
}

function getClarityDescription(value: number) {
  if (value >= 70) return "The primary action and value are easy to grasp quickly.";
  if (value >= 40) {
    return "Users may need extra scanning before understanding the primary action.";
  }
  return "The page makes users work too hard to understand what to do next.";
}

function getFrictionDescription(value: number) {
  if (value >= 70) return "Multiple competing elements reduce focus on the core value proposition.";
  if (value >= 40) return "Noticeable friction slows comprehension in key sections.";
  return "Heavy cognitive load makes the experience feel harder than it should.";
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
  issues = [],
  onShare,
  onExport,
}: ReportHeroSummaryProps) {
  const theme = getReportHeroTheme(score);
  const domain = formatReportDomain(url);
  const trust = Math.max(0, Math.min(100, Number(breakdown?.trust ?? 0)));
  const clarity = Math.max(0, Math.min(100, Number(breakdown?.clarity ?? 0)));
  const friction = Math.max(0, Math.min(100, getFrictionScore(breakdown)));
  const topIssueTitle = issues[0]?.title;
  const overallScore = formatOverallScore(score);
  const confidenceValue = Math.max(0, Math.min(100, Number(confidence)));

  return (
    <div className="space-y-3">
      <ReportShareStrip onShare={onShare} onExport={onExport} />

      <div className="overflow-hidden rounded-[24px] border border-black/[0.07] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] md:rounded-[32px]">
        <div className="relative overflow-hidden">
          <section
            className="relative px-5 pb-8 pt-6 md:px-[30px] md:pb-8 md:pt-[30px]"
            style={{ backgroundColor: theme.heroBg }}
          >
            <ReportHeroGrid gridColor={theme.gridColor} />

            <div className="relative z-[1] flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
              <div className="min-w-0 flex-1 lg:max-w-[647px]">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px]">
                  <div className="flex min-w-0 items-center gap-2">
                    {url && (
                      <img
                        src={`https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(url)}&sz=32`}
                        alt=""
                        className="h-4 w-4 shrink-0 rounded-sm"
                      />
                    )}
                    <span className="font-medium text-[var(--ink-primary)]">{domain}</span>
                  </div>
                  <span className="hidden h-4 w-px bg-[rgba(6,28,47,0.1)] sm:inline-block" />
                  <span className="text-[rgba(6,28,47,0.5)]">
                    {formatAnalyzedDate(generatedAt)}
                  </span>
                </div>

                <h1 className="mt-5 text-[22px] font-bold leading-[1.25] tracking-[-0.01em] text-black md:text-[26px] md:leading-[1.2]">
                  {verdict || "UX assessment complete"}
                </h1>

                <p className="mt-4 text-[15px] leading-[25px] text-[rgba(6,28,47,0.5)] md:text-[16px]">
                  {summary || "No summary generated."}
                </p>

                <div className="mt-6 md:mt-8">
                  <p className="text-[14px] text-[rgba(6,28,47,0.5)]">Key Insight</p>
                  <p className="mt-1 text-[16px] leading-[26px] text-[var(--ink-primary)]">
                    {keyObservation || "No key observation available."}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 justify-center lg:justify-end lg:pt-2">
                <ReportPagePreview url={url} topIssueTitle={topIssueTitle} />
              </div>
            </div>
          </section>

          <section className="border-t border-[var(--stroke-light)] bg-white px-5 py-6 md:px-[30px] md:py-6">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4 xl:gap-6">
              <MetricCard
                icon={RiShieldCheckLine}
                label="Trust Signals"
                value={trust}
                description={getTrustDescription(trust)}
              />
              <MetricCard
                icon={RiFocus3Line}
                label="Decision Clarity"
                value={clarity}
                description={getClarityDescription(clarity)}
              />
              <MetricCard
                icon={RiBrainLine}
                label="Cognitive Friction"
                value={friction}
                description={getFrictionDescription(friction)}
              />

              <div className="min-w-0">
                <div className="flex items-start gap-2">
                  <span
                    className="mt-0.5 inline-flex h-[21px] min-w-[30px] items-center justify-center rounded-full px-2 text-[12px] font-bold tracking-[-0.05em] text-white"
                    style={{ backgroundColor: theme.badgeBg }}
                  >
                    {overallScore}
                  </span>
                  <p className="text-[16px] font-semibold text-[var(--ink-primary)]">
                    Overall Assessment
                  </p>
                </div>
                <p className="mt-3 text-[14px] leading-5 text-[rgba(6,28,47,0.5)]">
                  {verdict || "UX assessment complete"}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-[var(--stroke-light)] pt-5 md:mt-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14px] text-[rgba(6,28,47,0.5)]">
                  AI confidence:
                  <span className="ml-1 font-semibold text-[var(--ink-primary)]">
                    {confidenceValue}%
                  </span>
                </p>
                <p className="hidden text-[12px] text-[rgba(6,28,47,0.45)] sm:block">
                  Generated with Klynt
                </p>
              </div>

              <div className="mt-3 h-[5px] overflow-hidden rounded-full bg-[rgba(6,28,47,0.06)]">
                <div
                  className="h-full rounded-full bg-[#061C2F] transition-all duration-700"
                  style={{ width: `${confidenceValue}%` }}
                />
              </div>

              <p className="mt-2 text-[12px] leading-[18px] text-[rgba(6,28,47,0.45)]">
                Based on visible UI structure, messaging clarity and conversion signals.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
