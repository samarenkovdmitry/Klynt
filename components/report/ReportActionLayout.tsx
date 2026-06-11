"use client";

import type { ReactNode } from "react";
import {
  RiArrowRightLine,
  RiBarChartLine,
  RiCheckLine,
  RiDownloadLine,
  RiEditLine,
  RiErrorWarningLine,
  RiFileCopyLine,
  RiLightbulbLine,
  RiRefreshLine,
} from "@remixicon/react";

import { ReportWaitlistGate } from "@/components/report/ReportWaitlistGate";
import type {
  AuditReport,
  ReportBreakdown,
  ReportCopyItem,
  ReportIssue,
  ReportSuggestion,
} from "@/lib/audit-report";
import { getBrandStageLabel, type BrandStage } from "@/lib/brand-stage";
import { getImpactEntries, type ImpactEntry } from "@/lib/report-impact";
import { getPriorityLabel } from "@/lib/report-priority";
import { estimateScorePotential } from "@/lib/report-score-potential";
import {
  formatCopyAfterDisplay,
  formatIssueTitleDisplay,
  formatKeyObservationDisplay,
  formatMetricObservationDisplay,
  formatSummaryDisplay,
  formatVerdictDisplay,
  pickIssueFixDisplay,
} from "@/lib/report-copy-limits";
import {
  formatOverallScore,
  formatReportDateShort,
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
  /** Render only the HeroCard (health bar) — used by new MVP layout */
  heroOnly?: boolean;
};

const CARD_CLASS =
  "overflow-hidden rounded-[20px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05),0_4px_16px_rgba(0,0,0,0.07)]";
const BTN_CLASS =
  "rounded-[8px] bg-black/[0.05] px-[13px] py-1.5 text-[13px] text-[#555] transition-colors hover:bg-black/[0.08]";
const BTN_PRIMARY_CLASS =
  "inline-flex items-center gap-1 rounded-[8px] bg-[#111] px-[15px] py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#2a2a2a]";

function formatDimScore(value: number) {
  return (value / 10).toFixed(1);
}

function getMetricObservation(metric: string, value: number): string {
  if (metric === "clarity") {
    if (value >= 70) return "Headline specific, audience clearly stated";
    if (value >= 40) return "Headline vague, audience not stated";
    return "No clear value prop or audience above fold";
  }
  if (metric === "trust") {
    if (value >= 70) return "Proof signals visible above fold";
    if (value >= 40) return "Trust signals present but below fold";
    return "No credibility signals visible";
  }
  if (metric === "friction") {
    if (value >= 70) return "Clean layout, single clear CTA";
    if (value >= 40) return "Competing elements slow comprehension";
    return "Heavy visual noise, multiple CTAs compete";
  }
  if (metric === "visuals") {
    if (value >= 70) return "Strong hierarchy, clear focal point";
    if (value >= 40) return "Competing elements dilute headline focus";
    return "No clear visual hierarchy or focal point";
  }
  return "";
}

function getReportScoreColor(tier: ReturnType<typeof getReportHeroTheme>["tier"]) {
  if (tier === "healthy") return "#1D9E75";
  if (tier === "critical") return "#8B2020";
  return "#BA7517";
}

function formatPriorityTag(priority?: ReportCopyItem["priority"]) {
  return getPriorityLabel({ priority })
    .replace("Quick Win", "Quick win")
    .replace("High Impact", "High impact")
    .replace("Medium Impact", "Medium impact");
}

function pickIssueFix(
  issue: ReportIssue,
  index: number,
  suggestions: ReportSuggestion[]
) {
  return pickIssueFixDisplay(issue, index, suggestions);
}

function getIssueSeverity(
  issue: ReportIssue,
  index: number,
  breakdown?: ReportBreakdown
) {
  const entry = getImpactEntries(issue, { breakdown, index })[0];
  const magnitude = entry ? Math.abs(entry.value) : 0;
  return magnitude >= 16 ? "critical" : "warning";
}

function ImpactPill({ entry }: { entry: ImpactEntry }) {
  const magnitude = Math.abs(entry.value);
  const metric =
    entry.key.toLowerCase() === "cta"
      ? "conversion"
      : entry.key.toLowerCase();

  const tone =
    magnitude >= 18
      ? "bg-[#FDF0F0] text-[#8B2020]"
      : magnitude >= 12
        ? "bg-[#FDF3E3] text-[#7A4A0A]"
        : "bg-[#EBF3FC] text-[#185FA5]";

  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-medium whitespace-nowrap ${tone}`}
    >
      −{magnitude}% {metric}
    </span>
  );
}

function SectionHead({
  title,
  icon,
  count,
}: {
  title: string;
  icon: ReactNode;
  count?: string;
}) {
  return (
    <div className="mb-3.5 mt-7 flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.07em] text-[#888]">
        {icon}
        {title}
      </span>
      {count ? <span className="text-[12px] text-[#bbb]">{count}</span> : null}
    </div>
  );
}

function HeroCard({
  data,
  onShare,
  onExport,
  onRerun,
  compact,
}: {
  data: AuditReport;
  onShare?: () => void;
  onExport?: () => void;
  onRerun: () => void;
  compact?: boolean;
}) {
  const theme = getReportHeroTheme(data.score);
  const domain = formatReportDomain(data.url);
  const reportHref = formatReportHref(data.url);
  const scoreColor = getReportScoreColor(theme.tier);

  const siteBadge = (
    <div className="inline-flex items-center gap-1.5 rounded-[8px] bg-black/[0.05] px-[11px] py-1 text-[13px] font-medium text-[#555]">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1D9E75]" aria-hidden />
      {reportHref ? (
        <a href={reportHref} target="_blank" rel="noopener noreferrer" className="truncate hover:opacity-70">
          {domain}
        </a>
      ) : (
        <span className="truncate">{domain}</span>
      )}
    </div>
  );

  if (compact) {
    const checklist = data.checklist ?? [];
    const gapsCount = checklist.filter(
      (item) => item.status !== "pass" && item.link_to !== "visual-fixes"
    ).length;
    const visualCount = checklist.filter(
      (item) => item.status !== "pass" && item.link_to === "visual-fixes"
    ).length;
    const scorePercent = data.score > 10 ? data.score : data.score * 10;

    return (
      <div className={CARD_CLASS}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-[0.5px] border-black/[0.08] bg-[#F9F9F9] px-[22px] py-3">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            {siteBadge}
            <span className="hidden text-[12px] text-[#bbb] sm:inline">
              {formatReportDateShort(data.generatedAt)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {onShare ? (
              <button type="button" onClick={onShare} className={BTN_CLASS}>Share</button>
            ) : null}
            {onExport ? (
              <button type="button" onClick={onExport} className={BTN_CLASS}>PDF</button>
            ) : null}
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
            <div className="flex shrink-0 items-baseline">
              <span
                className="text-[40px] font-semibold leading-none tracking-[-0.05em]"
                style={{ color: scoreColor }}
              >
                {formatOverallScore(data.score)}
              </span>
              <span className="ml-0.5 text-[14px] text-[#bbb]">/10</span>
            </div>

            <div className="h-[3px] min-w-[48px] flex-1 rounded-full bg-black/[0.07]">
              <div
                className="h-[3px] rounded-full transition-all duration-700"
                style={{ width: `${scorePercent}%`, backgroundColor: scoreColor }}
              />
            </div>

            <p className="min-w-[160px] flex-[2] text-[15px] font-medium leading-snug tracking-[-0.01em] text-[#111]">
              {formatVerdictDisplay(data.verdict) || "UX assessment complete"}
            </p>
          </div>

          {(gapsCount > 0 || visualCount > 0) && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {gapsCount > 0 && (
                <span className="rounded-full bg-[#FDF3E3] px-[9px] py-1 text-[11px] font-medium text-[#7A4A0A]">
                  {gapsCount} gap{gapsCount !== 1 ? "s" : ""}
                </span>
              )}
              {visualCount > 0 && (
                <span className="rounded-full bg-[#FDF0F0] px-[9px] py-1 text-[11px] font-medium text-[#8B2020]">
                  {visualCount} visual fix{visualCount !== 1 ? "es" : ""}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const breakdown = data.breakdown;
  const clarity = Number(breakdown?.clarity ?? 0);
  const trust = Number(breakdown?.trust ?? 0);
  const friction = getFrictionScore(breakdown);
  const hierarchy = Number(breakdown?.navigation ?? breakdown?.visuals ?? 0);

  const dimensions = [
    { label: "Clarity", value: clarity, observation: getMetricObservation("clarity", clarity) },
    { label: "Trust", value: trust, observation: getMetricObservation("trust", trust) },
    { label: "Friction", value: friction, observation: getMetricObservation("friction", friction) },
    { label: "Hierarchy", value: hierarchy, observation: getMetricObservation("visuals", hierarchy) },
  ];

  return (
    <div className={CARD_CLASS}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-[0.5px] border-black/[0.08] bg-[#F9F9F9] px-[22px] py-3.5">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          {siteBadge}
          <span className="hidden text-[12px] text-[#bbb] sm:inline">
            {formatReportDateShort(data.generatedAt)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {onShare ? (
            <button type="button" onClick={onShare} className={BTN_CLASS}>
              Share
            </button>
          ) : null}
          {onExport ? (
            <button type="button" onClick={onExport} className={BTN_CLASS}>
              Export PDF
            </button>
          ) : null}
          <button type="button" onClick={onRerun} className={BTN_PRIMARY_CLASS}>
            Re-run
            <RiArrowRightLine size={14} aria-hidden />
          </button>
        </div>
      </div>

      <div className="grid gap-8 p-8 md:grid-cols-[1fr_210px]">
        <div>
          <div className="mb-5 flex items-end gap-3.5">
            <div
              className="text-[64px] font-semibold leading-none tracking-[-0.08em] md:text-[88px]"
              style={{ color: scoreColor }}
            >
              {formatOverallScore(data.score)}
            </div>
            <div className="pb-3.5">
              <span className="mb-2 block text-[15px] text-[#bbb]">/ 10</span>
              <span className="inline-block rounded-full bg-[#FDF3E3] px-[11px] py-1 text-[12px] font-medium text-[#7A4A0A]">
                {getTierLabel(theme.tier)}
              </span>
            </div>
          </div>

          <h1 className="mb-4 text-[18px] font-medium leading-[1.35] tracking-[-0.02em] text-[#111] md:text-[22px]">
            {formatVerdictDisplay(data.verdict) || "UX assessment complete"}
          </h1>
          {data.summary ? (
            <p className="text-[14px] leading-[1.8] text-[#555]">
              {formatSummaryDisplay(data.summary)}
            </p>
          ) : null}
        </div>

        {data.key_observation ? (
          <div className="flex flex-col justify-end">
            <div className="rounded-xl bg-[#EBF3FC] px-4 py-3.5">
              <p className="mb-1.5 flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.06em] text-[#0C447C]">
                <RiLightbulbLine size={12} aria-hidden />
                Key insight
              </p>
              <p className="text-[13px] leading-[1.65] text-[#185FA5]">
                {formatKeyObservationDisplay(data.key_observation)}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 border-t-[0.5px] border-black/[0.08] md:grid-cols-4">
        {dimensions.map((dim, index) => (
          <div
            key={dim.label}
            className={[
              "border-black/[0.08] px-[22px] py-[18px]",
              index % 2 === 0 ? "border-r-[0.5px]" : "md:border-r-[0.5px]",
              index < 2 ? "border-b-[0.5px] md:border-b-0" : "",
              index === 1 ? "max-md:border-r-0" : "",
            ].join(" ")}
          >
            <p className="mb-2.5 text-[12px] uppercase tracking-[0.06em] text-[#bbb]">
              {dim.label}
            </p>
            <div className="mb-2.5 h-0.5 rounded-full bg-black/[0.07]">
              <div
                className="h-0.5 rounded-full"
                style={{
                  width: `${dim.value}%`,
                  backgroundColor: getMetricBarColor(dim.value),
                }}
              />
            </div>
            <p className="text-[28px] font-medium tracking-[-0.03em] text-[#111]">
              {formatDimScore(dim.value)}
            </p>
            {dim.observation ? (
              <p className="mt-1 text-[13px] leading-snug text-[#888]">
                {formatMetricObservationDisplay(dim.observation)}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function IssuesCard({
  issues,
  suggestions,
  breakdown,
}: {
  issues: ReportIssue[];
  suggestions: ReportSuggestion[];
  breakdown?: ReportBreakdown;
}) {
  if (issues.length === 0) return null;

  return (
    <div className={CARD_CLASS}>
      {issues.map((issue, index) => {
        const severity = getIssueSeverity(issue, index, breakdown);
        const impactEntry = getImpactEntries(issue, { breakdown, index })[0];
        const fixText = pickIssueFix(issue, index, suggestions);

        return (
          <div
            key={`${issue.title}-${index}`}
            className="border-b-[0.5px] border-black/[0.08] px-[22px] py-5 last:border-b-0"
          >
            <div className="mb-1.5 flex items-start justify-between gap-3">
              <p
                className={[
                  "text-[11px] font-medium uppercase tracking-[0.06em]",
                  severity === "critical" ? "text-[#8B2020]" : "text-[#7A4A0A]",
                ].join(" ")}
              >
                {severity === "critical" ? "Critical" : "Warning"}
              </p>
              {impactEntry ? <ImpactPill entry={impactEntry} /> : null}
            </div>

            <h2 className="mb-2.5 text-[15px] font-medium leading-[1.45] tracking-[-0.01em] text-[#111]">
              {formatIssueTitleDisplay(issue.title)}
            </h2>

            {fixText ? (
              <div className="flex w-full items-start gap-2.5 rounded-[9px] bg-[#EFEFEF] px-3.5 py-2.5">
                <span className="mt-px shrink-0 text-[11px] font-medium uppercase tracking-[0.06em] text-[#0F6E56]">
                  Fix
                </span>
                <p className="min-w-0 flex-1 text-[13px] leading-[1.65] text-[#555]">{fixText}</p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function CopyCard({
  item,
  copyIndex,
  copied,
  onCopy,
}: {
  item: ReportCopyItem;
  copyIndex: number;
  copied: boolean;
  onCopy: (text: string, index: number) => void;
}) {
  return (
    <div className={CARD_CLASS}>
      <div className="flex items-center justify-between border-b-[0.5px] border-black/[0.08] bg-[#F9F9F9] px-[18px] py-[11px]">
        <span className="text-[12px] font-medium text-[#888]">
          {item.section || "Copy"}
        </span>
        <span className="rounded-[5px] bg-[#E1F5EE] px-[9px] py-0.5 text-[12px] text-[#0F6E56]">
          {formatPriorityTag(item.priority)}
        </span>
      </div>
      <div className="grid md:grid-cols-2">
        <div className="border-black/[0.08] px-[18px] py-4 md:border-r-[0.5px]">
          <p className="mb-2 text-[12px] text-[#bbb]">Current</p>
          <p className="text-[13px] leading-[1.55] text-[#bbb] line-through">
            {item.before || "—"}
          </p>
        </div>
        <div className="border-t-[0.5px] border-black/[0.08] px-[18px] py-4 md:border-t-0">
          <p className="mb-2 text-[12px] text-[#bbb]">Improved</p>
          <div className="group relative">
            <p className="pr-8 text-[14px] font-medium leading-[1.5] tracking-[-0.01em] text-[#111]">
              {formatCopyAfterDisplay(item.after) || "—"}
            </p>
            {item.after ? (
              <button
                type="button"
                onClick={() => onCopy(item.after ?? "", copyIndex)}
                className="absolute top-0 right-0 flex h-[26px] w-[26px] items-center justify-center rounded-[6px] border-[0.5px] border-black/[0.13] bg-[#F9F9F9] text-[#888] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[#EFEFEF]"
                aria-label="Copy improved text"
              >
                {copied ? <RiCheckLine size={14} /> : <RiFileCopyLine size={14} />}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeadlineDirectionsCard({
  directions,
  brandStage,
  copiedIndex,
  copyIndexOffset,
  onCopy,
}: {
  directions: NonNullable<AuditReport["headline_directions"]>;
  brandStage?: BrandStage;
  copiedIndex: number | null;
  copyIndexOffset: number;
  onCopy: (text: string, index: number) => void;
}) {
  const options = directions.options ?? [];
  if (options.length === 0) return null;

  return (
    <div className={`${CARD_CLASS} mb-4`}>
      <div className="flex items-center justify-between border-b-[0.5px] border-black/[0.08] bg-[#F9F9F9] px-[18px] py-[11px]">
        <span className="text-[12px] font-medium text-[#888]">
          Hero headline — {options.length} directions
        </span>
        <span className="rounded-[5px] bg-[#E1F5EE] px-[9px] py-0.5 text-[12px] text-[#0F6E56]">
          {brandStage ? getBrandStageLabel(brandStage) : "Headline"}
        </span>
      </div>
      <div className="grid md:grid-cols-3">
        {options.map((option, index) => {
          const copyIndex = copyIndexOffset + index;
          const copied = copiedIndex === copyIndex;

          return (
            <div
              key={`${option.label}-${index}`}
              className={[
                "px-[18px] py-4",
                index > 0 ? "border-black/[0.08] max-md:border-t-[0.5px] md:border-l-[0.5px]" : "",
              ].join(" ")}
            >
              <p className="mb-2 text-[12px] text-[#bbb]">
                Option {String.fromCharCode(65 + index)} — {option.label}
              </p>
              <div className="group relative">
                <p className="pr-8 text-[14px] font-medium leading-[1.5] tracking-[-0.01em] text-[#111]">
                  {formatCopyAfterDisplay(option.text)}
                </p>
                <button
                  type="button"
                  onClick={() => onCopy(option.text, copyIndex)}
                  className="absolute top-0 right-0 flex h-[26px] w-[26px] items-center justify-center rounded-[6px] border-[0.5px] border-black/[0.13] bg-[#F9F9F9] text-[#888] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[#EFEFEF]"
                  aria-label="Copy headline option"
                >
                  {copied ? <RiCheckLine size={14} /> : <RiFileCopyLine size={14} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScorePotentialCard({
  data,
  issues,
}: {
  data: AuditReport;
  issues: ReportIssue[];
}) {
  if (issues.length === 0) return null;

  const potential = estimateScorePotential(
    data.score,
    issues,
    data.breakdown,
    data.suggestions ?? []
  );
  const theme = getReportHeroTheme(data.score);

  return (
    <div className={CARD_CLASS}>
      <div className="flex flex-wrap items-center gap-5 border-b-[0.5px] border-black/[0.08] px-8 py-7">
        <div className="text-center">
          <p
            className="text-[40px] font-semibold leading-none tracking-[-0.06em] md:text-[52px]"
            style={{ color: getReportScoreColor(theme.tier) }}
          >
            {formatOverallScore(potential.currentScore)}
          </p>
          <p className="mt-1 text-[12px] text-[#bbb]">Current</p>
        </div>

        <RiArrowRightLine size={22} className="text-[#bbb]" aria-hidden />

        <div className="text-center">
          <p
            className="text-[40px] font-semibold leading-none tracking-[-0.06em] md:text-[52px]"
            style={{ color: "#1D9E75" }}
          >
            {formatOverallScore(potential.potentialScore)}
          </p>
          <p className="mt-1 text-[12px] text-[#bbb]">After fixes</p>
        </div>

        <div className="hidden h-[52px] w-px bg-black/[0.08] md:block" />

        <div className="min-w-0 flex-1 basis-full md:basis-auto">
          <p className="text-[16px] font-medium tracking-[-0.02em] text-[#111]">
            {potential.leverageTitle}
          </p>
          <p className="mt-1 text-[13px] leading-[1.65] text-[#555]">
            {potential.leverageDetail}
          </p>
        </div>
      </div>

      {potential.fixItems.length > 0 ? (
        <div className="grid gap-2.5 px-6 py-5 md:grid-cols-3">
          {potential.fixItems.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="rounded-xl bg-[#EFEFEF] px-4 py-3.5"
            >
              <p className="mb-1 text-[11px] uppercase tracking-[0.05em] text-[#bbb]">
                {item.label}
              </p>
              <p className="text-[13px] leading-[1.45] text-[#111]">{item.text}</p>
              <p className="mt-2 text-[16px] font-medium text-[#1D9E75]">{item.points}</p>
            </div>
          ))}
        </div>
      ) : null}
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
    <div className="grid gap-2 md:grid-cols-2">
      <button
        type="button"
        onClick={onRerun}
        className="rounded-2xl border border-[#1D9E75]/35 bg-white px-5 py-4 text-left transition-colors hover:bg-[#FAFAFA]"
      >
        <RiRefreshLine size={18} className="mb-2 text-[#1D9E75]" aria-hidden />
        <p className="text-[14px] font-medium tracking-[-0.02em] text-[#111]">
          Re-run after fixing
        </p>
        <p className="mt-1 text-[12px] leading-[1.5] text-[#888]">
          Apply the changes above, then re-run to track your score improvement.
        </p>
      </button>

      {onExport ? (
        <button
          type="button"
          onClick={onExport}
          className="rounded-2xl bg-white px-5 py-4 text-left transition-colors hover:bg-[#FAFAFA]"
        >
          <RiDownloadLine size={18} className="mb-2 text-[#888]" aria-hidden />
          <p className="text-[14px] font-medium tracking-[-0.02em] text-[#111]">Export PDF</p>
          <p className="mt-1 text-[12px] leading-[1.5] text-[#888]">
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
  heroOnly,
}: ReportActionLayoutProps) {
  if (heroOnly) {
    return <HeroCard data={data} onShare={onShare} onExport={onExport} onRerun={onRerun} compact />;
  }

  const issues = data.issues ?? [];
  const suggestions = data.suggestions ?? [];
  const copyItems = data.copy ?? [];
  const headlineDirections = data.headline_directions;
  const gridCopy = copyItems.slice(0, 2);
  const headlineCopyOffset = 100;

  if (issues.length === 0) {
    return (
      <HeroCard data={data} onShare={onShare} onExport={onExport} onRerun={onRerun} />
    );
  }

  return (
    <div className="space-y-0">
      <HeroCard data={data} onShare={onShare} onExport={onExport} onRerun={onRerun} />

      <SectionHead
        title="UX issues"
        icon={<RiErrorWarningLine size={15} className="text-[#888]" aria-hidden />}
        count={`${issues.length} friction point${issues.length === 1 ? "" : "s"} · ranked by impact`}
      />
      <IssuesCard issues={issues} suggestions={suggestions} breakdown={data.breakdown} />

      {waitlistActive ? (
        <div className="mt-8">
          <ReportWaitlistGate
            reportId={routeParam}
            locked={lockedSummary}
            onUnlock={onUnlock}
          />
        </div>
      ) : (
        <>
          {copyItems.length > 0 || headlineDirections ? (
            <>
              <SectionHead
                title="Copy refinement"
                icon={<RiEditLine size={15} className="text-[#888]" aria-hidden />}
                count="paste-ready rewrites"
              />
              {gridCopy.length > 0 ? (
                <div className="mb-2.5 grid gap-2.5 md:grid-cols-2">
                  {gridCopy.map((item, index) => (
                    <CopyCard
                      key={`${item.section}-${index}`}
                      item={item}
                      copyIndex={index}
                      copied={copiedIndex === index}
                      onCopy={onCopy}
                    />
                  ))}
                </div>
              ) : null}
              {headlineDirections ? (
                <HeadlineDirectionsCard
                  directions={headlineDirections}
                  brandStage={data.brand_stage}
                  copiedIndex={copiedIndex}
                  copyIndexOffset={headlineCopyOffset}
                  onCopy={onCopy}
                />
              ) : null}
            </>
          ) : null}

          <SectionHead
            title="Score potential"
            icon={<RiBarChartLine size={15} className="text-[#888]" aria-hidden />}
          />
          <ScorePotentialCard data={data} issues={issues} />

          <div className="mt-2.5">
            <WhatsNextRow onRerun={onRerun} onExport={onExport} />
          </div>
        </>
      )}
    </div>
  );
}
