import { LandingTestCtaSection } from "@/components/landing-test/LandingTestCtaSection";
import { LandingTestHero } from "@/components/landing-test/LandingTestHero";
import { LandingTestHowItWorks } from "@/components/landing-test/LandingTestHowItWorks";
import { LandingTestLooksFor } from "@/components/landing-test/LandingTestLooksFor";

export function FigmaLandingPage() {
  return (
    <main className="overflow-hidden bg-[#12161F] text-white">
      <LandingTestHero />
      <LandingTestLooksFor />
      <LandingTestHowItWorks />
      <LandingTestCtaSection />
    </main>
  );
}
