import { DEMO_REPORT_ID } from "@/lib/demo-report";

/** URL-safe short id, e.g. `k7m2x9p4q1` (10 chars). */
export const SHORT_REPORT_ID_LENGTH = 10;

const SHORT_REPORT_ID_RE = /^[0-9a-z]{10}$/;

const UUID_REPORT_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SHORT_ID_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

export function generateReportId(): string {
  const bytes = new Uint8Array(SHORT_REPORT_ID_LENGTH);
  globalThis.crypto.getRandomValues(bytes);

  return Array.from(
    bytes,
    (byte) => SHORT_ID_ALPHABET[byte % SHORT_ID_ALPHABET.length]
  ).join("");
}

export function isValidReportId(value: string) {
  const id = value.trim();

  if (id === DEMO_REPORT_ID) {
    return false;
  }

  return SHORT_REPORT_ID_RE.test(id) || UUID_REPORT_ID_RE.test(id);
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
