import { SITE_NAME, absoluteUrl, getSiteUrl } from "@/lib/site";

export function GET() {
  const siteUrl = getSiteUrl();
  const lines = [
    `# ${SITE_NAME}`,
    "",
    "> Project truth layer — keeps track of what is currently true across Figma, Slack, and docs.",
    "",
    "## Main pages",
    absoluteUrl("/", siteUrl),
    "",
    "## Contact",
    "hello@klynt.one",
  ];

  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
