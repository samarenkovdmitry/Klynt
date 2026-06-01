import { LandingPageAtmosphere } from "@/components/landing-test/LandingPageAtmosphere";
import { LandingTestCtaSection } from "@/components/landing-test/LandingTestCtaSection";
import { LandingTestHero } from "@/components/landing-test/LandingTestHero";
import { LandingTestHowItWorks } from "@/components/landing-test/LandingTestHowItWorks";
import { LandingTestReportScope } from "@/components/landing-test/LandingTestReportScope";
import { LANDING_DARK } from "@/components/landing-test/landingPageStyles";

export function FigmaLandingPage() {
  return (
    <main
      className="relative overflow-hidden text-white"
      style={{ backgroundColor: LANDING_DARK }}
    >
      <LandingPageAtmosphere />
      <div className="relative z-[1]">
        <LandingTestHero />
        <LandingTestHowItWorks />
        <LandingTestReportScope />
        <LandingTestCtaSection />
      </div>
    </main>
  );
}
