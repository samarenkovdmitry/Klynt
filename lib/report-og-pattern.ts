import { REPORT_OG_PATTERN_SVG } from "@/lib/report-og-pattern-svg";
import {
  REPORT_HERO_PATTERN_HEIGHT,
  REPORT_HERO_PATTERN_WIDTH,
} from "@/lib/report-hero-pattern";
import { REPORT_OG_HEIGHT, REPORT_OG_WIDTH } from "@/lib/report-preview-size";

export const REPORT_OG_PATTERN_RENDER_WIDTH = Math.round(
  REPORT_HERO_PATTERN_WIDTH * (REPORT_OG_HEIGHT / REPORT_HERO_PATTERN_HEIGHT)
);

export const REPORT_OG_PATTERN_LEFT = Math.round(
  (REPORT_OG_WIDTH - REPORT_OG_PATTERN_RENDER_WIDTH) / 2
);

export function buildReportOgPatternDataUrl(gridColor: string) {
  const svg = REPORT_OG_PATTERN_SVG.replace(/fill="black"/g, `fill="${gridColor}"`);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
