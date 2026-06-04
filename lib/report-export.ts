export function openReportPrintExport(reportId: string) {
  if (!reportId.trim()) return;

  const url = `/report/${encodeURIComponent(reportId.trim())}/print?autoprint=1`;
  window.open(url, "_blank", "noopener,noreferrer");
}
