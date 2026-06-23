import { Hero } from "@/components/landing/Hero";
import { LandingV2Page } from "@/components/landing-v2/LandingV2Page";
import {
  AUDITED_PAGES_COUNT_REVALIDATE_SECONDS,
  getCachedAuditedPagesCount,
} from "@/lib/audit-stats";

export const revalidate = AUDITED_PAGES_COUNT_REVALIDATE_SECONDS;

type HomeProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<{ v2?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { v2 } = await searchParams;

  if (v2 === "true") {
    const auditedCount = await getCachedAuditedPagesCount();
    return <LandingV2Page auditedCount={auditedCount} />;
  }

  return <Hero />;
}
