import { RiArrowRightLine } from "@remixicon/react";

import { LandingHeroOpArt } from "@/components/LandingHeroOpArt";
import { PreLaunchProductHuntBanner } from "@/components/pre-launch/PreLaunchProductHuntBanner";
import { Button } from "@/components/ui/Button";
import { TrustBadgeRow } from "@/components/TrustBadgeRow";
import { LANDING_BUTTON_CLASS } from "@/components/landing/landingStyles";

import { LandingTestHeader } from "./LandingTestHeader";

export function LandingTestHero() {
  return (
    <section className="relative overflow-hidden bg-[#0E1B36] pb-[144px] md:pb-[204px]">
      <LandingHeroOpArt />
      <LandingTestHeader />

      <div className="relative z-10 mx-auto flex max-w-[980px] flex-col items-center px-5 pt-10 text-center md:px-6 md:pt-16">
        <PreLaunchProductHuntBanner />

        <h1 className="max-w-[860px] text-[54px] font-semibold leading-[58px] tracking-[-0.01em] text-white md:text-[64px] md:leading-[80px]">
          Clarity drives conversion
        </h1>

        <p className="mt-[14px] max-w-[640px] text-[19px] font-normal leading-[32px] text-white/80 md:mt-[18px]">
          Klynt finds what makes pages feel unclear — and how to fix it.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center md:mt-8">
          <Button
            href="/analyze"
            icon={<RiArrowRightLine size={18} />}
            fullWidth={false}
            className={LANDING_BUTTON_CLASS}
          >
            Start free audit
          </Button>
        </div>

        <TrustBadgeRow variant="dark" gray className="mt-6 md:mt-8" />
      </div>
    </section>
  );
}
