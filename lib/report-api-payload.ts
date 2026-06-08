import type { AuditReport } from "@/lib/audit-report";
import { buildReportPreviewPath } from "@/lib/report-preview-url";

/** Fields kept server-side for OG generation but omitted from client API payloads. */
const API_OMITTED_FIELDS = ["ogPreviewImage", "previewImage"] as const;

export function withReportPreviewPath(
  report: AuditReport,
  routeParam: string
): AuditReport {
  const previewPath = buildReportPreviewPath(routeParam);

  if (!previewPath) {
    return report;
  }

  return {
    ...report,
    previewImage: previewPath,
  };
}

export function toReportApiPayload(report: AuditReport): AuditReport {
  const payload = { ...report };

  for (const field of API_OMITTED_FIELDS) {
    delete payload[field];
  }

  return payload;
}

export function toReportClientCachePayload(
  report: AuditReport,
  routeParam?: string
): AuditReport {
  const lean = toReportApiPayload(report);

  if (!routeParam) {
    return lean;
  }

  return withReportPreviewPath(lean, routeParam);
}
