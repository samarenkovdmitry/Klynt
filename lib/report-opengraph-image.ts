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

const FALLBACK_IMAGE_PATHS = [
  path.join(process.cwd(), "public", "og-fallback.jpg"),
  path.join(process.cwd(), "app", "opengraph-image.jpg"),
  path.join(process.cwd(), ".next", "server", "app", "opengraph-image.jpg"),
];

async function loadDefaultOpenGraphImage() {
  for (const filePath of FALLBACK_IMAGE_PATHS) {
    try {
      return await readFile(filePath);
    } catch {
      continue;
    }
  }

  throw new Error("Default Open Graph image not found");
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

    return await composeReportOpenGraphImage(report, previewBuffer);
  } catch (error) {
    console.error("[report opengraph-image]", error);

    try {
      return await loadDefaultOpenGraphImage();
    } catch (fallbackError) {
      console.error("[report opengraph-image] fallback failed", fallbackError);
      throw fallbackError;
    }
  }
}
