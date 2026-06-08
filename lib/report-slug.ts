import { formatReportDomain } from "@/lib/report-hero-theme";

export const REPORT_SLUG_SUFFIX_LENGTH = 4;

const REPORT_SLUG_RE =
  /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?-[a-z0-9]{4}$/;

const UUID_REPORT_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sanitizeSlugPart(value: string) {
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned || "site";
}

export function slugifyReportDomain(url?: string) {
  if (!url?.trim()) {
    return "site";
  }

  const hostname = formatReportDomain(url);
  const labels = hostname.split(".").filter(Boolean);

  if (labels.length === 0) {
    return "site";
  }

  if (labels.length === 1) {
    return sanitizeSlugPart(labels[0]);
  }

  return sanitizeSlugPart(labels[labels.length - 2]);
}

export function getReportIdSuffix(reportId: string) {
  const id = reportId.trim();

  if (UUID_REPORT_ID_RE.test(id)) {
    return id.replace(/-/g, "").slice(0, REPORT_SLUG_SUFFIX_LENGTH).toLowerCase();
  }

  return id.slice(0, REPORT_SLUG_SUFFIX_LENGTH).toLowerCase();
}

export function buildReportSlug(reportId: string, auditedUrl?: string) {
  return `${slugifyReportDomain(auditedUrl)}-${getReportIdSuffix(reportId)}`;
}

export function isReportSlug(value: string) {
  return REPORT_SLUG_RE.test(value.trim());
}

export function parseReportSlug(slug: string) {
  const trimmed = slug.trim();

  if (!isReportSlug(trimmed)) {
    return null;
  }

  const dashIndex = trimmed.lastIndexOf("-");

  return {
    domainSlug: trimmed.slice(0, dashIndex),
    idSuffix: trimmed.slice(dashIndex + 1),
  };
}

export function extractReportRouteSegment(reportUrl: string) {
  try {
    const match = new URL(reportUrl).pathname.match(/^\/report\/([^/]+)\/?$/);
    return match?.[1]?.trim() ?? null;
  } catch {
    return null;
  }
}
