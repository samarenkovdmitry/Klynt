import { LandingPageAtmosphere } from "@/components/landing-test/LandingPageAtmosphere";
import { LandingTestWhatsInside } from "@/components/landing-test/LandingTestWhatsInside";
import { LandingTestHero } from "@/components/landing-test/LandingTestHero";
import { LandingTestHowItWorks } from "@/components/landing-test/LandingTestHowItWorks";
import { LandingTestSampleFinding } from "@/components/landing-test/LandingTestSampleFinding";
import { LandingTestCtaSection } from "@/components/landing-test/LandingTestCtaSection";
import { LandingTestWhoItsFor } from "@/components/landing-test/LandingTestWhoItsFor";
import { LANDING_DARK } from "@/components/landing-test/landingPageStyles";
import { HEADER_HEIGHT_PX } from "@/lib/layout-constants";

const HEADER_OFFSET = `calc(${HEADER_HEIGHT_PX}px + env(safe-area-inset-top, 0px))`;

type FigmaLandingPageProps = {
  auditedCount?: number | null;
};

export function FigmaLandingPage({ auditedCount = null }: FigmaLandingPageProps) {
  return (
    <main
      className="relative min-h-dvh w-full max-w-full overflow-x-hidden text-white"
      style={{
        backgroundColor: LANDING_DARK,
        paddingTop: HEADER_OFFSET,
      }}
    >
      <LandingPageAtmosphere />
      <div className="relative z-[1] w-full max-w-full overflow-x-hidden">
        <LandingTestHero auditedCount={auditedCount} />
        <LandingTestWhatsInside />
        <LandingTestSampleFinding />
        <LandingTestHowItWorks />
        <LandingTestWhoItsFor />
        <LandingTestCtaSection />
      </div>
    </main>
  );
}
