import { LandingTestAnalyzes } from "@/components/landing-test/LandingTestAnalyzes";
import { LandingTestCtaSection } from "@/components/landing-test/LandingTestCtaSection";
import { LandingTestHero } from "@/components/landing-test/LandingTestHero";
import {
  LandingTestHowItWorks,
  LandingTestMidCta,
} from "@/components/landing-test/LandingTestHowItWorks";
import { LandingTestInsideReport } from "@/components/landing-test/LandingTestInsideReport";
import { LandingTestSocialProof } from "@/components/landing-test/LandingTestSocialProof";
import { LandingTestWhatYouGet } from "@/components/landing-test/LandingTestWhatYouGet";

export function FigmaLandingPage() {
  return (
    <main className="overflow-hidden bg-white text-[#061C2F]">
      <LandingTestHero />

      <LandingTestAnalyzes />
      <LandingTestHowItWorks />
      <LandingTestMidCta />
      <LandingTestWhatYouGet />
      <LandingTestInsideReport />
      <LandingTestSocialProof />
      <LandingTestCtaSection />
    </main>
  );
}
