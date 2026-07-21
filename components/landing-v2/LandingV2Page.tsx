import { V2HeroSplit } from "./V2HeroSplit";
import { V2WhatKlyntFinds } from "./V2WhatKlyntFinds";
import { V2TrustedBy } from "./V2TrustedBy";
import { V2SampleFinding } from "./V2SampleFinding";
import { V2Pricing } from "./V2Pricing";
import { V2FinalCta } from "./V2FinalCta";
import type { ExampleReport } from "@/lib/example-reports";
import type { AuditReport } from "@/lib/audit-report";

type LandingV2PageProps = {
  auditedCount?: number | null;
  exampleReports?: ExampleReport[];
  sampleReport?: AuditReport | null;
  sampleReportId?: string;
};

export function LandingV2Page({
  auditedCount = null,
  exampleReports = [],
  sampleReport = null,
  sampleReportId,
}: LandingV2PageProps) {
  return (
    <div className="bg-lv2-cream font-sans text-v2-dark antialiased">
      <V2HeroSplit />
      <V2WhatKlyntFinds />
      <V2TrustedBy auditedCount={auditedCount} exampleReports={exampleReports} />
      <V2SampleFinding report={sampleReport} reportId={sampleReportId} />
      <V2Pricing />
      <V2FinalCta />
    </div>
  );
}

