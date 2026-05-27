import { RiArrowRightLine } from "@remixicon/react";

import { LandingHeroOpArt } from "@/components/LandingHeroOpArt";
import { Button } from "@/components/ui/Button";
import { TrustBadgeRow } from "@/components/TrustBadgeRow";
import { LANDING_BUTTON_CLASS } from "@/components/landing/landingStyles";

import { LandingTestHeader } from "./LandingTestHeader";

export function LandingTestHero() {
  return (
    <section className="relative overflow-hidden bg-[#0E1B36] pb-[180px]">
      <LandingHeroOpArt />
      <LandingTestHeader />

      <div className="relative z-10 mx-auto flex max-w-[980px] flex-col items-center px-6 pt-16 text-center">
        <h1 className="max-w-[860px] text-[75px] font-normal leading-[0.95] tracking-[-0.01em] text-white">
          Clarity drives conversion
        </h1>

        <p className="mt-6 max-w-[640px] text-[21px] leading-8 text-white/80">
          Klynt finds what makes pages feel unclear — and how to fix it.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center">
          <Button
            href="/analyze"
            icon={<RiArrowRightLine size={18} />}
            fullWidth={false}
            className={LANDING_BUTTON_CLASS}
          >
            Start free audit
          </Button>

          <TrustBadgeRow variant="dark" className="mt-5" />
        </div>
      </div>
    </section>
  );
}
