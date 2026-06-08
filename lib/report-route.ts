import {
  DEMO_REPORT_ID,
  DEMO_REPORT_PATH,
  DEMO_REPORT_SLUG,
  DEMO_REPORT_URL,
} from "@/lib/demo-report";
import { isValidReportId } from "@/lib/report-id";
import {
  buildReportSlug,
  extractReportRouteSegment,
  isReportSlug,
  parseReportSlug,
  slugifyReportDomain,
} from "@/lib/report-slug";
import { findReportIdBySlugInDb, loadReportFromDb } from "@/lib/reports-db";

export type ResolvedReportRoute = {
  reportId: string;
  slug: string;
  path: string;
};

export function isDemoReportRouteParam(routeParam: string) {
  const param = routeParam.trim();

  return param === DEMO_REPORT_ID || param === DEMO_REPORT_SLUG;
}

export function buildReportPath(reportId: string, auditedUrl?: string) {
  if (isDemoReportRouteParam(reportId) || reportId.trim() === DEMO_REPORT_ID) {
    return DEMO_REPORT_PATH;
  }

  return `/report/${buildReportSlug(reportId, auditedUrl)}`;
}

export function shouldRedirectToCanonicalSlug(
  routeParam: string,
  resolved: ResolvedReportRoute
) {
  return routeParam.trim() !== resolved.slug;
}

export async function resolveReportRouteParam(
  routeParam: string
): Promise<ResolvedReportRoute | null> {
  const param = routeParam.trim();

  if (!param) {
    return null;
  }

  if (isDemoReportRouteParam(param)) {
    return {
      reportId: DEMO_REPORT_ID,
      slug: DEMO_REPORT_SLUG,
      path: DEMO_REPORT_PATH,
    };
  }

  if (isReportSlug(param)) {
    const reportId = await findReportIdBySlug(param);

    if (!reportId) {
      return null;
    }

    return {
      reportId,
      slug: param,
      path: `/report/${param}`,
    };
  }

  if (isValidReportId(param)) {
    const report = await loadReportFromDb(param);
    const slug = buildReportSlug(param, report?.url);

    return {
      reportId: param,
      slug,
      path: `/report/${slug}`,
    };
  }

  return null;
}

export async function getReportIdFromReportUrl(reportUrl: string) {
  const segment = extractReportRouteSegment(reportUrl);

  if (!segment) {
    return null;
  }

  const resolved = await resolveReportRouteParam(segment);
  return resolved?.reportId ?? null;
}

async function findReportIdBySlug(slug: string) {
  const parsed = parseReportSlug(slug);

  if (!parsed) {
    return null;
  }

  if (slug === DEMO_REPORT_SLUG) {
    return DEMO_REPORT_ID;
  }

  const reportId = await findReportIdBySlugInDb(parsed.idSuffix, parsed.domainSlug);

  if (reportId) {
    return reportId;
  }

  if (
    parsed.domainSlug === slugifyReportDomain(DEMO_REPORT_URL) &&
    parsed.idSuffix === DEMO_REPORT_ID.slice(0, 4)
  ) {
    return DEMO_REPORT_ID;
  }

  return null;
}
