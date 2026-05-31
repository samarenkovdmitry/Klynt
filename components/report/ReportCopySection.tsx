import { RiCheckLine, RiFileCopyLine } from "@remixicon/react";
import type { ReportCopyItem } from "@/lib/audit-report";
import { PriorityBadgeFromImpact } from "@/components/report/ImpactBadges";
import { ReportSectionHeader } from "@/components/report/ReportSectionHeader";
import {
  REPORT_CARD_HEADLINE_BOTTOM_CLASS,
  REPORT_CARD_CLASS_ANIMATED,
  REPORT_CARD_HEADLINE_CLASS,
  REPORT_SECTION_LABEL_CLASS,
} from "@/components/report/reportStyles";
import { ReportIndexBadge } from "@/components/report/ReportIndexBadge";

type ReportCopySectionProps = {
  copy?: ReportCopyItem[];
  copiedIndex: number | null;
  onCopy: (text: string, index: number) => void;
};

export function ReportCopySection({
  copy = [],
  copiedIndex,
  onCopy,
}: ReportCopySectionProps) {
  if (copy.length === 0) return null;

  return (
    <section>
      <ReportSectionHeader title="Copy Refinement" count={copy.length} />

      <div className="mt-5 space-y-4">
        {copy.map((item, index) => (
          <div key={index} className={REPORT_CARD_CLASS_ANIMATED}>
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

                    {item.section ? (
                      <p className={REPORT_SECTION_LABEL_CLASS}>{item.section}</p>
                    ) : null}
                    {item.why ? (
                      <p
                        className={`${REPORT_CARD_HEADLINE_CLASS} ${item.section ? "mt-2" : ""} ${REPORT_CARD_HEADLINE_BOTTOM_CLASS}`}
                      >
                        {item.why}
                      </p>
                    ) : null}
                  </div>

                  <div className="hidden shrink-0 md:block">
                    <PriorityBadgeFromImpact item={item} />
                  </div>
                </div>

                <div className="grid gap-3 md:gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
                        Before
                      </p>
                      <div className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-500">
                        Original
                      </div>
                    </div>
                    <p className="text-[16px] font-normal leading-5 text-neutral-600">{item.before}</p>
                  </div>

                  <div className="relative rounded-2xl border border-sky-200 bg-sky-50/70 p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-sky-700">
                        Improved
                      </p>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => onCopy(item.after ?? "", index)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-white text-sky-700 transition hover:bg-sky-100"
                        >
                          {copiedIndex === index ? (
                            <RiCheckLine size={18} />
                          ) : (
                            <RiFileCopyLine size={18} />
                          )}
                        </button>

                        {copiedIndex === index && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-sky-200 bg-white px-3 py-1 text-[11px] font-medium text-sky-700 shadow-sm">
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
          </div>
        ))}
      </div>
    </section>
  );
}
