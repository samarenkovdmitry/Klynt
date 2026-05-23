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
  const key = `report-${reportId}`;

  return sessionStorage.getItem(key) ?? localStorage.getItem(key);
}

export function isValidAuditResponse(json: unknown): boolean {
  if (!json || typeof json !== "object") return false;

  const data = json as Record<string, unknown>;

  if (typeof data.error === "string" && data.error.length > 0) return false;

  const hasScore = Number.isFinite(Number(data.score));
  const hasIssues =
    Array.isArray(data.issues) && data.issues.length > 0;

  return hasScore && hasIssues;
}
