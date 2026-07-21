"use client";

import { RiFilePdf2Line, RiShare2Line } from "@remixicon/react";

import { ReportPagePreview } from "@/components/report/ReportPagePreview";
import { ScoreStatusChip } from "@/components/report/ScoreStatusChip";
import {
  REPORT_HERO_CARD_BORDER_CLASS,
  REPORT_HERO_RADIUS_CLASS,
  REPORT_SURFACE_SHADOW_CLASS,
} from "@/components/report/reportStyles";
import {
  formatAnalyzedDate,
  formatOverallScore,
  formatReportDomain,
  formatReportHref,
  getReportHeroTheme,
  getTierLabel,
} from "@/lib/report-hero-theme";

type ReportHeroSummaryProps = {
  url?: string;
  generatedAt?: string;
  score?: number;
  verdict?: string;
  summary?: string;
  previewImage?: string;
  onShare: () => void;
  onExport: () => void;
};

const HERO_ACTION_BUTTON_CLASS =
  "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-white/90 text-[14px] font-medium text-[var(--ink-primary)] shadow-[0_1px_3px_rgba(6,28,47,0.08)] transition-[background-color,box-shadow] hover:bg-white hover:shadow-[0_2px_8px_rgba(6,28,47,0.12)] w-9 px-0 sm:w-auto sm:px-4";

const HERO_GRID_LINE = "rgba(6,28,47,0.07)";
const HERO_GRID_SIZE = "24px 24px";
const HERO_GRID_POSITION = "0 7px";
const HERO_GRID_MASK =
  "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 24%, #000 46%, #000 100%)";

function HeroGridPattern() {
  const gridStyle = {
    backgroundImage: `linear-gradient(${HERO_GRID_LINE} 1px, transparent 1px), linear-gradient(90deg, ${HERO_GRID_LINE} 1px, transparent 1px)`,
    backgroundSize: HERO_GRID_SIZE,
    backgroundPosition: HERO_GRID_POSITION,
    WebkitMaskImage: HERO_GRID_MASK,
    maskImage: HERO_GRID_MASK,
  } as const;

  return (
    <div
      className="pointer-events-none absolute -right-3 -top-3 bottom-0 hidden w-[min(512px,calc(54%+12px))] md:block"
      style={gridStyle}
      aria-hidden
    />
  );
}

export function ReportHeroSummary({
  url,
  generatedAt,
  score = 0,
  verdict,
  summary,
  previewImage,
  onShare,
  onExport,
}: ReportHeroSummaryProps) {
  const theme = getReportHeroTheme(score);
  const domain = formatReportDomain(url);
  const reportHref = formatReportHref(url);
  const overallScore = formatOverallScore(score);
  const tierLabel = getTierLabel(theme.tier);

  return (
    <div
      className={`overflow-hidden bg-white ${REPORT_HERO_RADIUS_CLASS} ${REPORT_HERO_CARD_BORDER_CLASS} ${REPORT_SURFACE_SHADOW_CLASS}`}
    >
      <div className="relative overflow-hidden">
        <section
          className="relative overflow-hidden px-5 pb-5 pt-5 md:px-[30px] md:pb-7 md:pt-6"
          style={{ backgroundColor: theme.heroBg }}
        >
          <HeroGridPattern />

          <div className="relative z-[1]">
            <div className="relative min-h-9 sm:flex sm:min-h-0 sm:items-center sm:justify-between sm:gap-4">
              <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 pr-[5.25rem] text-[14px] sm:pr-0">
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

              <div className="absolute right-0 top-0 flex shrink-0 items-center gap-1.5 sm:static sm:gap-2 sm:justify-end">
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

            <div className="mt-5 flex flex-col gap-5 md:mt-6 md:flex-row md:items-start md:justify-between md:gap-8">
              <div className="min-w-0 flex-1 md:max-w-[560px]">
                <h1 className="text-[22px] font-bold leading-[1.2] tracking-[-0.01em] text-black md:text-[26px] md:leading-[1.2] md:tracking-[-0.01em]">
                  {verdict || "UX assessment complete"}
                </h1>

                <div className="mt-3">
                  <ScoreStatusChip
                    score={overallScore}
                    tierLabel={tierLabel}
                    badgeBg={theme.badgeBg}
                  />
                </div>

                <p className="mt-3 max-w-[560px] text-[16px] leading-6 text-[rgba(6,28,47,0.5)]">
                  {summary || "No summary generated."}
                </p>
              </div>

              <div className="flex shrink-0 justify-center md:justify-end">
                <ReportPagePreview domain={domain} previewImage={previewImage} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
