import { readFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import {
  REPORT_HERO_PATTERN_HEIGHT,
  REPORT_HERO_PATTERN_WIDTH,
} from "@/lib/report-hero-pattern";
import { REPORT_OG_HEIGHT, REPORT_OG_WIDTH } from "@/lib/report-preview-size";

export async function buildReportOgPatternDataUrl(gridColor: string) {
  const svgPath = path.join(process.cwd(), "public", "report", "klynt-analyze-bg.svg");
  const svg = (await readFile(svgPath, "utf8")).replace(/fill="black"/g, `fill="${gridColor}"`);

  const patternWidth = Math.round(
    REPORT_HERO_PATTERN_WIDTH * (REPORT_OG_HEIGHT / REPORT_HERO_PATTERN_HEIGHT)
  );

  const pattern = await sharp(Buffer.from(svg))
    .resize(patternWidth, REPORT_OG_HEIGHT, { fit: "fill" })
    .png()
    .toBuffer();

  const left = Math.round((REPORT_OG_WIDTH - patternWidth) / 2);

  const canvas = await sharp({
    create: {
      width: REPORT_OG_WIDTH,
      height: REPORT_OG_HEIGHT,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: pattern,
        top: 0,
        left,
      },
    ])
    .png()
    .toBuffer();

  return `data:image/png;base64,${canvas.toString("base64")}`;
}
