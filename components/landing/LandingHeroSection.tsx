import { RiArrowRightLine } from "@remixicon/react";
import { Button } from "@/components/ui/Button";
import { LandingHeroOpArt } from "@/components/LandingHeroOpArt";
import { TrustBadgeRow } from "@/components/TrustBadgeRow";
import { LANDING_BUTTON_CLASS } from "@/components/landing/landingStyles";

export function LandingHeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0E1B36] pb-[120px] md:pb-[180px]">
      <LandingHeroOpArt />

      <div className="relative z-10 mx-auto flex max-w-[980px] flex-col items-center px-5 pt-10 text-center md:pt-16">
        <h1 className="max-w-[860px] text-[50px] font-normal leading-[0.95] tracking-[-0.01em] text-white md:text-[75px]">
          Clarity drives conversion
        </h1>

        <p className="mt-5 max-w-[640px] text-[17px] leading-8 text-white md:text-[20px]">
          Klynt finds confusing UX, weak positioning and conversion friction on
          landing pages.
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
