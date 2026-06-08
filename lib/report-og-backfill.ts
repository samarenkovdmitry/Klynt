import type { AuditReport } from "@/lib/audit-report";
import { generateReportOgPreviewDataUrl } from "@/lib/report-opengraph-image";
import { updateReportOgPreviewInDb } from "@/lib/reports-db";

export function scheduleReportOgBackfill(
  reportId: string,
  report: AuditReport,
  previewImage?: string
) {
  const task = (async () => {
    const ogPreviewImage = await generateReportOgPreviewDataUrl(report, previewImage);

    if (!ogPreviewImage) {
      return;
    }

    await updateReportOgPreviewInDb(reportId, ogPreviewImage);
  })().catch((error) => {
    console.error("[analyze] Background OG backfill failed:", error);
  });

  void (async () => {
    try {
      const { waitUntil } = await import("@vercel/functions");
      waitUntil(task);
    } catch {
      void task;
    }
  })();
}
