import type { AuditReport } from "@/lib/audit-report";
import { isReportDisplayable } from "@/lib/audit-report";
import { toReportClientCachePayload } from "@/lib/report-api-payload";
import { loadReport, saveReport } from "@/lib/report-storage";

const REPORT_FETCH_TIMEOUT_MS = 15000;

function parseReportPayload(
  value: unknown,
  routeParam: string
): AuditReport | null {
  if (!isReportDisplayable(value)) {
    return null;
  }

  return toReportClientCachePayload(value, routeParam);
}

async function fetchReportPayload(routeParam: string): Promise<AuditReport | null> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    REPORT_FETCH_TIMEOUT_MS
  );

  try {
    const res = await fetch(`/api/reports/${encodeURIComponent(routeParam)}`, {
      signal: controller.signal,
      priority: "high",
    } as RequestInit);

    if (!res.ok) {
      return null;
    }

    return parseReportPayload(await res.json(), routeParam);
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function prefetchReportRoute(routeParam: string) {
  const param = routeParam.trim();

  if (!param || loadReport(param)) {
    return;
  }

  void fetchReportPayload(param).then((report) => {
    if (!report) {
      return;
    }

    try {
      saveReport(param, report);
    } catch {
      // Prefetch is best-effort
    }
  });
}

export async function warmReportRouteCache(
  routeParam: string,
  report?: AuditReport
) {
  const param = routeParam.trim();

  if (!param) {
    return;
  }

  if (report) {
    try {
      saveReport(param, toReportClientCachePayload(report, param));
    } catch {
      // Navigation still works via in-memory state on the next page
    }
    return;
  }

  if (loadReport(param)) {
    return;
  }

  const fetched = await fetchReportPayload(param);

  if (!fetched) {
    return;
  }

  try {
    saveReport(param, fetched);
  } catch {
    // Best-effort cache warm-up
  }
}
