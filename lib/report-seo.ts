import type { Metadata } from "next";

import type { AuditReport } from "@/lib/audit-report";
import { isIndexableReportRouteParam } from "@/lib/report-indexing";
import { formatOverallScore, formatReportDomain } from "@/lib/report-hero-theme";
import { SITE_NAME, absoluteUrl, getSiteUrl } from "@/lib/site";

export type ReportShareContext = {
  url?: string;
  score?: number;
  verdict?: string;
};

export function buildShareText(context?: ReportShareContext) {
  const score =
    context?.score != null && Number.isFinite(Number(context.score))
      ? formatOverallScore(context.score)
      : null;

  // Avoid bare domains in share text — messengers linkify them and show the
  // audited site's OG preview instead of the Klynt report link.
  if (score) {
    return `UX clarity score ${score}/10 — full report on Klynt`;
  }

  return "UX clarity report — Klynt";
}

export function buildShareEmailSubject(context?: ReportShareContext) {
  const domain = formatReportDomain(context?.url);
  const score =
    context?.score != null && Number.isFinite(Number(context.score))
      ? formatOverallScore(context.score)
      : null;

  if (domain && score) {
    return `${domain} UX report (${score}/10) — Klynt`;
  }

  return "Klynt UX Report";
}

export function buildReportOgTitle(report: Pick<AuditReport, "score" | "url">) {
  const score = formatOverallScore(report.score);
  const domain = formatReportDomain(report.url);

  if (domain) {
    return `UX clarity score ${score}/10 for ${domain} — full report on ${SITE_NAME}`;
  }

  return `UX clarity score ${score}/10 — full report on ${SITE_NAME}`;
}

export function buildReportOgDescription(
  report: Pick<AuditReport, "verdict" | "summary">
) {
  const verdict = report.verdict?.trim();

  if (verdict) {
    return verdict.length > 160 ? `${verdict.slice(0, 157)}…` : verdict;
  }

  const summary = report.summary?.trim();

  if (summary) {
    return summary.length > 160 ? `${summary.slice(0, 157)}…` : summary;
  }

  return "AI UX clarity report — actionable findings for landing pages.";
}

export function getReportOpenGraphImagePath(routeSlug: string) {
  return `/report/${routeSlug}/opengraph-image`;
}

export function getReportOpenGraphImageUrl(
  routeSlug: string,
  baseUrl = getSiteUrl()
) {
  return absoluteUrl(getReportOpenGraphImagePath(routeSlug), baseUrl);
}

export function buildReportMetadata(
  routeSlug: string,
  report: AuditReport,
  siteUrl = getSiteUrl(),
  options?: { index?: boolean }
): Metadata {
  const title = buildReportOgTitle(report);
  const description = buildReportOgDescription(report);
  const pageUrl = absoluteUrl(`/report/${routeSlug}`, siteUrl);
  const imageUrl = getReportOpenGraphImageUrl(routeSlug, siteUrl);
  const index = options?.index ?? isIndexableReportRouteParam(routeSlug);

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    robots: {
      index,
      follow: true,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: pageUrl,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          type: "image/png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export async function previewImageToBuffer(previewImage?: string): Promise<Buffer | null> {
  if (!previewImage) {
    return null;
  }

  if (previewImage.startsWith("data:image")) {
    const match = previewImage.match(/^data:image\/[\w+.-]+;base64,(.+)$/);
    if (!match?.[1]) {
      return null;
    }

    try {
      return Buffer.from(match[1], "base64");
    } catch {
      return null;
    }
  }

  if (previewImage.startsWith("http://") || previewImage.startsWith("https://")) {
    try {
      const response = await fetch(previewImage, {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        return null;
      }

      return Buffer.from(await response.arrayBuffer());
    } catch {
      return null;
    }
  }

  return null;
}

