"use client";

import Link from "next/link";
import {
  RiArrowUpLine,
  RiContrastLine,
  RiGroupLine,
  RiShare2Line,
  type RemixiconComponentType,
} from "@remixicon/react";

import { ScoreStatusChip } from "@/components/report/ScoreStatusChip";
import { DEMO_REPORT, DEMO_REPORT_PATH } from "@/lib/demo-report";
import {
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

const SURFACE_CARD_CLASS =
  "rounded-[10px] border border-[rgba(6,28,47,0.06)] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)]";

const MOCK_SCORE = 6.5;

/** Static landing preview copy — matches Mainpage Zeplin card, not live demo report body. */
const LANDING_REPORT_MOCK = {
  verdict: "Unverified privacy claims and hidden pricing block conversion.",
  summary:
    "A first-time visitor reads a clean, confident privacy pitch and feels mildly persuaded but not yet ready to commit, because the pag...",
  gapItems: [
    { text: "Pricing hidden until signup blocks comparison", delta: 0.8 },
    { text: "Privacy claims not backed by visible proof", delta: 0.8 },
  ],
  visualCards: [
    {
      title: "Text contrast",
      icon: RiContrastLine,
      impact: "medium" as const,
      description: "The light gray subheadline sits below the 4.5:1 contrast threshold...",
    },
    {
      title: "Add proof",
      icon: RiGroupLine,
      impact: "medium" as const,
      description: "No visible customer logos, stats, or testimonials above the fold.",
    },
  ],
};

function DeltaPill({ value }: { value: number }) {
  return (
    <span className="inline-flex h-[21px] shrink-0 items-center gap-0.5 rounded-full bg-[rgba(29,158,117,0.07)] py-1 pl-[7px] pr-2.5 text-[11px] font-bold text-[#1D9E75]">
      <RiArrowUpLine size={14} aria-hidden />
      {value.toFixed(1)}
    </span>
  );
}

function MockVisualFixCard({
  title,
  icon: Icon,
  description,
}: {
  title: string;
  icon: RemixiconComponentType;
  description: string;
}) {
  return (
    <div className={`${SURFACE_CARD_CLASS} rounded-[12px] px-[18px] py-4`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Icon size={16} className="shrink-0 text-[#5B6378]" aria-hidden />
          <p className="text-[14px] font-semibold leading-[19px] tracking-[-0.01em] text-[#061C2F]">
            {title}
          </p>
        </div>
        <span className="inline-flex h-[21px] shrink-0 items-center rounded-full bg-[#FFF6D8] px-2 text-[11px] font-bold lowercase text-[#B8790E]">
          medium
        </span>
      </div>
      <p className="mt-1 text-[14px] leading-5 text-[#6B7488]">{description}</p>
    </div>
  );
}

export function LandingTestMockup() {
  const theme = getReportHeroTheme(MOCK_SCORE);
  const domain = formatReportDomain(DEMO_REPORT.url);

  return (
    <Link
      href={DEMO_REPORT_PATH}
      id="report"
      className="group relative mx-auto block max-w-[560px] lg:max-w-none"
      aria-label={`View sample UX report for ${domain}`}
    >
      <div className={CARD_CLASS} onCopy={(event) => event.preventDefault()}>
        <div
          className="pointer-events-none select-none"
          style={{ WebkitUserSelect: "none", userSelect: "none" }}
        >
          <div className="flex flex-col gap-5 p-5">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium leading-[19.5px] text-[rgba(6,28,47,0.45)]">
                Share-ready report
              </p>
              <span className="inline-flex h-7 w-7 items-center justify-center text-[rgba(6,28,47,0.35)]">
                <RiShare2Line size={15} aria-hidden />
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_220px]">
              <div className="min-w-0">
                <ScoreStatusChip
                  score={MOCK_SCORE.toFixed(1)}
                  tierLabel={getTierLabel(theme.tier)}
                  badgeBg={theme.badgeBg}
                />

                <h2 className="mt-2 line-clamp-2 text-[20px] font-bold leading-[25px] tracking-[-0.01em] text-[#061C2F]">
                  {LANDING_REPORT_MOCK.verdict}
                </h2>

                <p className="mt-2 line-clamp-3 text-[14px] leading-5 text-[rgba(6,28,47,0.5)]">
                  {LANDING_REPORT_MOCK.summary}
                </p>
              </div>

              <div className="mx-auto w-full max-w-[220px] sm:mx-0 sm:justify-self-end">
                <div className="overflow-hidden rounded-[10px] border border-black/[0.08] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center gap-1 border-b border-black/[0.06] bg-white px-2 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FF5F57]" aria-hidden />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FFBD2E]" aria-hidden />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#28CA41]" aria-hidden />
                    <span className="ml-0.5 truncate text-[9px] text-[rgba(6,28,47,0.45)]">{domain}</span>
                  </div>
                  {DEMO_REPORT.previewImage ? (
                    <img
                      src={DEMO_REPORT.previewImage}
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
              </div>
            </div>

            <div className={`${SURFACE_CARD_CLASS} px-3 py-2.5`}>
              <p className="text-[12px] font-medium leading-[18px] text-[rgba(6,28,47,0.45)]">
                Close the gap{" "}
                <span className="font-normal">6.5 → 8.9</span>
              </p>

              <ul className="mt-2">
                {LANDING_REPORT_MOCK.gapItems.map((item, index) => (
                  <li key={item.text}>
                    {index > 0 ? <div className="my-2 h-px bg-[#EEF1F5]" aria-hidden /> : null}
                    <div className="flex items-center justify-between gap-3">
                      <p className="line-clamp-1 text-[14px] font-semibold leading-[18px] tracking-[-0.01em] text-[#061C2F]">
                        {item.text}
                      </p>
                      <DeltaPill value={item.delta} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-[rgba(32,52,94,0.09)] px-5 py-5 sm:grid-cols-2">
            {LANDING_REPORT_MOCK.visualCards.map((card) => (
              <MockVisualFixCard
                key={card.title}
                title={card.title}
                icon={card.icon}
                description={card.description}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-[13px] font-medium text-white/50 transition group-hover:text-white/70">
        View full sample report →
      </p>
    </Link>
  );
}
