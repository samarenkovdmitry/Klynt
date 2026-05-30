import type { AuditReport } from "@/lib/audit-report";
import { DEMO_REPORT, DEMO_REPORT_ID } from "@/lib/demo-report";
import { isValidReportId } from "@/lib/report-id";
import { loadReportFromDb } from "@/lib/reports-db";
import { isSupabaseConfigured } from "@/lib/supabase-server";

export function isDemoReportId(reportId: string) {
  return reportId.trim() === DEMO_REPORT_ID;
}

/** Report ids that can render public metadata / OG image routes. */
export function canGenerateReportMetadata(reportId: string) {
  return isDemoReportId(reportId) || isValidReportId(reportId);
}

export async function loadReportForPublicMetadata(
  reportId: string
): Promise<AuditReport | null> {
  if (isDemoReportId(reportId)) {
    return DEMO_REPORT;
  }

  if (!isValidReportId(reportId) || !isSupabaseConfigured()) {
    return null;
  }

  return loadReportFromDb(reportId);
}
