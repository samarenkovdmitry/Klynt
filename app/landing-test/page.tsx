import { LandingReportMockup } from "@/components/LandingReportMockup";
import { LandingCtaSection } from "@/components/landing/LandingCtaSection";
import { LandingHeroSection } from "@/components/landing/LandingHeroSection";
import { TestHowItWorksSection } from "@/components/landing-test/TestHowItWorksSection";
import { TestPlatformSection } from "@/components/landing-test/TestPlatformSection";
import { TestQuotesSection } from "@/components/landing-test/TestQuotesSection";
import { TestReportLensesSection } from "@/components/landing-test/TestReportLensesSection";
import { TestStatsBand } from "@/components/landing-test/TestStatsBand";
import { TestTrustStrip } from "@/components/landing-test/TestTrustStrip";

export default function LandingTestPage() {
  return (
    <main className="overflow-hidden bg-[#F5F7FA] text-[#061C2F]">
      <LandingHeroSection />

      <section
        id="report"
        className="relative z-20 -mt-[70px] px-4 md:-mt-[120px] md:px-6"
      >
        <LandingReportMockup />
      </section>

      <TestTrustStrip />
      <TestHowItWorksSection />
      <TestPlatformSection />
      <TestReportLensesSection />
      <TestStatsBand />
      <TestQuotesSection />
      <LandingCtaSection />
    </main>
  );
}
