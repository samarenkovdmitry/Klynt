import { RiCheckLine } from "@remixicon/react";

import { HeroUrlInput } from "./HeroUrlInput";
import { LandingTestMockup } from "./LandingTestMockup";
import { ProductHuntFeaturedBadge } from "./ProductHuntFeaturedBadge";
import { LANDING_CONTAINER } from "./landingPageStyles";

const FALLBACK_AUDITED_COUNT = 469;

type LandingTestHeroProps = {
  auditedCount?: number | null;
};

export function LandingTestHero({ auditedCount = null }: LandingTestHeroProps) {
  const displayCount =
    typeof auditedCount === "number" && auditedCount > 0
      ? auditedCount.toLocaleString("en-US")
      : FALLBACK_AUDITED_COUNT.toLocaleString("en-US");

  return (
    <section className="relative overflow-hidden">
      <div className={`relative z-10 ${LANDING_CONTAINER} px-5 pb-14 pt-8 md:px-6 md:pb-20 md:pt-12`}>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,556px)] lg:gap-12 xl:gap-16">
          <div className="mx-auto max-w-[640px] text-center lg:mx-0 lg:-mt-4 lg:max-w-none lg:text-left">
            <ProductHuntFeaturedBadge />

            <h1 className="max-w-[560px] text-[36px] font-semibold leading-[1.1] tracking-[-0.02em] text-white md:text-[48px] md:leading-[1.06] lg:max-w-none xl:text-[52px]">
              Visitors are leaving.
              <br />
              Find out exactly why.
            </h1>

            <p className="mt-4 max-w-[560px] text-[16px] font-normal leading-[26px] text-white/70 md:mt-5 md:text-[17px] md:leading-[28px] lg:max-w-[520px]">
              Paste your URL. Get exactly what to fix, and how.
            </p>

            <div className="mt-7 max-w-[500px] lg:max-w-none">
              <HeroUrlInput />
            </div>

            <div className="mt-4 flex flex-col items-center gap-1.5 sm:flex-row sm:gap-2 lg:justify-start">
              {/* Checkmark + count */}
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <RiCheckLine size={12} className="text-white" aria-hidden />
                </span>
                <p className="text-[13px] leading-none text-white/45 md:text-[14px]">
                  <span className="font-medium text-white/60">{displayCount}</span>
                  {" landing pages audited so far"}
                </p>
              </div>

              {/* Vertical divider — desktop only */}
              <span className="hidden sm:mx-0.5 sm:inline-block sm:h-4 sm:w-px sm:shrink-0 sm:bg-white/20" aria-hidden />

              <p className="text-[13px] leading-none text-white/45 md:text-[14px]">
                Free · No signup required
              </p>
            </div>
          </div>

          <div className="relative lg:pt-2">
            <LandingTestMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
