import { getDemoReportJson, DEMO_REPORT_PATH } from "./demo-report";
import { isDemoReportRouteParam } from "./report-route";
import {
  isAuditReport,
  isHeroAuditReport,
  isReportDisplayable,
} from "./audit-report";

export { DEMO_REPORT_ID, DEMO_REPORT_PATH } from "./demo-report";
export {
  isAuditReport,
  isHeroAuditReport,
  isReportDisplayable,
  type AuditReport,
} from "./audit-report";

export function saveReport(reportId: string, data: object) {
  const payload = JSON.stringify(data);
  const key = `report-${reportId}`;

  try {
    sessionStorage.setItem(key, payload);
  } catch {
    // sessionStorage unavailable or full — API fallback still works
  }

  try {
    localStorage.setItem(key, payload);
  } catch {
    // localStorage full — sessionStorage still works for this tab
  }
}

export function loadReport(routeParam: string): string | null {
  if (isDemoReportRouteParam(routeParam)) {
    return getDemoReportJson();
  }

  const key = `report-${routeParam}`;

  try {
    return sessionStorage.getItem(key) ?? localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Phase-1 analyze response — hero summary ready, findings still loading. */
export function isValidHeroAuditResponse(json: unknown): boolean {
  return isHeroAuditReport(json);
}

export function isValidAuditResponse(json: unknown): boolean {
  return isAuditReport(json);
}

export function isValidAnalyzeResponse(json: unknown): boolean {
  return isValidHeroAuditResponse(json) || isValidAuditResponse(json);
}
