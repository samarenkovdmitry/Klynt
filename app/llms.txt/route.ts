import { DEMO_REPORT_PATH, DEMO_REPORT_SLUG } from "@/lib/demo-report";
import { SITE_NAME, absoluteUrl, getSiteUrl } from "@/lib/site";

export function GET() {
  const siteUrl = getSiteUrl();
  const lines = [
    `# ${SITE_NAME}`,
    "",
    "> AI UX clarity analyzer for landing pages.",
    "",
    "## Sample UX report",
    absoluteUrl(DEMO_REPORT_PATH, siteUrl),
    "",
    "## Plain-text report export",
    absoluteUrl(`/api/reports/${DEMO_REPORT_SLUG}?format=text`, siteUrl),
    "",
    "## Main pages",
    absoluteUrl("/", siteUrl),
    absoluteUrl("/analyze", siteUrl),
    absoluteUrl("/landing-copy", siteUrl),
  ];

  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
