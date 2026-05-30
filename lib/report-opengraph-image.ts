import { readFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { previewImageToBuffer } from "@/lib/report-seo";
import {
  canGenerateReportMetadata,
  isDemoReportId,
  loadReportForPublicMetadata,
} from "@/lib/report-seo-loader";
import { REPORT_OG_HEIGHT, REPORT_OG_WIDTH } from "@/lib/report-preview-size";
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
    const ogBuffer = previewImageToBuffer(report?.ogPreviewImage);

    if (ogBuffer) {
      return ogBuffer;
    }

    const previewBuffer = previewImageToBuffer(report?.previewImage);

    if (!previewBuffer) {
      return loadDefaultOpenGraphImage();
    }

    return sharp(previewBuffer)
      .resize(REPORT_OG_WIDTH, REPORT_OG_HEIGHT, {
        fit: "cover",
        position: "top",
      })
      .jpeg({ quality: 86, mozjpeg: true })
      .toBuffer();
  } catch (error) {
    console.error("[report opengraph-image]", error);
    return loadDefaultOpenGraphImage();
  }
}
