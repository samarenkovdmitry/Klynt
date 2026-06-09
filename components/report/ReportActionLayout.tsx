"use client";

import {
  RiArrowRightLine,
  RiCheckLine,
  RiFilePdf2Line,
  RiRefreshLine,
  RiShare2Line,
} from "@remixicon/react";

import { ImpactPercentageBadges } from "@/components/report/ImpactBadges";
import { ReportWaitlistGate } from "@/components/report/ReportWaitlistGate";
import {
  REPORT_CARD_CLASS,
  REPORT_HERO_RADIUS_CLASS,
  REPORT_SURFACE_BORDER_CLASS,
  REPORT_SURFACE_SHADOW_CLASS,
} from "@/components/report/reportStyles";
import type {
  AuditReport,
  ReportBreakdown,
  ReportCopyItem,
  ReportIssue,
} from "@/lib/audit-report";
import { getImpactEntries, type ImpactEntry } from "@/lib/report-impact";
import {
  estimateScorePotential,
  pickTopIssueCopy,
} from "@/lib/report-score-potential";
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

type ReportActionLayoutProps = {
  data: AuditReport;
  routeParam: string;
  waitlistActive: boolean;
  copiedIndex: number | null;
  lockedSummary: {
    domain: string;
    remainingIssues: number;
    remainingSuggestions: number;
    remainingCopy: number;
  };
  onCopy: (text: string, index: number) => void;
  onShare?: () => void;
  onExport?: () => void;
  onRerun: () => void;
  onUnlock: () => void;
};

const SECTION_LABEL_CLASS =
  "mb-3 text-[11px] font-medium uppercase tracking-[0.06em] text-[#8E99A2]";

const SURFACE_CLASS = [
  "overflow-hidden bg-white",
  REPORT_HERO_RADIUS_CLASS,
  REPORT_SURFACE_BORDER_CLASS,
  REPORT_SURFACE_SHADOW_CLASS,
].join(" ");

function formatDimScore(value: number) {
  return (value / 10).toFixed(1);
}

function CompactImpactPill({ entry }: { entry: ImpactEntry }) {
  const magnitude = Math.abs(entry.value);
  const tone =
    magnitude >= 18
      ? "bg-[#FCEBEB] text-[#A32D2D]"
      : magnitude >= 12
        ? "bg-[#FAEEDA] text-[#854F0B]"
        : "bg-[#E6F1FB] text-[#185FA5]";

  const metric =
    entry.key.toLowerCase() === "cta"
      ? "CTA"
      : entry.key.charAt(0).toUpperCase() + entry.key.slice(1);

  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${tone}`}
    >
      −{magnitude}% {metric}
    </span>
  );
}

function DimensionMiniBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const color = getMetricBarColor(value);

  return (
    <div className="rounded-xl bg-[#F8FAFC] px-2.5 py-2">
      <p className="text-[11px] text-[#8E99A2]">{label}</p>
      <div className="mt-1 h-[3px] overflow-hidden rounded-full bg-[rgba(6,28,47,0.08)]">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <p className="mt-1 text-[12px] font-semibold tabular-nums text-[var(--ink-primary)]">
        {formatDimScore(value)}
      </p>
    </div>
  );
}

function ReportScoreStrip({
  data,
  onShare,
  onExport,
}: {
  data: AuditReport;
  onShare?: () => void;
  onExport?: () => void;
}) {
  const theme = getReportHeroTheme(data.score);
  const domain = formatReportDomain(data.url);
  const reportHref = formatReportHref(data.url);
  const breakdown = data.breakdown;
  const clarity = Number(breakdown?.clarity ?? 0);
  const trust = Number(breakdown?.trust ?? 0);
  const friction = getFrictionScore(breakdown);
  const hierarchy = Number(breakdown?.navigation ?? breakdown?.visuals ?? 0);
  const verdictLine = [getTierLabel(theme.tier), data.summary?.trim()]
    .filter(Boolean)
    .join(" — ");

  return (
    <div className={SURFACE_CLASS}>
      <div className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:gap-6 md:p-6">
        <div className="flex items-start justify-between gap-4 md:block">
          <div className="flex items-baseline gap-1">
            <span
              className="text-[48px] font-semibold leading-none tabular-nums"
              style={{ color: theme.badgeBg }}
            >
              {formatOverallScore(data.score)}
            </span>
            <span className="text-[24px] text-[#8E99A2]">/10</span>
          </div>

          {(onShare || onExport) && (
            <div className="flex shrink-0 gap-1.5 md:hidden">
              {onShare ? (
                <button
                  type="button"
                  onClick={onShare}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(6,28,47,0.08)] bg-white"
                  aria-label="Share report"
                >
                  <RiShare2Line size={16} />
                </button>
              ) : null}
              {onExport ? (
                <button
                  type="button"
                  onClick={onExport}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(6,28,47,0.08)] bg-white"
                  aria-label="Export PDF"
                >
                  <RiFilePdf2Line size={16} />
                </button>
              ) : null}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[13px] text-[rgba(6,28,47,0.55)]">
                {reportHref ? (
                  <a
                    href={reportHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[var(--ink-primary)] hover:opacity-70"
                  >
                    {domain}
                  </a>
                ) : (
                  <span className="font-medium text-[var(--ink-primary)]">{domain}</span>
                )}
                {domain ? " · " : ""}
                {formatAnalyzedDate(data.generatedAt)}
              </p>
              <p className="mt-1 text-[15px] font-medium leading-snug text-[var(--ink-primary)]">
                {verdictLine || data.verdict || "UX assessment complete"}
              </p>
            </div>

            {(onShare || onExport) && (
              <div className="hidden shrink-0 gap-1.5 md:flex">
                {onShare ? (
                  <button
                    type="button"
                    onClick={onShare}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[rgba(6,28,47,0.08)] bg-white px-3 text-[13px] font-medium"
                  >
                    <RiShare2Line size={15} />
                    Share
                  </button>
                ) : null}
                {onExport ? (
                  <button
                    type="button"
                    onClick={onExport}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[rgba(6,28,47,0.08)] bg-white px-3 text-[13px] font-medium"
                  >
                    <RiFilePdf2Line size={15} />
                    Export
                  </button>
                ) : null}
              </div>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <DimensionMiniBar label="Clarity" value={clarity} />
            <DimensionMiniBar label="Trust" value={trust} />
            <DimensionMiniBar label="Friction" value={friction} />
            <DimensionMiniBar label="Hierarchy" value={hierarchy} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TopIssueCard({
  issue,
  breakdown,
  copyItem,
  copied,
  onCopy,
}: {
  issue: ReportIssue;
  breakdown?: ReportBreakdown;
  copyItem: ReportCopyItem | null;
  copied: boolean;
  onCopy: (text: string) => void;
}) {
  const impactEntries = getImpactEntries(issue, { breakdown, index: 0 });
  const description = issue.why?.trim() || "";

  return (
    <div className={SURFACE_CLASS}>
      <div className="border-b border-[rgba(6,28,47,0.06)] p-5 md:p-6">
        {impactEntries.length > 0 ? (
          <div className="mb-3">
            <ImpactPercentageBadges entries={impactEntries} />
          </div>
        ) : null}
        <h2 className="text-[17px] font-semibold leading-snug tracking-[-0.01em] text-[var(--ink-primary)]">
          {issue.title}
        </h2>
        {description ? (
          <p className="mt-2 text-[13px] leading-relaxed text-[rgba(6,28,47,0.58)]">
            {description}
          </p>
        ) : null}
      </div>

      {copyItem?.after ? (
        <div className="bg-[#F8FAFC] p-5 md:p-6">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.05em] text-[#8E99A2]">
            Ready to use
          </p>
          <div className="grid gap-3 md:grid-cols-2 md:gap-4">
            <div>
              <p className="mb-1.5 text-[11px] text-[#8E99A2]">Current</p>
              <p className="text-[13px] leading-relaxed text-[rgba(6,28,47,0.45)] line-through">
                {copyItem.before || "—"}
              </p>
            </div>
            <div>
              <p className="mb-1.5 text-[11px] text-[#8E99A2]">Improved</p>
              <p className="text-[13px] font-medium leading-relaxed text-[var(--ink-primary)]">
                {copyItem.after}
              </p>
              <button
                type="button"
                onClick={() => onCopy(copyItem.after ?? "")}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[rgba(6,28,47,0.08)] bg-white px-2.5 py-1 text-[12px] font-medium text-[rgba(6,28,47,0.72)] transition-colors hover:bg-[#F8FAFC]"
              >
                {copied ? <RiCheckLine size={14} /> : null}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CompactIssuesList({
  issues,
  breakdown,
}: {
  issues: ReportIssue[];
  breakdown?: ReportBreakdown;
}) {
  if (issues.length === 0) return null;

  return (
    <div className={SURFACE_CLASS}>
      {issues.map((issue, index) => {
        const impactEntry = getImpactEntries(issue, {
          breakdown,
          index: index + 1,
        })[0];

        return (
          <div
            key={`${issue.title}-${index}`}
            className="flex items-start gap-3 border-b border-[rgba(6,28,47,0.06)] px-4 py-3 last:border-b-0"
          >
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
              style={{
                backgroundColor: impactEntry
                  ? getMetricBarColor(100 - Math.abs(impactEntry.value))
                  : "#8E99A2",
              }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium leading-snug text-[var(--ink-primary)]">
                {issue.title}
              </p>
              {issue.why ? (
                <p className="mt-0.5 text-[12px] leading-relaxed text-[rgba(6,28,47,0.55)]">
                  {issue.why}
                </p>
              ) : null}
            </div>
            {impactEntry ? <CompactImpactPill entry={impactEntry} /> : null}
          </div>
        );
      })}
    </div>
  );
}

function ScorePotentialBlock({
  data,
  issues,
}: {
  data: AuditReport;
  issues: ReportIssue[];
}) {
  if (issues.length === 0) return null;

  const potential = estimateScorePotential(data.score, issues, data.breakdown);
  const theme = getReportHeroTheme(data.score);
  const targetTheme = getReportHeroTheme(potential.potentialScore);

  return (
    <div className="flex flex-col gap-4 rounded-[20px] bg-[#F8FAFC] p-4 md:flex-row md:items-center md:gap-5 md:p-5">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p
            className="text-[28px] font-semibold leading-none tabular-nums"
            style={{ color: theme.badgeBg }}
          >
            {formatOverallScore(potential.currentScore)}
          </p>
          <p className="mt-1 text-[11px] text-[#8E99A2]">Current</p>
        </div>
        <RiArrowRightLine size={18} className="text-[#8E99A2]" aria-hidden />
        <div className="text-center">
          <p
            className="text-[28px] font-semibold leading-none tabular-nums"
            style={{ color: targetTheme.badgeBg }}
          >
            {formatOverallScore(potential.potentialScore)}
          </p>
          <p className="mt-1 text-[11px] text-[#8E99A2]">
            After {potential.fixCount} fixes
          </p>
        </div>
      </div>

      <div className="min-w-0 flex-1 border-t border-[rgba(6,28,47,0.08)] pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
        <p className="text-[13px] font-medium text-[var(--ink-primary)]">
          {potential.leverageTitle}
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-[rgba(6,28,47,0.55)]">
          {potential.leverageDetail}
        </p>
      </div>
    </div>
  );
}

function WhatsNextRow({
  onRerun,
  onExport,
}: {
  onRerun: () => void;
  onExport?: () => void;
}) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      <button
        type="button"
        onClick={onRerun}
        className={`${REPORT_CARD_CLASS} text-left !rounded-[18px] !border-[#1D9E75] !px-4 !py-3.5`}
      >
        <RiRefreshLine size={18} className="mb-2 text-[#1D9E75]" aria-hidden />
        <p className="text-[13px] font-semibold text-[var(--ink-primary)]">Re-run after fixing</p>
        <p className="mt-1 text-[12px] leading-relaxed text-[rgba(6,28,47,0.55)]">
          Apply the top fix, then re-run to track your score improvement.
        </p>
      </button>

      {onExport ? (
        <button
          type="button"
          onClick={onExport}
          className={`${REPORT_CARD_CLASS} text-left !rounded-[18px] !px-4 !py-3.5`}
        >
          <RiFilePdf2Line size={18} className="mb-2 text-[#8E99A2]" aria-hidden />
          <p className="text-[13px] font-semibold text-[var(--ink-primary)]">Export PDF</p>
          <p className="mt-1 text-[12px] leading-relaxed text-[rgba(6,28,47,0.55)]">
            Share the full report with your team or client in one click.
          </p>
        </button>
      ) : null}
    </div>
  );
}

export function ReportActionLayout({
  data,
  routeParam,
  waitlistActive,
  copiedIndex,
  lockedSummary,
  onCopy,
  onShare,
  onExport,
  onRerun,
  onUnlock,
}: ReportActionLayoutProps) {
  const issues = data.issues ?? [];
  const topIssue = issues[0];
  const otherIssues = issues.slice(1);
  const topCopy = pickTopIssueCopy(data);

  return (
    <div className="space-y-8">
      <div>
        <p className={SECTION_LABEL_CLASS}>Report</p>
        <ReportScoreStrip data={data} onShare={onShare} onExport={onExport} />
      </div>

      {topIssue ? (
        <>
          <div>
            <p className={SECTION_LABEL_CLASS}>Top issue — fix this first</p>
            <TopIssueCard
              issue={topIssue}
              breakdown={data.breakdown}
              copyItem={topCopy}
              copied={copiedIndex === 0}
              onCopy={(text) => onCopy(text, 0)}
            />
          </div>

          {waitlistActive ? (
            <ReportWaitlistGate
              reportId={routeParam}
              locked={lockedSummary}
              onUnlock={onUnlock}
            />
          ) : (
            <>
              {otherIssues.length > 0 ? (
                <div>
                  <p className={SECTION_LABEL_CLASS}>
                    {otherIssues.length} more issue{otherIssues.length === 1 ? "" : "s"}
                  </p>
                  <CompactIssuesList issues={otherIssues} breakdown={data.breakdown} />
                </div>
              ) : null}

              <div>
                <p className={SECTION_LABEL_CLASS}>Score potential</p>
                <ScorePotentialBlock data={data} issues={issues} />
              </div>

              <div>
                <p className={SECTION_LABEL_CLASS}>What&apos;s next</p>
                <WhatsNextRow onRerun={onRerun} onExport={onExport} />
              </div>
            </>
          )}
        </>
      ) : null}
    </div>
  );
}
