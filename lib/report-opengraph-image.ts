import { readFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { isValidReportId } from "@/lib/report-id";
import { previewImageToBuffer } from "@/lib/report-seo";
import { loadReportFromDb } from "@/lib/reports-db";
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
  if (!isValidReportId(reportId) || !isSupabaseConfigured()) {
    return loadDefaultOpenGraphImage();
  }

  try {
    const report = await loadReportFromDb(reportId);
    const previewBuffer = previewImageToBuffer(report?.previewImage);

    if (!previewBuffer) {
      return loadDefaultOpenGraphImage();
    }

    return sharp(previewBuffer)
      .resize(1200, 630, {
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
