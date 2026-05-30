import { readFile } from "node:fs/promises";
import path from "node:path";

import { previewImageToBuffer } from "@/lib/report-seo";
import { composeReportOpenGraphImage } from "@/lib/report-og-composer";
import {
  canGenerateReportMetadata,
  isDemoReportId,
  loadReportForPublicMetadata,
} from "@/lib/report-seo-loader";
import { isSupabaseConfigured } from "@/lib/supabase-server";

export const REPORT_OG_IMAGE_HEADERS = {
  "Content-Type": "image/jpeg",
  "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
} as const;

async function loadDefaultOpenGraphImage() {
  const filePath = path.join(process.cwd(), "app", "opengraph-image.jpg");
  return readFile(filePath);
}

export async function buildReportOpenGraphJpeg(reportId: string) {
  if (!canGenerateReportMetadata(reportId)) {
    return loadDefaultOpenGraphImage();
  }

  if (!isDemoReportId(reportId) && !isSupabaseConfigured()) {
    return loadDefaultOpenGraphImage();
  }

  try {
    const report = await loadReportForPublicMetadata(reportId);
    const previewBuffer =
      previewImageToBuffer(report?.previewImage) ??
      previewImageToBuffer(report?.ogPreviewImage);

    if (!report || !previewBuffer) {
      return loadDefaultOpenGraphImage();
    }

    return composeReportOpenGraphImage(report, previewBuffer);
  } catch (error) {
    console.error("[report opengraph-image]", error);
    return loadDefaultOpenGraphImage();
  }
}
