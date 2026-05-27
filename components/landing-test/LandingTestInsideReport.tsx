import {
  INSIDE_REPORT_AFTER,
  INSIDE_REPORT_BEFORE,
  INSIDE_REPORT_ITEMS,
  TEST_CONTAINER,
} from "@/lib/landing-update-content";

import { TestSectionHeader } from "./TestSectionHeader";
import { TEST_CARD, TEST_SECTION } from "./landingUpdateStyles";

const impactStyles = {
  red: "border-red-200 bg-[#FFF3F3] text-[#D94848]",
  green: "border-emerald-200 bg-[#E8F7EE] text-[#2E7D4F]",
  sky: "border-sky-200 bg-sky-50 text-sky-700",
} as const;

export function LandingTestInsideReport() {
  return (
    <section className={`${TEST_SECTION} bg-[#F5F7FA]`}>
      <div className={TEST_CONTAINER}>
        <TestSectionHeader
          eyebrow="Inside the report"
          title="One score. Three lenses."
          description="Every audit breaks your page into what's wrong, what to fix, and how to rewrite the copy."
        />

        <div className={`mt-16 ${TEST_CARD}`}>
          {INSIDE_REPORT_ITEMS.map((item, index) => (
            <div
              key={item.title}
              className="border-b border-[rgba(6,28,47,0.06)] px-8 py-7 last:border-b-0"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex min-w-0 items-start gap-5">
                  <span className="w-10 shrink-0 text-[48px] font-semibold leading-none tracking-[-0.04em] text-[#2563EB]/20">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-[#061C2F]">
                      {item.title}
                    </h3>
                    {item.tags ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-[#F5F7FA] px-2.5 py-0.5 text-[11px] font-medium text-[#6B7280]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {item.showSkeleton ? (
                      <div className="mt-4 space-y-2.5">
                        <div className="h-2.5 w-[320px] max-w-full rounded-full bg-[#E5E7EB]" />
                        <div className="h-2.5 w-[240px] max-w-full rounded-full bg-[#E5E7EB]" />
                      </div>
                    ) : null}
                    {item.footer ? (
                      <p className="mt-4 text-[13px] font-semibold text-[#061C2F]">
                        {item.footer}
                      </p>
                    ) : null}
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full border px-3 py-1 text-[12px] font-semibold ${impactStyles[item.impactTone]}`}
                >
                  {item.impact}
                </span>
              </div>

              {item.showComparison ? (
                <div className="mt-6 grid grid-cols-2 gap-5 pl-[68px]">
                  <div className="rounded-[20px] border border-[rgba(6,28,47,0.06)] bg-white p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
                      Before
                    </p>
                    <div className="mt-3 h-2.5 w-full rounded-full bg-[#E5E7EB]" />
                    <p className="mt-3 text-[14px] leading-6 text-[#6B7280]">
                      {INSIDE_REPORT_BEFORE}
                    </p>
                  </div>

                  <div className="rounded-[20px] border border-sky-200 bg-sky-50/70 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-sky-700">
                      Improved
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="h-2.5 w-full rounded-full bg-[#2563EB]" />
                      <div className="h-2.5 w-[70%] rounded-full bg-[#2563EB]/70" />
                    </div>
                    <p className="mt-3 text-[14px] font-medium leading-6 text-[#061C2F]">
                      {INSIDE_REPORT_AFTER}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
