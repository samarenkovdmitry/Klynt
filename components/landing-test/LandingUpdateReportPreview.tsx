import {
  LANDING_UPDATE_CONTAINER,
  REPORT_AFTER,
  REPORT_BEFORE,
  REPORT_ISSUES,
} from "@/lib/landing-update-content";

import {
  UPDATE_EYEBROW,
  UPDATE_HEADLINE,
  UPDATE_SECTION,
  UPDATE_SUBCOPY,
} from "./landingUpdateStyles";

const tagStyles = [
  "border-red-200 bg-[#FFF3F3] text-[#D94848]",
  "border-amber-200 bg-[#FFF8ED] text-[#B45309]",
  "border-sky-200 bg-sky-50 text-sky-700",
] as const;

export function LandingUpdateReportPreview() {
  return (
    <section className={`${UPDATE_SECTION} bg-[#F5F7FA]`}>
      <div className={LANDING_UPDATE_CONTAINER}>
        <div className="max-w-[640px]">
          <p className={UPDATE_EYEBROW}>Report</p>
          <h2 className={`mt-4 ${UPDATE_HEADLINE}`}>One score. Three lenses.</h2>
          <p className={`mt-5 max-w-[560px] ${UPDATE_SUBCOPY}`}>
            Every audit breaks your page into what&apos;s wrong, what to fix,
            and how to rewrite the copy.
          </p>
        </div>

        <div className="mt-14 overflow-hidden rounded-[28px] border border-[rgba(6,28,47,0.06)] bg-white shadow-[0_16px_48px_rgba(6,28,47,0.06)]">
          <div className="divide-y divide-[rgba(6,28,47,0.06)]">
            {REPORT_ISSUES.map((issue, index) => (
              <div
                key={issue.title}
                className="flex items-start justify-between gap-6 px-8 py-6"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2563EB]/10 text-[14px] font-semibold text-[#2563EB]">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-[#061C2F]">
                      {issue.title}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {issue.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tagStyles[index]}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {issue.impact ? (
                  <span
                    className={`shrink-0 rounded-full border px-3 py-1 text-[12px] font-semibold ${tagStyles[index]}`}
                  >
                    {issue.impact}
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-5 bg-[#FAFBFC] p-8">
            <div className="rounded-[20px] border border-[rgba(6,28,47,0.06)] bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
                Before
              </p>
              <p className="mt-3 text-[16px] leading-7 text-[#6B7280]">
                {REPORT_BEFORE}
              </p>
            </div>

            <div className="rounded-[20px] border border-sky-200 bg-sky-50/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-sky-700">
                  After
                </p>
                <span className="rounded-full border border-sky-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-sky-700">
                  +15% clarity
                </span>
              </div>
              <p className="mt-3 text-[16px] font-medium leading-7 text-[#061C2F]">
                {REPORT_AFTER}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
