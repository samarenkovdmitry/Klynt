import { RiArrowRightLine } from "@remixicon/react";

import { LandingHeroOpArt } from "@/components/LandingHeroOpArt";
import { Button } from "@/components/ui/Button";
import { TrustBadgeRow } from "@/components/TrustBadgeRow";
import { LANDING_BUTTON_CLASS } from "@/components/landing/landingStyles";
import { DEMO_REPORT_PATH } from "@/lib/demo-report";
import { TEST_CONTAINER } from "@/lib/landing-update-content";

import { TEST_SECTION } from "./landingUpdateStyles";

export function LandingTestCtaSection() {
  return (
    <section className={`relative overflow-hidden bg-[#0E1B36] ${TEST_SECTION}`}>
      <LandingHeroOpArt />

      <div className={`${TEST_CONTAINER} relative z-10 text-center`}>
        <h2 className="text-[52px] font-normal leading-[0.95] tracking-[-0.04em] text-white">
          Landing pages fail quietly.
        </h2>

        <p className="mx-auto mt-5 max-w-[560px] text-[19px] leading-8 text-white/70">
          Klynt shows why.
        </p>

        <div className="mt-10 flex items-center justify-center gap-3">
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
