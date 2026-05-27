import {
  INSIDE_REPORT_ITEMS,
  LANDING_UPDATE_CONTAINER,
} from "@/lib/landing-update-content";

import {
  UPDATE_SECTION,
  UPDATE_SECTION_DESC,
  UPDATE_SECTION_LABEL,
  UPDATE_SECTION_TITLE,
} from "./landingUpdateStyles";

const impactStyles = {
  red: "border-red-200 bg-[#FFF3F3] text-[#D94848]",
  green: "border-emerald-200 bg-[#ECFDF5] text-[#2E7D4F]",
  sky: "border-sky-200 bg-sky-50 text-sky-700",
} as const;

const impactBadgeClass =
  "inline-flex h-[37px] w-fit shrink-0 items-center rounded-full border px-4 text-[12px] font-semibold";

const tagPillClass =
  "inline-flex h-[26px] items-center rounded-full border border-[#E5E5E5] bg-[#F5F7FA] px-2.5 text-[12px] font-semibold text-[#6B7280]";

export function LandingTestInsideReport() {
  return (
    <section className={`${UPDATE_SECTION} bg-[#F5F7FA]`}>
      <div className={LANDING_UPDATE_CONTAINER}>
        <div className="mx-auto max-w-[760px] text-center">
          <p className={UPDATE_SECTION_LABEL}>Inside the report</p>
          <h2 className={UPDATE_SECTION_TITLE}>One score. Three lenses.</h2>
          <p className={UPDATE_SECTION_DESC}>
            Every audit breaks your page into what&apos;s wrong, what to fix,
            and how to rewrite the copy.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-[700px] md:mt-14">
          {INSIDE_REPORT_ITEMS.map((item, index) => (
            <div
              key={item.title}
              className={[
                "relative rounded-[20px] border border-[#EBEFF3] bg-white px-5 py-5 shadow-[0_16px_48px_rgba(6,28,47,0.06)] md:rounded-[28px] md:px-8 md:py-6",
                index > 0 ? "-mt-4" : "",
              ].join(" ")}
              style={{ zIndex: index + 1 }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="flex min-w-0 items-start gap-4 pr-24 sm:pr-0 md:gap-5">
                  <span className="text-[20px] font-normal leading-none text-[#D4D4D4] md:text-[30px]">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-[#061C2F]">
                      {item.title}
                    </h3>
                    {item.tags ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span key={tag} className={tagPillClass}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {item.showSkeleton ? (
                      <div className="mt-4 space-y-2">
                        <div className="h-2 w-full rounded-full bg-[#E5E7EB] md:w-[380px]" />
                        <div className="h-2 w-[85%] rounded-full bg-[#E5E7EB] md:w-[270px]" />
                      </div>
                    ) : null}
                    {item.showComparison ? (
                      <div className="mt-4 h-2 w-full rounded-full bg-[#E5E7EB] md:w-[368px]" />
                    ) : null}
                    {item.footer ? (
                      <p className="mt-5 hidden text-[13px] font-semibold text-[#061C2F] sm:block">
                        {item.footer}
                      </p>
                    ) : null}
                  </div>
                </div>

                <span
                  className={`absolute right-5 top-5 z-10 sm:relative sm:right-auto sm:top-auto ${impactBadgeClass} ${impactStyles[item.impactTone]}`}
                >
                  {item.impact}
                </span>
              </div>

              {item.showComparison ? (
                <div className="mt-6 grid grid-cols-2 gap-2 pl-0 md:gap-5 md:pl-[68px]">
                  <div className="rounded-[16px] border border-[rgba(6,28,47,0.06)] bg-white p-4 md:rounded-[20px]">
                    <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
                      Before
                    </p>
                    <div className="mt-3 h-2 w-full rounded-full bg-[#E5E7EB]" />
                  </div>

                  <div className="rounded-[16px] border border-sky-200 bg-sky-50/70 p-4 md:rounded-[20px]">
                    <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-sky-700">
                      Improved
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="h-2 w-full rounded-full bg-[#38B3F7]" />
                      <div className="h-2 w-[70%] rounded-full bg-[#38B3F7]" />
                    </div>
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
