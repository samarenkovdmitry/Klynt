import { FigmaLandingPage } from "@/components/landing-test/FigmaLandingPage";
import {
  AUDITED_PAGES_COUNT_REVALIDATE_SECONDS,
  getCachedAuditedPagesCount,
} from "@/lib/audit-stats";

export const revalidate = AUDITED_PAGES_COUNT_REVALIDATE_SECONDS;

export default async function Home() {
  const auditedCount = await getCachedAuditedPagesCount();

  return <FigmaLandingPage auditedCount={auditedCount} />;
}
