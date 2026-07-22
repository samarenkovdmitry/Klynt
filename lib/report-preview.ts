import sharp from "sharp";

import {
  REPORT_PREVIEW_HEIGHT,
  REPORT_PREVIEW_WIDTH,
} from "@/lib/report-preview-size";

export {
  REPORT_PREVIEW_DISPLAY_HEIGHT,
  REPORT_PREVIEW_DISPLAY_WIDTH,
  REPORT_PREVIEW_HEIGHT,
  REPORT_PREVIEW_WIDTH,
} from "@/lib/report-preview-size";

/** Top-of-page crop for vision extraction (keeps above-the-fold, limits token cost). */
export async function cropHeroScreenshotBase64(base64: string): Promise<string> {
  const input = Buffer.from(base64, "base64");
  const meta = await sharp(input).metadata();
  const width = meta.width ?? REPORT_PREVIEW_WIDTH;
  const maxHeroHeight = Math.round(
    width * (REPORT_PREVIEW_HEIGHT / REPORT_PREVIEW_WIDTH) * 2.5
  );
  const height = Math.min(meta.height ?? maxHeroHeight, maxHeroHeight);

  const cropped = await sharp(input)
    .extract({ left: 0, top: 0, width, height })
    .resize(768, null, { withoutEnlargement: true })
    .jpeg({ quality: 72, mozjpeg: true })
    .toBuffer();

  return cropped.toString("base64");
}

export async function buildReportPreviewImage(base64: string): Promise<string> {
  const optimized = await sharp(Buffer.from(base64, "base64"))
    .resize(REPORT_PREVIEW_WIDTH, REPORT_PREVIEW_HEIGHT, {
      fit: "cover",
      position: "top",
    })
    .sharpen({ sigma: 0.35 })
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer();

  return `data:image/jpeg;base64,${optimized.toString("base64")}`;
}
