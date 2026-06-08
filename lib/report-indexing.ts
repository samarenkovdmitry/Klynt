import { DEMO_REPORT_SLUG } from "@/lib/demo-report";
import { isDemoReportRouteParam } from "@/lib/report-route";

/** Route params that may appear in search results and expose crawler-readable content. */
export function isIndexableReportRouteParam(routeParam: string): boolean {
  const param = routeParam.trim();

  return isDemoReportRouteParam(param) || param === DEMO_REPORT_SLUG;
}
