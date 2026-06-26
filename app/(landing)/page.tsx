import { Hero } from "@/components/landing/Hero";
import { LandingV2Page } from "@/components/landing-v2/LandingV2Page";
import {
  AUDITED_PAGES_COUNT_REVALIDATE_SECONDS,
  getCachedAuditedPagesCount,
} from "@/lib/audit-stats";

export const revalidate = AUDITED_PAGES_COUNT_REVALIDATE_SECONDS;

type HomeProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<Record<string, never>>;
};

export default async function Home(_props: HomeProps) {
  const auditedCount = await getCachedAuditedPagesCount();
  return <LandingV2Page auditedCount={auditedCount} />;

  // return <Hero />;
}
