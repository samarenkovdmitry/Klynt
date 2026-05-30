import sharp from "sharp";

import {
  REPORT_OG_HEIGHT,
  REPORT_OG_WIDTH,
  REPORT_PREVIEW_HEIGHT,
  REPORT_PREVIEW_WIDTH,
} from "@/lib/report-preview-size";

export { REPORT_PREVIEW_HEIGHT, REPORT_PREVIEW_WIDTH } from "@/lib/report-preview-size";

export async function buildReportPreviewImage(base64: string): Promise<string> {
  const input = sharp(Buffer.from(base64, "base64"));
  const meta = await input.metadata();
  const sourceWidth = meta.width ?? REPORT_PREVIEW_WIDTH;
  const sourceHeight = meta.height ?? REPORT_PREVIEW_HEIGHT;
  const cropHeight = Math.min(
    sourceHeight,
    Math.max(
      REPORT_PREVIEW_HEIGHT,
      Math.round((sourceWidth * REPORT_PREVIEW_HEIGHT) / REPORT_PREVIEW_WIDTH)
    )
  );

  const optimized = await input
    .extract({
      left: 0,
      top: 0,
      width: sourceWidth,
      height: cropHeight,
    })
    .resize(REPORT_PREVIEW_WIDTH, REPORT_PREVIEW_HEIGHT, {
      fit: "cover",
      position: "top",
    })
    .sharpen({ sigma: 0.35 })
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();

  return `data:image/jpeg;base64,${optimized.toString("base64")}`;
}

export async function buildReportOgImage(base64: string): Promise<string> {
  const optimized = await sharp(Buffer.from(base64, "base64"))
    .resize(REPORT_OG_WIDTH, REPORT_OG_HEIGHT, {
      fit: "cover",
      position: "top",
    })
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();

  return `data:image/jpeg;base64,${optimized.toString("base64")}`;
}
