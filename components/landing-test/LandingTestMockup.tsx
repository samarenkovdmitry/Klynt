"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  RiArrowRightLine,
  RiArrowUpLine,
  RiShare2Line,
} from "@remixicon/react";

import type { ReportChecklistItem } from "@/lib/audit-report";
import { DEMO_REPORT, DEMO_REPORT_PATH } from "@/lib/demo-report";
import { getVisualFixDimensionLabel } from "@/lib/report-visual-fixes";
import {
  formatOverallScore,
  formatReportDomain,
  getReportHeroTheme,
  getTierLabel,
} from "@/lib/report-hero-theme";
import {
  REPORT_PREVIEW_HEIGHT,
  REPORT_PREVIEW_WIDTH,
} from "@/lib/report-preview-size";

const CARD_CLASS =
  "overflow-hidden rounded-[16px] border border-white/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.24)] ring-1 ring-black/[0.06] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_28px_72px_rgba(0,0,0,0.28)] md:rounded-[20px]";

const textClamp2 = "line-clamp-2";

function getMockVisualFix(data: typeof DEMO_REPORT) {
  const fixes = data.visual_fixes ?? [];
  return (
    fixes.find((fix) => fix.dimension === "social_proof") ??
    fixes.find((fix) => fix.dimension === "navigation") ??
    fixes[0]
  );
}

function sortByImpact(items: ReportChecklistItem[]) {
  return [...items].sort((a, b) => (b.impact_score ?? 0) - (a.impact_score ?? 0));
}

function getCriticalItems(checklist: ReportChecklistItem[]) {
  return sortByImpact(
    checklist.filter((item) => item.status === "missing" || item.status === "weak")
  );
}

function CompactScoreChip({
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
      className="inline-flex h-6 items-center gap-1.5 rounded-full border pl-0.5 pr-2"
      style={{
        borderColor: `${badgeBg}33`,
        backgroundColor: `${badgeBg}0a`,
      }}
    >
      <span
        className="inline-flex h-5 min-w-[26px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold leading-none text-white"
        style={{ backgroundColor: badgeBg }}
      >
        {score}
      </span>
      <span className="text-[11px] font-medium leading-none" style={{ color: badgeBg }}>
        {tierLabel}
      </span>
    </div>
  );
}

function SectionTeaser({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-lg bg-[#FAFBFC] px-2.5 py-2 ring-1 ring-[rgba(6,28,47,0.06)]">
      <p className="text-[10px] font-medium text-[rgba(6,28,47,0.45)]">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function DeltaPill({ value }: { value: number }) {
  return (
    <span className="inline-flex h-[21px] shrink-0 items-center gap-0.5 rounded-full bg-indigo-500/10 py-1 pl-1.5 pr-2 text-[11px] font-bold text-indigo-600">
      <RiArrowUpLine size={14} aria-hidden />
      {value.toFixed(1)}
    </span>
  );
}

function getRecommendedHeadline(data: typeof DEMO_REPORT) {
  const variants = data.copy_variants?.headline?.variants ?? [];
  return variants.find((variant) => variant.recommended)?.text ?? variants[0]?.text ?? "";
}

export function LandingTestMockup() {
  const data = DEMO_REPORT;
  const score = Number(data.score);
  const theme = getReportHeroTheme(score);
  const domain = formatReportDomain(data.url);
  const overallScore = formatOverallScore(score);
  const tierLabel = getTierLabel(theme.tier);
  const potentialTarget = data.score_potential?.target ?? 8.3;
  const potentialScore = formatOverallScore(potentialTarget);
  const scoreDelta = Math.max(0, potentialTarget - score);
  const progressPct = Math.min(100, Math.round((potentialTarget / 10) * 100));
  const criticalItems = getCriticalItems(data.checklist ?? []).slice(0, 3);
  const headlineCurrent = data.copy_variants?.headline?.current ?? "";
  const headlineRecommended = getRecommendedHeadline(data);
  const topVisualFix = getMockVisualFix(data);
  const visualFixTitle = topVisualFix
    ? getVisualFixDimensionLabel(topVisualFix.dimension)
    : "";
  const visualFixDetail = topVisualFix?.observation ?? topVisualFix?.recommendation ?? "";

  return (
    <Link
      href={DEMO_REPORT_PATH}
      id="report"
      className="group relative mx-auto block w-full min-w-0 max-w-full sm:max-w-[560px] lg:max-w-none"
      aria-label={`View sample UX report for ${domain}`}
    >
      <div className={CARD_CLASS} onCopy={(event) => event.preventDefault()}>
        <div
          className="pointer-events-none select-none"
          style={{ WebkitUserSelect: "none", userSelect: "none" }}
        >
          {/* Hero — matches ReportHeroSummary tone */}
          <div className="relative overflow-hidden bg-white px-4 pb-4 pt-4 md:px-5 md:pb-5 md:pt-5">
            <div className="mb-4 flex items-center justify-between gap-3 md:mb-5">
              <p className="text-[12px] font-medium text-[rgba(6,28,47,0.45)] md:text-[13px]">
                Share-ready report
              </p>
              <span
                className="inline-flex h-7 w-7 items-center justify-center text-[rgba(6,28,47,0.35)]"
                aria-hidden
              >
                <RiShare2Line size={15} />
              </span>
            </div>

            <div className="grid min-w-0 items-start gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,200px)] md:grid-cols-[minmax(0,1fr)_minmax(0,220px)] md:gap-5">
              <div className="min-w-0">
                <h2
                  className={`text-[19px] font-bold leading-[1.25] tracking-[-0.01em] text-[#061C2F] md:text-[20px] ${textClamp2}`}
                >
                  {data.verdict}
                </h2>

                <div className="mt-2">
                  <CompactScoreChip
                    score={overallScore}
                    tierLabel={tierLabel}
                    badgeBg={theme.badgeBg}
                  />
                </div>

                <p className="mt-2.5 line-clamp-3 text-[14px] leading-[1.45] text-[rgba(6,28,47,0.5)] md:leading-[20px]">
                  {data.summary ??
                    "Clear fundamentals with fixable conversion gaps ranked by impact."}
                </p>
              </div>

              <div className="mx-auto w-2/3 overflow-hidden rounded-lg border border-black/[0.08] bg-white shadow-[0_8px_28px_rgba(0,0,0,0.05)] sm:mx-0 sm:w-full">
                <div className="flex items-center gap-1.5 border-b border-black/[0.06] bg-white px-2.5 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF5F57]" aria-hidden />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FFBD2E]" aria-hidden />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#28CA41]" aria-hidden />
                  <span className="ml-1 truncate text-[9px] text-[rgba(6,28,47,0.45)]">
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
          </div>

          {/* Close the gap teaser */}
          <div className="border-t border-[rgba(32,52,94,0.08)] bg-white px-4 py-4 md:px-5 md:pb-5">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <p className="shrink-0 text-[12px] font-semibold text-[#061C2F] md:text-[13px]">
                Close the gap
              </p>
              <div className="flex shrink-0 items-center gap-1.5 text-[13px] font-semibold tabular-nums tracking-[-0.02em] md:text-[14px]">
                <span className="text-[rgba(6,28,47,0.45)]">{overallScore}</span>
                <RiArrowRightLine size={14} className="text-[rgba(6,28,47,0.25)]" aria-hidden />
                <span className="text-indigo-600">{potentialScore}</span>
              </div>
            </div>

            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[rgba(6,28,47,0.08)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[rgba(6,28,47,0.2)] to-indigo-500/70"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-[rgba(6,28,47,0.45)] md:text-[12px]">
              +{scoreDelta.toFixed(1)} pts if you fix the top issues
            </p>

            <ul className="mt-3 space-y-2">
              {criticalItems.map((item, index) => (
                <li key={item.id} className="flex min-w-0 items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FAFBFC] text-[10px] font-medium tabular-nums text-[rgba(6,28,47,0.4)] ring-1 ring-[rgba(6,28,47,0.08)]">
                      {index + 1}
                    </span>
                    <p className="truncate text-[13px] font-medium text-[#061C2F]">{item.text}</p>
                  </div>
                  {item.delta != null ? <DeltaPill value={item.delta} /> : null}
                </li>
              ))}
            </ul>

            <div className="mt-3 grid min-w-0 grid-cols-1 gap-2 border-t border-[rgba(32,52,94,0.06)] pt-3 sm:grid-cols-2">
              <SectionTeaser label="Copy studio">
                <p className="line-clamp-2 text-[11px] leading-[15px] text-[rgba(6,28,47,0.35)] line-through decoration-[rgba(6,28,47,0.15)]">
                  {headlineCurrent}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-[15px] text-[#061C2F]">
                  {headlineRecommended}
                </p>
              </SectionTeaser>

              {topVisualFix ? (
                <SectionTeaser label="Visual fixes">
                  <p className="truncate text-[11px] font-semibold leading-[15px] text-[#061C2F]">
                    {visualFixTitle}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-[15px] text-[rgba(6,28,47,0.45)]">
                    {visualFixDetail}
                  </p>
                </SectionTeaser>
              ) : null}
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
