import { unstable_cache } from "next/cache";

import { getAuditedPagesCount } from "@/lib/reports-db";

export const AUDITED_PAGES_COUNT_REVALIDATE_SECONDS = 600;

export function getAuditedPagesCaption(count: number) {
  return {
    value: count.toLocaleString("en-US"),
    suffix:
      count === 1
        ? "landing page audited so far"
        : "landing pages audited so far",
  };
}

export const getCachedAuditedPagesCount = unstable_cache(
  async () => getAuditedPagesCount(),
  ["audited-pages-count"],
  { revalidate: AUDITED_PAGES_COUNT_REVALIDATE_SECONDS }
);
