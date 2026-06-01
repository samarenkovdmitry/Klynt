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
