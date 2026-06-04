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
import {
  REPORT_COPY_CONTEXT_CLASS,
  REPORT_SECTION_LABEL_CLASS,
  REPORT_SECTION_SCROLL_MARGIN_CLASS,
  REPORT_SECTION_SPACING_CLASS,
  getReportCardClass,
} from "@/components/report/reportStyles";
import { REPORT_SECTION_ANCHORS } from "@/lib/report-sections";
import { ReportIndexBadge } from "@/components/report/ReportIndexBadge";

type ReportCopySectionProps = {
  copy?: ReportCopyItem[];
  copiedIndex: number | null;
  onCopy: (text: string, index: number) => void;
  waitlistActive?: boolean;
};

const COPY_FIELD_HEADER_CLASS =
  "mb-3 grid h-9 grid-cols-[1fr_36px] items-center gap-3";

function CopyCard({
  item,
  index,
  copiedIndex,
  onCopy,
  copyLocked = false,
  featured = false,
}: {
  item: ReportCopyItem;
  index: number;
  copiedIndex: number | null;
  onCopy: (text: string, index: number) => void;
  copyLocked?: boolean;
  featured?: boolean;
}) {
  return (
    <div className={getReportCardClass("copy", { featured })}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <ReportIndexBadge index={index} />
            <div className="min-w-0 flex-1">
              {item.section ? (
                <p className={REPORT_SECTION_LABEL_CLASS}>{item.section}</p>
              ) : null}
              {item.why ? (
                <p
                  className={[
                    REPORT_COPY_CONTEXT_CLASS,
                    item.section ? "mt-2" : "",
                  ].join(" ")}
                >
                  {item.why}
                </p>
              ) : null}
            </div>
          </div>

          <div className="shrink-0 md:pt-1">
            <PriorityBadgeFromImpact item={item} className="md:justify-end" />
          </div>
        </div>

        <div className="grid gap-3 md:gap-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <div className={COPY_FIELD_HEADER_CLASS}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
                Before
              </p>
              <span className="sr-only">Original copy</span>
            </div>
            <p className="text-[16px] font-normal leading-6 text-neutral-600">{item.before}</p>
          </div>

          <div className={`relative rounded-2xl border p-5 ${IMPROVED_COPY_PANEL_CLASS}`}>
            <div className={COPY_FIELD_HEADER_CLASS}>
              <p
                className={`text-[12px] font-semibold uppercase tracking-[0.08em] ${IMPROVED_COPY_LABEL_CLASS}`}
              >
                Improved
              </p>

              <div className="relative justify-self-end">
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

            <p className="text-[16px] font-medium leading-6 text-[var(--ink-primary)]">
              {item.after}
            </p>
          </div>
        </div>
      </div>
    </div>
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

      <div className="mt-6 space-y-5">
        {visibleCopy.map((item, index) => (
          <CopyCard
            key={index}
            item={item}
            index={index}
            copiedIndex={copiedIndex}
            onCopy={onCopy}
            copyLocked={waitlistActive}
            featured={index === 0}
          />
        ))}
      </div>
    </section>
  );
}
