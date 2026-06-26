import { V2Header } from "./V2Header";
import { V2HeroSplit } from "./V2HeroSplit";
import { V2WhatKlyntFinds } from "./V2WhatKlyntFinds";
import { V2TrustedBy } from "./V2TrustedBy";
import { V2SampleFinding } from "./V2SampleFinding";
import { V2Pricing } from "./V2Pricing";
import { V2FinalCta } from "./V2FinalCta";
import { V2Footer } from "./V2Footer";

type LandingV2PageProps = {
  auditedCount?: number | null;
};

export function LandingV2Page({ auditedCount = null }: LandingV2PageProps) {
  return (
    <div className="bg-lv2-cream font-sans text-v2-dark antialiased">
      <V2Header />
      <V2HeroSplit />
      <V2WhatKlyntFinds />
      <V2TrustedBy auditedCount={auditedCount} />
      <V2SampleFinding />
      <V2Pricing />
      <V2FinalCta />
      <V2Footer />
    </div>
  );
}

