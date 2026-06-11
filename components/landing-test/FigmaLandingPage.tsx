import { LandingTestCtaSection } from "@/components/landing-test/LandingTestCtaSection";
import {
  LandingFeaturesDivider,
  LandingTestFeatures,
} from "@/components/landing-test/LandingTestFeatures";
import { LandingTestFooter } from "@/components/landing-test/LandingTestFooter";
import { LandingTestHero } from "@/components/landing-test/LandingTestHero";
import {
  LandingHowItWorksDivider,
  LandingTestHowItWorks,
} from "@/components/landing-test/LandingTestHowItWorks";
import { LandingTestSeo } from "@/components/landing-test/LandingTestSeo";
import { LANDING_DARK, LANDING_CONTAINER, LANDING_DIVIDER } from "@/components/landing-test/landingPageStyles";

type FigmaLandingPageProps = {
  auditedCount?: number | null;
};

export function FigmaLandingPage({ auditedCount = null }: FigmaLandingPageProps) {
  return (
    <main className="text-[#F2F2EF]" style={{ backgroundColor: LANDING_DARK }}>
      <LandingTestHero auditedCount={auditedCount} />
      <LandingHowItWorksDivider />
      <LandingTestHowItWorks />
      <div className={LANDING_CONTAINER}>
        <div className={LANDING_DIVIDER} aria-hidden />
      </div>
      <LandingTestFeatures />
      <LandingFeaturesDivider />
      <LandingTestCtaSection />
      <LandingTestSeo />
      <div className={LANDING_CONTAINER}>
        <div className={LANDING_DIVIDER} aria-hidden />
      </div>
      <LandingTestFooter />
    </main>
  );
}
