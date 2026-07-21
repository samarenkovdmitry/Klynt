import {
  ANALYZE_ITEMS,
  LANDING_UPDATE_CONTAINER,
} from "@/lib/landing-update-content";

import {
  UPDATE_ANALYZES_SECTION,
  UPDATE_SECTION_DESC,
  UPDATE_SECTION_LABEL,
  UPDATE_SECTION_TITLE,
} from "./landingUpdateStyles";

export function LandingTestAnalyzes() {
  return (
    <section className={`${UPDATE_ANALYZES_SECTION} bg-white`}>
      <div className={LANDING_UPDATE_CONTAINER}>
        <div className="mx-auto max-w-[760px] text-center">
          <p className={UPDATE_SECTION_LABEL}>What Klynt analyzes</p>
          <h2 className={UPDATE_SECTION_TITLE}>
            Everything that makes a page feel unclear
          </h2>
          <p className={UPDATE_SECTION_DESC}>
            From UX friction to weak positioning and confusing copy — Klynt
            turns landing page problems into actionable fixes.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 md:mt-16 lg:grid-cols-4 md:gap-8">
          {ANALYZE_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="mx-auto w-full max-w-[180px] text-center">
                <Icon size={24} className="mx-auto text-[var(--brand-primary)]" aria-hidden />
                <h3 className="mt-4 text-[17px] font-semibold text-[#061C2F]">
                  {item.title}
                </h3>
                <p className="mx-auto mt-2 max-w-[240px] text-[14px] leading-[21px] text-[#6B7280] md:max-w-[180px]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
