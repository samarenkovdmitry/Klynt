import { unstable_cache } from "next/cache";

import { getAuditedPagesCount } from "@/lib/reports-db";

export const AUDITED_PAGES_COUNT_REVALIDATE_SECONDS = 600;

export function formatAuditedPagesLabel(count: number) {
  const formatted = count.toLocaleString("en-US");

  return count === 1
    ? "1 landing page audited"
    : `${formatted} landing pages audited`;
}

export const getCachedAuditedPagesCount = unstable_cache(
  async () => getAuditedPagesCount(),
  ["audited-pages-count"],
  { revalidate: AUDITED_PAGES_COUNT_REVALIDATE_SECONDS }
);
