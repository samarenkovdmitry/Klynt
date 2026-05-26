import { TEST_REPORT_LENSES } from "@/lib/landing-test-content";

import { TestSectionEyebrow } from "./TestSectionEyebrow";
import { TEST_CONTAINER, TEST_HEADLINE, TEST_SECTION, TEST_SUBCOPY } from "./testStyles";

export function TestReportLensesSection() {
  return (
    <section className={`${TEST_SECTION} bg-[#F5F7FA]`}>
      <div className={TEST_CONTAINER}>
        <div className="grid items-center gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
          <div>
            <TestSectionEyebrow index="03" label="Report" />
            <h2 className={`mt-4 ${TEST_HEADLINE}`}>One score. Three lenses.</h2>
            <p className={`mt-4 max-w-[420px] ${TEST_SUBCOPY}`}>
              Every audit breaks your page into what&apos;s wrong, what to fix,
              and how to rewrite the copy.
            </p>
          </div>

          <div className="space-y-3">
            {TEST_REPORT_LENSES.map((lens, index) => {
              const Icon = lens.icon;

              return (
                <div
                  key={lens.label}
                  className="flex items-center gap-4 rounded-[20px] border border-[rgba(6,28,47,0.06)] bg-white px-5 py-4 md:px-6 md:py-5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-3">
                      <span className="text-[12px] font-semibold tracking-[0.08em] text-[#2563EB] uppercase">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-[16px] font-semibold text-[#061C2F] md:text-[17px]">
                        {lens.label}
                      </h3>
                    </div>
                    <p className="mt-0.5 text-[14px] text-[#6B7280]">
                      {lens.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
