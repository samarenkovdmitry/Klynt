import {
  ANALYZE_ITEMS,
  LANDING_UPDATE_CONTAINER,
} from "@/lib/landing-update-content";

import { UPDATE_SECTION } from "./landingUpdateStyles";

export function LandingTestAnalyzes() {
  return (
    <section className={`${UPDATE_SECTION} bg-white`}>
      <div className={LANDING_UPDATE_CONTAINER}>
        <div className="mx-auto max-w-[760px] text-center">
          <p className="text-[17px] font-semibold leading-[22px] text-[#2563EB]">
            What Klynt analyzes
          </p>
          <h2 className="mt-4 text-[32px] font-semibold leading-[36px] text-[#061C2F] md:text-[44px] md:leading-[0.98]">
            Everything that makes a page feel unclear
          </h2>
          <p className="mx-auto mt-5 max-w-[620px] text-[16px] leading-[21px] text-[#6B7280] md:text-[17px]">
            From UX friction to weak positioning and confusing copy — Klynt
            turns landing page problems into actionable fixes.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 md:mt-16 lg:grid-cols-4 md:gap-8">
          {ANALYZE_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="mx-auto w-full max-w-[180px] text-center">
                <Icon size={24} className="mx-auto text-[#2563EB]" aria-hidden />
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
