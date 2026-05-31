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

  const pattern = await sharp(Buffer.from(svg))
    .resize(REPORT_HERO_PATTERN_WIDTH, REPORT_HERO_PATTERN_HEIGHT)
    .png()
    .toBuffer();

  const fadeMask = Buffer.from(`
    <svg width="${REPORT_HERO_PATTERN_WIDTH}" height="${REPORT_HERO_PATTERN_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="white"/>
          <stop offset="58%" stop-color="white"/>
          <stop offset="100%" stop-color="black" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="${REPORT_HERO_PATTERN_WIDTH}" height="${REPORT_HERO_PATTERN_HEIGHT}" fill="url(#fade)"/>
    </svg>
  `);

  const faded = await sharp(pattern)
    .composite([
      {
        input: await sharp(fadeMask).png().toBuffer(),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

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
        input: faded,
        top: 0,
        left: REPORT_OG_WIDTH - REPORT_HERO_PATTERN_WIDTH,
      },
    ])
    .png()
    .toBuffer();

  return `data:image/png;base64,${canvas.toString("base64")}`;
}
