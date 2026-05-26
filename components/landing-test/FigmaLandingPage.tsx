import { LandingReportMockup } from "@/components/LandingReportMockup";
import { AnalysisBentoGrid } from "@/components/landing/AnalysisBentoGrid";
import { LandingHeroSection } from "@/components/landing/LandingHeroSection";
import { LandingSectionHeader } from "@/components/landing/LandingSectionHeader";
import { LANDING_CONTAINER_CLASS } from "@/components/landing/landingStyles";
import { FigmaFeatureHighlights } from "@/components/landing-test/FigmaFeatureHighlights";
import { FigmaHowItWorks } from "@/components/landing-test/FigmaHowItWorks";
import { FigmaLandingCtaSection } from "@/components/landing-test/FigmaLandingCtaSection";
import { FigmaSocialProof } from "@/components/landing-test/FigmaSocialProof";

/**
 * Landing layout from Klynt Interface Kit v.1 (Figma node 355-1211).
 * Hero is shared with production; sections below mirror the kit frame.
 */
export function FigmaLandingPage() {
  return (
    <main className="overflow-hidden bg-[#F5F7FA] text-[#061C2F]">
      <LandingHeroSection />

      <section
        id="report"
        className="relative z-20 -mt-[56px] px-4 sm:-mt-[70px] md:-mt-[120px] md:px-6"
      >
        <LandingReportMockup />
      </section>

      <FigmaFeatureHighlights />

      <section className="px-4 pt-10 pb-10 sm:px-5 sm:pt-12 md:px-6 md:pt-24 md:pb-28">
        <div className={LANDING_CONTAINER_CLASS}>
          <LandingSectionHeader
            eyebrow="What Klynt analyzes"
            title="Clear insights for better product decisions"
            description="Every report breaks your page into three parts — what's wrong, what to change, and how to rewrite the words."
          />

          <AnalysisBentoGrid />
          <FigmaSocialProof />
          <FigmaHowItWorks />
        </div>
      </section>

      <FigmaLandingCtaSection />
    </main>
  );
}
