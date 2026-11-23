import { SITE_NAME, absoluteUrl, getSiteUrl } from "@/lib/site";

export function GET() {
  const siteUrl = getSiteUrl();
  const lines = [
    `# ${SITE_NAME}`,
    "",
    "> Project truth layer. Keeps track of project decisions across your team's tools and flags changes that could put them in question.",
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
