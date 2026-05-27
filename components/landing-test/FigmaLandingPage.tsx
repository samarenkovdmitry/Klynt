import { LandingTestAnalyzes } from "@/components/landing-test/LandingTestAnalyzes";
import { LandingTestCtaSection } from "@/components/landing-test/LandingTestCtaSection";
import { LandingTestFooter } from "@/components/landing-test/LandingTestFooter";
import { LandingTestHero } from "@/components/landing-test/LandingTestHero";
import {
  LandingTestHowItWorks,
  LandingTestMidCta,
} from "@/components/landing-test/LandingTestHowItWorks";
import { LandingTestInsideReport } from "@/components/landing-test/LandingTestInsideReport";
import { LandingTestMockup } from "@/components/landing-test/LandingTestMockup";
import { LandingTestSocialProof } from "@/components/landing-test/LandingTestSocialProof";
import { LandingTestWhatYouGet } from "@/components/landing-test/LandingTestWhatYouGet";

import { TEST_PAGE } from "./landingUpdateStyles";

export function FigmaLandingPage() {
  return (
    <main className={TEST_PAGE}>
      <LandingTestHero />

      <section id="report" className="relative z-20 -mt-[120px] px-6">
        <LandingTestMockup />
      </section>

      <LandingTestAnalyzes />
      <LandingTestHowItWorks />
      <LandingTestMidCta />
      <LandingTestWhatYouGet />
      <LandingTestInsideReport />
      <LandingTestSocialProof />
      <LandingTestCtaSection />
      <LandingTestFooter />
    </main>
  );
}
