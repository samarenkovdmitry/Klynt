import { LandingReportMockup } from "@/components/LandingReportMockup";
import { AnalysisBentoGrid } from "@/components/landing/AnalysisBentoGrid";
import { FeatureHighlightGrid } from "@/components/landing/FeatureHighlightGrid";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { LandingCtaSection } from "@/components/landing/LandingCtaSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeroSection } from "@/components/landing/LandingHeroSection";
import { LandingSectionHeader } from "@/components/landing/LandingSectionHeader";
import { LANDING_CONTAINER_CLASS } from "@/components/landing/landingStyles";
import { SocialProofBlock } from "@/components/landing/SocialProofBlock";

export default function Home() {
  return (
    <main className="overflow-hidden bg-[#F5F7FA] text-[#061C2F]">
      <LandingHeroSection />

      <section
        id="report"
        className="relative z-20 -mt-[70px] px-4 md:-mt-[120px] md:px-6"
      >
        <LandingReportMockup />
      </section>

      <FeatureHighlightGrid />

      <section className="px-5 pt-12 pb-12 md:px-6 md:pt-24 md:pb-28">
        <div className={LANDING_CONTAINER_CLASS}>
          <LandingSectionHeader
            eyebrow="What Klynt analyzes"
            title="Clear insights for better product decisions"
            description="Every report breaks your page into three parts — what&apos;s wrong, what to change, and how to rewrite the words."
          />

          <AnalysisBentoGrid />
          <SocialProofBlock />
          <HowItWorksSection />
        </div>
      </section>

      <LandingCtaSection />
      <LandingFooter />
    </main>
  );
}
