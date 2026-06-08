import { DEMO_REPORT_ID } from "@/lib/demo-report";

/** Report ids that may appear in search results and expose crawler-readable content. */
export function isIndexableReportId(reportId: string): boolean {
  return reportId.trim() === DEMO_REPORT_ID;
}
