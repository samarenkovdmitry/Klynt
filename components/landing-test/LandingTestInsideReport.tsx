import {
  INSIDE_REPORT_AFTER,
  INSIDE_REPORT_BEFORE,
  INSIDE_REPORT_ITEMS,
  LANDING_UPDATE_CONTAINER,
} from "@/lib/landing-update-content";

import {
  UPDATE_EYEBROW,
  UPDATE_HEADLINE,
  UPDATE_SECTION,
  UPDATE_SUBCOPY,
} from "./landingUpdateStyles";

const impactStyles = {
  red: "border-red-200 bg-[#FFF3F3] text-[#D94848]",
  green: "border-emerald-200 bg-[#E8F7EE] text-[#2E7D4F]",
  sky: "border-sky-200 bg-sky-50 text-sky-700",
} as const;

export function LandingTestInsideReport() {
  return (
    <section className={`${UPDATE_SECTION} bg-[#F5F7FA]`}>
      <div className={LANDING_UPDATE_CONTAINER}>
        <div className="mx-auto max-w-[760px] text-center">
          <p className={UPDATE_EYEBROW}>Inside the report</p>
          <h2 className={`mt-4 ${UPDATE_HEADLINE}`}>One score. Three lenses.</h2>
          <p className={`mx-auto mt-5 max-w-[620px] ${UPDATE_SUBCOPY}`}>
            Every audit breaks your page into what&apos;s wrong, what to fix,
            and how to rewrite the copy.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-[20px] border border-[rgba(6,28,47,0.06)] bg-white shadow-[0_16px_48px_rgba(6,28,47,0.06)] md:mt-14 md:rounded-[28px]">
          {INSIDE_REPORT_ITEMS.map((item, index) => (
            <div
              key={item.title}
              className="border-b border-[rgba(6,28,47,0.06)] px-5 py-5 last:border-b-0 md:px-8 md:py-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="flex min-w-0 items-start gap-4 md:gap-5">
                  <span className="text-[36px] font-semibold leading-none tracking-[-0.04em] text-[#2563EB]/20 md:text-[48px]">
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
                      <div className="mt-4 space-y-2">
                        <div className="h-2.5 w-full max-w-[320px] rounded-full bg-[#E5E7EB]" />
                        <div className="h-2.5 w-full max-w-[240px] rounded-full bg-[#E5E7EB]" />
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
                  className={`w-fit shrink-0 rounded-full border px-3 py-1 text-[12px] font-semibold ${impactStyles[item.impactTone]}`}
                >
                  {item.impact}
                </span>
              </div>

              {item.showComparison ? (
                <div className="mt-6 grid grid-cols-1 gap-4 pl-0 md:grid-cols-2 md:gap-5 md:pl-[68px]">
                  <div className="rounded-[16px] border border-[rgba(6,28,47,0.06)] bg-white p-4 md:rounded-[20px] md:p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
                      Before
                    </p>
                    <div className="mt-3 h-2.5 w-full rounded-full bg-[#E5E7EB]" />
                    <p className="mt-3 text-[14px] leading-6 text-[#6B7280]">
                      {INSIDE_REPORT_BEFORE}
                    </p>
                  </div>

                  <div className="rounded-[16px] border border-sky-200 bg-sky-50/70 p-4 md:rounded-[20px] md:p-5">
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
