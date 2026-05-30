import { headers } from "next/headers";

import { getSiteUrl } from "@/lib/site";

/** Prefer the current request host for share/OG URLs (preview deploys, prod). */
export function getRequestSiteUrl(): string {
  try {
    const headerList = headers();
    const host =
      headerList.get("x-forwarded-host")?.split(",")[0]?.trim() ??
      headerList.get("host")?.split(",")[0]?.trim();
    const proto =
      headerList.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "https";

    if (host) {
      return `${proto}://${host}`;
    }
  } catch {
    // headers() unavailable outside a request
  }

  return getSiteUrl();
}
