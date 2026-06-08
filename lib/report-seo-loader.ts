import type { AuditReport } from "@/lib/audit-report";
import { DEMO_REPORT, DEMO_REPORT_ID } from "@/lib/demo-report";
import { isValidReportId } from "@/lib/report-id";
import {
  isDemoReportRouteParam,
  resolveReportRouteParam,
} from "@/lib/report-route";
import { isReportSlug } from "@/lib/report-slug";
import { loadReportFromDb } from "@/lib/reports-db";
import { isSupabaseConfigured } from "@/lib/supabase-server";

export function isDemoReportId(reportId: string) {
  return reportId.trim() === DEMO_REPORT_ID;
}

/** Route params that can render public metadata / OG image routes. */
export function canGenerateReportMetadata(routeParam: string) {
  const param = routeParam.trim();

  return (
    isDemoReportRouteParam(param) ||
    isValidReportId(param) ||
    isReportSlug(param)
  );
}

export async function loadReportForPublicMetadata(
  routeParam: string
): Promise<AuditReport | null> {
  if (isDemoReportRouteParam(routeParam)) {
    return DEMO_REPORT;
  }

  const resolved = await resolveReportRouteParam(routeParam);

  if (!resolved) {
    return null;
  }

  if (isDemoReportId(resolved.reportId)) {
    return DEMO_REPORT;
  }

  if (!isValidReportId(resolved.reportId) || !isSupabaseConfigured()) {
    return null;
  }

  return loadReportFromDb(resolved.reportId);
}
