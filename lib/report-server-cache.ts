import { cache } from "react";

import type { AuditReport } from "@/lib/audit-report";
import { toReportApiPayload, withReportPreviewPath } from "@/lib/report-api-payload";
import type { ResolvedReportRoute } from "@/lib/report-route";
import { resolveReportRouteParam } from "@/lib/report-route";
import { loadReportForPublicMetadata } from "@/lib/report-seo-loader";

export type ReportRouteBundle = {
  resolved: ResolvedReportRoute | null;
  report: AuditReport | null;
};

export const getCachedReportRouteBundle = cache(
  async (routeParam: string): Promise<ReportRouteBundle> => {
    const param = routeParam.trim();

    if (!param) {
      return { resolved: null, report: null };
    }

    const resolved = await resolveReportRouteParam(param);
    const raw = await loadReportForPublicMetadata(param);

    return {
      resolved,
      report:
        raw && resolved
          ? withReportPreviewPath(toReportApiPayload(raw), resolved.slug)
          : null,
    };
  }
);
