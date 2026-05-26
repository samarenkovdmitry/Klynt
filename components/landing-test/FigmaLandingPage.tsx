import { LandingReportMockup } from "@/components/LandingReportMockup";
import { LandingHeroSection } from "@/components/landing/LandingHeroSection";
import { LandingUpdateCtaSection } from "@/components/landing-test/LandingUpdateCtaSection";
import { LandingUpdateHowItWorks } from "@/components/landing-test/LandingUpdateHowItWorks";
import { LandingUpdatePlatform } from "@/components/landing-test/LandingUpdatePlatform";
import { LandingUpdateReportPreview } from "@/components/landing-test/LandingUpdateReportPreview";
import { LandingUpdateTestimonial } from "@/components/landing-test/LandingUpdateTestimonial";
import { LandingUpdateThreeLenses } from "@/components/landing-test/LandingUpdateThreeLenses";

export function FigmaLandingPage() {
  return (
    <main className="min-w-[1040px] overflow-hidden bg-[#F5F7FA] text-[#061C2F]">
      <LandingHeroSection />

      <section
        id="report"
        className="relative z-20 -mt-[120px] px-6"
      >
        <LandingReportMockup />
      </section>

      <LandingUpdateThreeLenses />
      <LandingUpdateHowItWorks />
      <LandingUpdatePlatform />
      <LandingUpdateReportPreview />
      <LandingUpdateTestimonial />
      <LandingUpdateCtaSection />
    </main>
  );
}
