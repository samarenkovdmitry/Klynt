export const SITE_NAME = "Klynt";

export const SITE_TAGLINE = "AI UX clarity analyzer";

export const DEFAULT_DESCRIPTION =
  "Klynt finds confusing UX, weak positioning, and conversion friction on landing pages — with clear, actionable fixes you can ship.";

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

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
