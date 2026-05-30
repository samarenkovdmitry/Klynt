import type { Metadata } from "next";

import type { AuditReport } from "@/lib/audit-report";
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

export function buildReportOgTitle(report: Pick<AuditReport, "score">) {
  const score = formatOverallScore(report.score);
  return `UX clarity score ${score}/10`;
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

export function getReportOpenGraphImagePath(reportId: string) {
  return `/report/${reportId}/preview.jpg`;
}

export function getReportOpenGraphImageUrl(
  reportId: string,
  baseUrl = getSiteUrl()
) {
  return absoluteUrl(getReportOpenGraphImagePath(reportId), baseUrl);
}

export function buildReportMetadata(
  reportId: string,
  report: AuditReport,
  siteUrl = getSiteUrl()
): Metadata {
  const title = buildReportOgTitle(report);
  const description = buildReportOgDescription(report);
  const pageUrl = absoluteUrl(`/report/${reportId}`, siteUrl);
  const imageUrl = getReportOpenGraphImageUrl(reportId, siteUrl);

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    robots: {
      index: false,
      follow: true,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: pageUrl,
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          type: "image/jpeg",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [imageUrl],
    },
  };
}

export function previewImageToBuffer(previewImage?: string): Buffer | null {
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

  return null;
}

export function getReportOgImageBuffer(
  report?: Pick<AuditReport, "ogPreviewImage" | "previewImage">
): Buffer | null {
  return (
    previewImageToBuffer(report?.ogPreviewImage) ??
    previewImageToBuffer(report?.previewImage)
  );
}
