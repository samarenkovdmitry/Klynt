import { RiLockLine } from "@remixicon/react";

import { LandingHeroUrlForm } from "./LandingHeroUrlForm";
import { LANDING_CONTAINER, LANDING_LEAD, LANDING_SECTION, LANDING_TITLE } from "./landingPageStyles";

export function LandingTestCtaSection() {
  return (
    <section className={`${LANDING_SECTION} pb-24 md:pb-28`}>
      <div className={`${LANDING_CONTAINER} mx-auto max-w-[640px] text-center`}>
        <h2 className={`${LANDING_TITLE} mt-0`}>
          Your landing page deserves
          <br />a real second opinion
        </h2>
        <p className={`${LANDING_LEAD} mx-auto mt-4`}>
          Paste any URL and get your improvement kit in about a minute. Free, no signup required.
        </p>

        <LandingHeroUrlForm
          inputId="landing-cta-url"
          className="mx-auto mt-7"
          maxWidthClass="w-full max-w-[400px]"
        />

        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[12px] text-[#7A7A74]">
          <span>Free · No signup</span>
          <span className="inline-flex items-center gap-1 border-l border-white/[0.08] pl-3">
            <RiLockLine size={13} aria-hidden />
            URLs never stored
          </span>
        </div>
      </div>
    </section>
  );
}
