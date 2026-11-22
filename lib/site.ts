export const SITE_NAME = "Klynt";

export const SITE_TAGLINE = "Project truth layer";

export const DEFAULT_DESCRIPTION =
  "Klynt keeps track of project decisions across your team's tools and flags changes that could put those decisions in question.";

/** Production canonical origin (no trailing slash). */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/\/$/, "")}`;
  }

  return "https://klynt.one";
}

export function absoluteUrl(path: string, baseUrl = getSiteUrl()): string {
  const base = baseUrl.replace(/\/$/, "");
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
