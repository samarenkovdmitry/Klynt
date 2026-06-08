import type { AuditReport } from "@/lib/audit-report";

/** Fields kept server-side for OG generation but omitted from client API payloads. */
const API_OMITTED_FIELDS = ["ogPreviewImage"] as const;

export function toReportApiPayload(report: AuditReport): AuditReport {
  const payload = { ...report };

  for (const field of API_OMITTED_FIELDS) {
    delete payload[field];
  }

  return payload;
}

export function toReportClientCachePayload(report: AuditReport): AuditReport {
  return toReportApiPayload(report);
}
