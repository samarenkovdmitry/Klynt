import { LandingReportMockup } from "@/components/LandingReportMockup";
import { LandingHeroSection } from "@/components/landing/LandingHeroSection";
import { TestAnalysisSection } from "@/components/landing-test/TestAnalysisSection";
import { TestCtaSection } from "@/components/landing-test/TestCtaSection";
import { TestFeatureStrip } from "@/components/landing-test/TestFeatureStrip";
import { TestHowItWorksSection } from "@/components/landing-test/TestHowItWorksSection";
import { TestSocialProofSection } from "@/components/landing-test/TestSocialProofSection";

export default function LandingTestPage() {
  return (
    <main className="overflow-hidden bg-[#F5F7FA] text-[#061C2F]">
      <LandingHeroSection />

      <section
        id="report"
        className="relative z-20 -mt-[70px] px-4 md:-mt-[120px] md:px-6"
      >
        <div className="mx-auto max-w-[1040px]">
          <div className="mb-4 flex justify-center md:mb-5">
            <span className="rounded-full border border-[rgba(6,28,47,0.08)] bg-white/90 px-4 py-1.5 text-[12px] font-semibold tracking-[0.04em] text-[#2563EB] uppercase shadow-sm backdrop-blur-sm">
              Sample report preview
            </span>
          </div>
          <LandingReportMockup />
        </div>
      </section>

      <div className="pt-10 md:pt-14">
        <TestFeatureStrip />
      </div>

      <TestAnalysisSection />
      <TestSocialProofSection />
      <TestHowItWorksSection />
      <TestCtaSection />
    </main>
  );
}
