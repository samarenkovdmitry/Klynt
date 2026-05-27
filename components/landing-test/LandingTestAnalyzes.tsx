import {
  ANALYZE_ITEMS,
  LANDING_UPDATE_CONTAINER,
} from "@/lib/landing-update-content";

import {
  UPDATE_EYEBROW,
  UPDATE_HEADLINE,
  UPDATE_SECTION,
  UPDATE_SUBCOPY,
} from "./landingUpdateStyles";

export function LandingTestAnalyzes() {
  return (
    <section className={`${UPDATE_SECTION} bg-white`}>
      <div className={LANDING_UPDATE_CONTAINER}>
        <div className="mx-auto max-w-[760px] text-center">
          <p className={UPDATE_EYEBROW}>What Klynt analyzes</p>
          <h2 className={`mt-4 ${UPDATE_HEADLINE}`}>
            Everything that makes a page feel unclear
          </h2>
          <p className={`mx-auto mt-5 max-w-[620px] ${UPDATE_SUBCOPY}`}>
            From UX friction to weak positioning and confusing copy — Klynt
            turns landing page problems into actionable fixes.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 md:mt-16 lg:grid-cols-4 md:gap-8">
          {ANALYZE_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#2563EB]/10 text-[#2563EB]">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 text-[16px] font-semibold tracking-[-0.02em] text-[#061C2F]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[14px] leading-6 text-[#6B7280]">
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
