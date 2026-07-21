import { LandingPageAtmosphere } from "@/components/landing-test/LandingPageAtmosphere";
import { LandingTestWhatsInside } from "@/components/landing-test/LandingTestWhatsInside";
import { LandingTestCtaSection } from "@/components/landing-test/LandingTestCtaSection";
import { LandingTestHero } from "@/components/landing-test/LandingTestHero";
import { LandingTestHowItWorks } from "@/components/landing-test/LandingTestHowItWorks";
import { LANDING_DARK } from "@/components/landing-test/landingPageStyles";
import { HEADER_HEIGHT_PX } from "@/lib/layout-constants";

const HEADER_OFFSET = `calc(${HEADER_HEIGHT_PX}px + env(safe-area-inset-top, 0px))`;

type FigmaLandingPageProps = {
  auditedCount?: number | null;
};

export function FigmaLandingPage({ auditedCount = null }: FigmaLandingPageProps) {
  return (
    <main
      className="relative min-h-dvh text-white"
      style={{
        backgroundColor: LANDING_DARK,
        paddingTop: HEADER_OFFSET,
      }}
    >
      <LandingPageAtmosphere />
      <div className="relative z-[1] overflow-hidden">
        <LandingTestHero auditedCount={auditedCount} />
        <LandingTestHowItWorks />
        <LandingTestWhatsInside />
        <LandingTestCtaSection />
      </div>
    </main>
  );
}
