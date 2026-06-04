import { RiCheckLine, RiFileCopyLine, RiLock2Line } from "@remixicon/react";
import type { ReportCopyItem } from "@/lib/audit-report";
import { PriorityBadgeFromImpact } from "@/components/report/ImpactBadges";
import {
  IMPROVED_COPY_BUTTON_CLASS,
  IMPROVED_COPY_LABEL_CLASS,
  IMPROVED_COPY_PANEL_CLASS,
  IMPROVED_COPY_TOAST_CLASS,
} from "@/lib/report-priority";
import { ReportSectionHeader } from "@/components/report/ReportSectionHeader";
import { ReportVariantCard } from "@/components/report/ReportVariantCard";
import {
  REPORT_CARD_TITLE_CLASS,
  REPORT_SECTION_SCROLL_MARGIN_CLASS,
  REPORT_SECTION_SPACING_CLASS,
  REPORT_WHY_BODY_CLASS,
  REPORT_WHY_BODY_MEASURE_CLASS,
} from "@/components/report/reportStyles";
import { REPORT_SECTION_ANCHORS } from "@/lib/report-sections";
import { ReportIndexBadge } from "@/components/report/ReportIndexBadge";

type ReportCopySectionProps = {
  copy?: ReportCopyItem[];
  copiedIndex: number | null;
  onCopy: (text: string, index: number) => void;
  waitlistActive?: boolean;
};

const COPY_FIELD_HEADER_BAND_CLASS =
  "mb-3 flex min-h-9 items-center";

const COPY_FIELD_LABEL_CLASS =
  "text-[12px] font-semibold uppercase tracking-[0.08em]";

function CopyCard({
  item,
  index,
  copiedIndex,
  onCopy,
  copyLocked = false,
}: {
  item: ReportCopyItem;
  index: number;
  copiedIndex: number | null;
  onCopy: (text: string, index: number) => void;
  copyLocked?: boolean;
}) {
  return (
    <ReportVariantCard variant="copy">
      <div className="flex flex-col gap-5 md:flex-row md:gap-6">
        <div className="hidden items-start justify-center pt-0.5 md:flex">
          <ReportIndexBadge index={index} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-4 flex items-start justify-between gap-3 md:hidden">
                <ReportIndexBadge index={index} />
                <PriorityBadgeFromImpact item={item} className="justify-end" />
              </div>

              {item.section ? <p className={REPORT_CARD_TITLE_CLASS}>{item.section}</p> : null}
              {item.why ? (
                <p
                  className={[
                    REPORT_WHY_BODY_CLASS,
                    REPORT_WHY_BODY_MEASURE_CLASS,
                    item.section ? "mt-2 mb-4" : "mb-4",
                  ].join(" ")}
                >
                  {item.why}
                </p>
              ) : item.section ? (
                <div className="mb-4" />
              ) : null}
            </div>

            <div className="hidden shrink-0 md:block">
              <PriorityBadgeFromImpact item={item} />
            </div>
          </div>

          <div className="grid gap-3 md:gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
              <div className={COPY_FIELD_HEADER_BAND_CLASS}>
                <p className={`${COPY_FIELD_LABEL_CLASS} text-neutral-400`}>Before</p>
              </div>
              <p className="text-[16px] font-normal leading-5 text-neutral-600">{item.before}</p>
            </div>

            <div className={`relative rounded-2xl border p-5 ${IMPROVED_COPY_PANEL_CLASS}`}>
              <div
                className={`${COPY_FIELD_HEADER_BAND_CLASS} justify-between gap-3`}
              >
                <p className={`${COPY_FIELD_LABEL_CLASS} ${IMPROVED_COPY_LABEL_CLASS}`}>
                  Improved
                </p>

                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => onCopy(item.after ?? "", index)}
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

                  {!copyLocked && copiedIndex === index && (
                    <div
                      className={`absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-medium shadow-sm ${IMPROVED_COPY_TOAST_CLASS}`}
                    >
                      Copied
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[16px] font-medium leading-5 text-[var(--ink-primary)]">
                {item.after}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ReportVariantCard>
  );
}

export function ReportCopySection({
  copy = [],
  copiedIndex,
  onCopy,
  waitlistActive = false,
}: ReportCopySectionProps) {
  if (copy.length === 0) return null;

  const visibleCopy = waitlistActive ? copy.slice(0, 1) : copy;

  return (
    <section
      id={REPORT_SECTION_ANCHORS.copy}
      className={`${REPORT_SECTION_SPACING_CLASS} ${REPORT_SECTION_SCROLL_MARGIN_CLASS}`}
    >
      <ReportSectionHeader variant="copy" count={copy.length} />

      <div className="mt-6 space-y-4">
        {visibleCopy.map((item, index) => (
          <CopyCard
            key={index}
            item={item}
            index={index}
            copiedIndex={copiedIndex}
            onCopy={onCopy}
            copyLocked={waitlistActive}
          />
        ))}
      </div>
    </section>
  );
}
