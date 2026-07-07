import { Hero } from "@/components/landing/Hero";
import { LandingV2Page } from "@/components/landing-v2/LandingV2Page";
import {
  AUDITED_PAGES_COUNT_REVALIDATE_SECONDS,
  getCachedAuditedPagesCount,
} from "@/lib/audit-stats";
import { fetchExampleReports, type ExampleReport } from "@/lib/example-reports";
import { loadReportFromDb } from "@/lib/reports-db";
import type { AuditReport } from "@/lib/audit-report";

export const revalidate = AUDITED_PAGES_COUNT_REVALIDATE_SECONDS;

const SAMPLE_FINDING_REPORT_ID = "quvekkudcw"; // notion.so

type HomeProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<Record<string, never>>;
};

export default async function Home(_props: HomeProps) {
  const [auditedCount, exampleReports, sampleReport] = await Promise.all([
    getCachedAuditedPagesCount(),
    fetchExampleReports(6),
    loadReportFromDb(SAMPLE_FINDING_REPORT_ID),
  ]);
  return (
    <LandingV2Page
      auditedCount={auditedCount}
      exampleReports={exampleReports}
      sampleReport={sampleReport}
      sampleReportId={SAMPLE_FINDING_REPORT_ID}
    />
  );

  // return <Hero />;
}
