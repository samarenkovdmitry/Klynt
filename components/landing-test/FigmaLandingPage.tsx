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

export function FigmaLandingPage() {
  return (
    <main className="overflow-hidden bg-[#F5F7FA] text-[#061C2F]">
      <LandingTestHero />

      <section id="report" className="relative z-20 -mt-[107px] bg-white px-4 md:-mt-[128px] md:px-6">
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
