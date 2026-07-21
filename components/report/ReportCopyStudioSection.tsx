import { RiCheckLine, RiEdit2Line, RiFileCopyLine, RiLock2Line } from "@remixicon/react";
import type { HeadlineDirections, ReportCopyVariants } from "@/lib/audit-report";
import type { BrandStage } from "@/lib/brand-stage";
import { ReportHeadlineDirectionsCard } from "@/components/report/ReportHeadlineDirectionsCard";
import { ReportIndexBadge } from "@/components/report/ReportIndexBadge";
import { getRecommendedVariant } from "@/lib/report/get-recommended-variant";
import {
  IMPROVED_COPY_BUTTON_CLASS,
  IMPROVED_COPY_LABEL_CLASS,
  IMPROVED_COPY_PANEL_CLASS,
  IMPROVED_COPY_TOAST_CLASS,
} from "@/lib/report-priority";
import {
  REPORT_NEW_SECTION_BODY_GAP_CLASS,
  ReportNewSectionHeader,
} from "@/components/report/ReportNewSectionHeader";
import {
  REPORT_CARD_TITLE_CLASS,
  REPORT_SECTION_SCROLL_MARGIN_CLASS,
  REPORT_SECTION_SPACING_CLASS,
  REPORT_SURFACE_CARD_CLASS,
  REPORT_WHY_BODY_CLASS,
  REPORT_WHY_BODY_MEASURE_CLASS,
} from "@/components/report/reportStyles";
import { REPORT_SECTION_ANCHORS } from "@/lib/report-sections";

const HEADLINE_DIRECTIONS_COPY_INDEX_OFFSET = 100;

type ReportCopyStudioSectionProps = {
  copyVariants?: ReportCopyVariants;
  headlineDirections?: HeadlineDirections;
  brandStage?: BrandStage;
  copiedIndex: number | null;
  onCopy: (text: string, index: number) => void;
  waitlistActive?: boolean;
};

type CopyRowKey = "headline" | "subheadline" | "cta";

const COPY_FIELD_HEADER_BAND_CLASS = "mb-3 flex min-h-9 items-center";

const COPY_FIELD_LABEL_CLASS =
  "text-[12px] font-semibold uppercase tracking-[0.08em]";

function CopyCard({
  label,
  before,
  after,
  rationale,
  cardIndex,
  index,
  copiedIndex,
  onCopy,
  copyLocked = false,
}: {
  label: string;
  before?: string;
  after?: string;
  rationale?: string;
  cardIndex: number;
  index: number;
  copiedIndex: number | null;
  onCopy: (text: string, index: number) => void;
  copyLocked?: boolean;
}) {
  return (
    <div className={REPORT_SURFACE_CARD_CLASS}>
      <div className="px-[21px] py-[21px] md:px-[33px] md:py-[25px]">
        <div className="flex flex-col gap-5 md:flex-row md:gap-6">
          <div className="hidden items-start justify-center pt-0.5 md:flex">
            <ReportIndexBadge index={cardIndex} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-4 flex items-start gap-3 md:hidden">
              <ReportIndexBadge index={cardIndex} />
              <p className={`${REPORT_CARD_TITLE_CLASS} min-w-0 flex-1`}>{label}</p>
            </div>

            <p className={`${REPORT_CARD_TITLE_CLASS} mb-4 hidden md:block`}>{label}</p>

            <div className="grid gap-3 md:gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
            <div className={COPY_FIELD_HEADER_BAND_CLASS}>
              <p className={`${COPY_FIELD_LABEL_CLASS} text-neutral-400`}>Before</p>
            </div>
            <p className="text-[16px] font-normal leading-5 text-neutral-600">{before}</p>
          </div>

          <div className={`relative rounded-2xl border p-5 ${IMPROVED_COPY_PANEL_CLASS}`}>
            <div className={`${COPY_FIELD_HEADER_BAND_CLASS} justify-between gap-3`}>
              <p className={`${COPY_FIELD_LABEL_CLASS} ${IMPROVED_COPY_LABEL_CLASS}`}>
                Improved
              </p>

              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => onCopy(after ?? "", index)}
                  disabled={copyLocked}
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-xl border",
                    copyLocked
                      ? "cursor-not-allowed border-[rgba(6,28,47,0.08)] bg-white text-[rgba(6,28,47,0.35)]"
                      : IMPROVED_COPY_BUTTON_CLASS,
                  ].join(" ")}
                  aria-label={
                    copyLocked
                      ? "Copy available after unlocking the full report"
                      : "Copy improved text"
                  }
                >
                  {copyLocked ? (
                    <RiLock2Line size={16} aria-hidden />
                  ) : copiedIndex === index ? (
                    <RiCheckLine size={18} />
                  ) : (
                    <RiFileCopyLine size={18} />
                  )}
                </button>

                {!copyLocked && copiedIndex === index ? (
                  <div
                    className={`absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-medium shadow-sm ${IMPROVED_COPY_TOAST_CLASS}`}
                  >
                    Copied
                  </div>
                ) : null}
              </div>
            </div>

            <p className="text-[16px] font-medium leading-5 text-[var(--ink-primary)]">{after}</p>
          </div>
        </div>

        {rationale ? (
          <p
            className={[REPORT_WHY_BODY_CLASS, REPORT_WHY_BODY_MEASURE_CLASS, "mt-3"].join(" ")}
          >
            {rationale}
          </p>
        ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

const COPY_ROWS: { key: CopyRowKey; label: string }[] = [
  { key: "headline", label: "Hero headline" },
  { key: "subheadline", label: "Subheadline" },
  { key: "cta", label: "Primary CTA" },
];

export function ReportCopyStudioSection({
  copyVariants,
  headlineDirections,
  brandStage,
  copiedIndex,
  onCopy,
  waitlistActive = false,
}: ReportCopyStudioSectionProps) {
  const hasHeadlineDirections =
    Boolean(headlineDirections?.options?.length) &&
    headlineDirections!.options.length > 0;

  const rows = copyVariants
    ? COPY_ROWS.map(({ key, label }) => ({ key, label, block: copyVariants[key] })).filter(
        (row) => row.block?.current || getRecommendedVariant(row.block?.variants)?.text
      )
    : [];

  const supportingRows = hasHeadlineDirections ? rows.filter((row) => row.key !== "headline") : rows;

  if (!hasHeadlineDirections && supportingRows.length === 0) {
    return null;
  }

  const visibleRows = waitlistActive ? supportingRows.slice(0, 1) : supportingRows;
  const sectionCount =
    (hasHeadlineDirections ? 1 : 0) +
    (waitlistActive ? Math.min(1, supportingRows.length) : supportingRows.length);

  return (
    <section
      id={REPORT_SECTION_ANCHORS.copy}
      className={`${REPORT_SECTION_SPACING_CLASS} ${REPORT_SECTION_SCROLL_MARGIN_CLASS}`}
    >
      <ReportNewSectionHeader
        icon={<RiEdit2Line size={22} className="text-[#5B6378]" />}
        title="Copy studio"
        suffix={String(sectionCount)}
      />

      <div className={`${REPORT_NEW_SECTION_BODY_GAP_CLASS} space-y-4`}>
        {hasHeadlineDirections && headlineDirections ? (
          <ReportHeadlineDirectionsCard
            directions={headlineDirections}
            brandStage={brandStage}
            copiedIndex={copiedIndex}
            copyIndexOffset={HEADLINE_DIRECTIONS_COPY_INDEX_OFFSET}
            onCopy={onCopy}
            copyLocked={waitlistActive}
          />
        ) : null}

        {visibleRows.map((row, index) => {
          const recommended = getRecommendedVariant(row.block?.variants);
          const cardIndex = (hasHeadlineDirections ? 1 : 0) + index;

          return (
            <CopyCard
              key={row.key}
              label={row.label}
              before={row.block?.current}
              after={recommended?.text}
              rationale={recommended?.rationale}
              cardIndex={cardIndex}
              index={hasHeadlineDirections ? index + 1 : index}
              copiedIndex={copiedIndex}
              onCopy={onCopy}
              copyLocked={waitlistActive}
            />
          );
        })}
      </div>
    </section>
  );
}
