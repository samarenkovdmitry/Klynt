export const PRINT_AUTOPRINT_STORAGE_KEY = "klynt-print-autoprint";

export function openReportPrintExport(reportId: string) {
  const id = reportId.trim();
  if (!id) return;

  try {
    sessionStorage.setItem(PRINT_AUTOPRINT_STORAGE_KEY, id);
  } catch {
    // Private mode / blocked storage — print page still opens manually
  }

  window.open(`/report/${encodeURIComponent(id)}/print`, "_blank", "noopener,noreferrer");
}

export function consumePrintAutoprint(reportId: string | undefined) {
  if (!reportId) return false;

  try {
    if (sessionStorage.getItem(PRINT_AUTOPRINT_STORAGE_KEY) !== reportId) {
      return false;
    }

    sessionStorage.removeItem(PRINT_AUTOPRINT_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function buildPrintDocumentTitle(domain: string) {
  const site = domain.trim() || "Landing page";
  return `Klynt UX Report — ${site}`;
}
