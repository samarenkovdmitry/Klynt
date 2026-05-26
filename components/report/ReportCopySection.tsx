import { RiCheckLine, RiFileCopyLine } from "@remixicon/react";
import type { ReportCopyItem } from "@/lib/audit-report";
import { ImpactBadges } from "@/components/report/ImpactBadges";
import { REPORT_CARD_CLASS_ANIMATED, REPORT_ITEM_TITLE_CLASS, REPORT_SECTION_TITLE_CLASS } from "@/components/report/reportStyles";
import { getImpactEntries } from "@/lib/report-impact";

type ReportCopySectionProps = {
  copy?: ReportCopyItem[];
  copiedIndex: number | null;
  onCopy: (text: string, index: number) => void;
};

function IndexBadge({ index }: { index: number }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5F7FA] text-[15px] font-semibold text-neutral-400">
      {index + 1}
    </div>
  );
}

export function ReportCopySection({
  copy = [],
  copiedIndex,
  onCopy,
}: ReportCopySectionProps) {
  if (copy.length === 0) return null;

  return (
    <section>
      <h3 className={`${REPORT_SECTION_TITLE_CLASS} mb-5`}>Copy Refinement</h3>

      <div className="space-y-4">
        {copy.map((item, index) => {
          const impactEntries = getImpactEntries(item);

          return (
            <div key={index} className={REPORT_CARD_CLASS_ANIMATED}>
              <div className="flex flex-col gap-5 md:flex-row md:gap-6">
                <div className="hidden items-start justify-center pt-0.5 md:flex">
                  <IndexBadge index={index} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex items-start justify-between gap-3 md:hidden">
                        <IndexBadge index={index} />
                        <ImpactBadges
                          entries={impactEntries}
                          variant="sky"
                          className="justify-end"
                        />
                      </div>

                      <p className={REPORT_ITEM_TITLE_CLASS}>{item.section}</p>

                      <div className="hidden md:block lg:hidden">
                        <ImpactBadges
                          entries={impactEntries}
                          variant="sky"
                          className="mt-3"
                        />
                      </div>
                    </div>

                    <div className="hidden shrink-0 lg:block">
                      <ImpactBadges entries={impactEntries} variant="sky" />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
                          Before
                        </p>
                        <div className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-500">
                          Original
                        </div>
                      </div>
                      <p className="text-[15px] leading-7 text-neutral-600">
                        {item.before}
                      </p>
                    </div>

                    <div className="relative rounded-2xl border border-sky-200 bg-sky-50/70 p-5">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-sky-700">
                            Improved
                          </p>
                          <div className="rounded-full border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-medium text-sky-700">
                            AI Suggestion
                          </div>
                        </div>

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

                      <p className="text-[16px] font-medium leading-7 text-[var(--ink-primary)] md:text-[17px]">
                        {item.after}
                      </p>
                    </div>
                  </div>

                  {item.why && (
                    <div className="mt-6 border-t border-neutral-100 pt-5">
                      <p className="text-[14px] font-semibold text-[var(--ink-primary)]">
                        Why it works
                      </p>
                      <p className="mt-1 text-[15px] leading-6 text-[var(--ink-secondary)]">
                        {item.why}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
