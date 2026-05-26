import { DEMO_REPORT_ID, getDemoReportJson, DEMO_REPORT_PATH } from "./demo-report";
import { isAuditReport } from "./audit-report";

export { DEMO_REPORT_ID, DEMO_REPORT_PATH } from "./demo-report";
export { isAuditReport, type AuditReport } from "./audit-report";

export function saveReport(reportId: string, data: object) {
  const payload = JSON.stringify(data);
  const key = `report-${reportId}`;

  sessionStorage.setItem(key, payload);

  try {
    localStorage.setItem(key, payload);
  } catch {
    // localStorage full — sessionStorage still works for this tab
  }
}

export function loadReport(reportId: string): string | null {
  if (reportId === DEMO_REPORT_ID) {
    return getDemoReportJson();
  }

  const key = `report-${reportId}`;

  return sessionStorage.getItem(key) ?? localStorage.getItem(key);
}

export function isValidAuditResponse(json: unknown): boolean {
  return isAuditReport(json);
}
