import { RiArrowRightLine } from "@remixicon/react";

import { LandingHeroOpArt } from "@/components/LandingHeroOpArt";
import { Button } from "@/components/ui/Button";
import { TrustBadgeRow } from "@/components/TrustBadgeRow";
import { LANDING_BUTTON_CLASS } from "@/components/landing/landingStyles";
import { DEMO_REPORT_PATH } from "@/lib/demo-report";
import { LANDING_UPDATE_CONTAINER } from "@/lib/landing-update-content";

import { UPDATE_SECTION } from "./landingUpdateStyles";

export function LandingTestCtaSection() {
  return (
    <section className={`relative overflow-hidden bg-[#0E1B36] ${UPDATE_SECTION}`}>
      <LandingHeroOpArt />

      <div className={`${LANDING_UPDATE_CONTAINER} relative z-10 text-center`}>
        <h2 className="text-[36px] font-normal leading-[0.95] tracking-[-0.04em] text-white md:text-[52px]">
          Landing pages fail quietly.
        </h2>

        <p className="mx-auto mt-4 max-w-[560px] text-[17px] leading-8 text-white/70 md:mt-5 md:text-[19px]">
          Klynt shows why.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row md:mt-10">
          <Button
            href="/analyze"
            icon={<RiArrowRightLine size={18} />}
            fullWidth={false}
            className={LANDING_BUTTON_CLASS}
          >
            Start free audit
          </Button>

          <Button
            href={DEMO_REPORT_PATH}
            variant="secondary"
            tone="dark"
            fullWidth={false}
            className={LANDING_BUTTON_CLASS}
          >
            View demo
          </Button>
        </div>

        <TrustBadgeRow variant="dark" className="mt-5" />
      </div>
    </section>
  );
}
