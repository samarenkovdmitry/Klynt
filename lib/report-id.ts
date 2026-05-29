import { DEMO_REPORT_ID } from "@/lib/demo-report";

const REPORT_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidReportId(value: string) {
  const id = value.trim();

  if (!REPORT_ID_RE.test(id) || id === DEMO_REPORT_ID) {
    return false;
  }

  return true;
}

export function getReportIdFromReportUrl(reportUrl: string): string | null {
  try {
    const match = new URL(reportUrl).pathname.match(/^\/report\/([^/]+)\/?$/);
    const id = match?.[1];

    return id && isValidReportId(id) ? id : null;
  } catch {
    return null;
  }
}
