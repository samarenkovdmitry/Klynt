import { readFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import type { AuditReport } from "@/lib/audit-report";
import {
  formatOverallScore,
  formatReportDomain,
  getReportHeroTheme,
} from "@/lib/report-hero-theme";
import {
  REPORT_OG_HEIGHT,
  REPORT_OG_WIDTH,
  REPORT_PREVIEW_HEIGHT,
  REPORT_PREVIEW_WIDTH,
} from "@/lib/report-preview-size";

const PREVIEW_SCALE = 2.35;
const PREVIEW_CARD_WIDTH = Math.round(REPORT_PREVIEW_WIDTH * PREVIEW_SCALE);
const PREVIEW_CARD_HEIGHT = Math.round(REPORT_PREVIEW_HEIGHT * PREVIEW_SCALE);
const PREVIEW_CARD_RADIUS = 20;
const PREVIEW_CARD_X = Math.round((REPORT_OG_WIDTH - PREVIEW_CARD_WIDTH) / 2);
const PREVIEW_CARD_Y = 118;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncateText(value: string, maxLength: number) {
  const trimmed = value.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 1)}…`;
}

async function loadKlyntLogoPng() {
  const svgPath = path.join(process.cwd(), "public", "klynt-logo-dark.svg");
  const svg = await readFile(svgPath);

  return sharp(svg).resize(132, 40).png().toBuffer();
}

async function roundedImage(
  input: Buffer,
  width: number,
  height: number,
  radius: number
) {
  const resized = await sharp(input)
    .resize(width, height, { fit: "cover", position: "top" })
    .png()
    .toBuffer();

  const mask = Buffer.from(
    `<svg width="${width}" height="${height}"><rect width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`
  );

  return sharp(resized)
    .composite([{ input: await sharp(mask).png().toBuffer(), blend: "dest-in" }])
    .png()
    .toBuffer();
}

function buildOverlaySvg(params: {
  domain: string;
  scoreLabel: string;
  subtitle: string;
  badgeBg: string;
  heroBg: string;
}) {
  const { domain, scoreLabel, subtitle, badgeBg, heroBg } = params;
  const badgeX = PREVIEW_CARD_X + PREVIEW_CARD_WIDTH - 92;
  const badgeY = PREVIEW_CARD_Y - 28;

  return Buffer.from(`
    <svg width="${REPORT_OG_WIDTH}" height="${REPORT_OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${REPORT_OG_WIDTH}" height="${REPORT_OG_HEIGHT}" fill="${heroBg}"/>
      <rect x="${PREVIEW_CARD_X - 3}" y="${PREVIEW_CARD_Y - 3}" width="${PREVIEW_CARD_WIDTH + 6}" height="${PREVIEW_CARD_HEIGHT + 6}" rx="${PREVIEW_CARD_RADIUS + 2}" fill="#ffffff" stroke="rgba(6,28,47,0.09)" stroke-width="2"/>
      <rect x="${badgeX}" y="${badgeY}" width="72" height="36" rx="18" fill="${badgeBg}"/>
      <text x="${badgeX + 36}" y="${badgeY + 24}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#ffffff">${escapeXml(scoreLabel)}</text>
      <text x="72" y="72" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="600" fill="rgba(6,28,47,0.55)">${escapeXml(subtitle)}</text>
      <text x="${REPORT_OG_WIDTH / 2}" y="${PREVIEW_CARD_Y + PREVIEW_CARD_HEIGHT + 44}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="500" fill="rgba(6,28,47,0.55)">${escapeXml(domain)}</text>
    </svg>
  `);
}

export async function composeReportOpenGraphImage(
  report: Pick<AuditReport, "url" | "score" | "verdict" | "summary">,
  previewBuffer: Buffer
) {
  const theme = getReportHeroTheme(report.score);
  const domain = formatReportDomain(report.url) || "Landing page";
  const scoreLabel = formatOverallScore(report.score);
  const subtitle = truncateText(
    report.verdict || report.summary || "UX clarity report",
    72
  );

  const [logo, previewCard, overlay] = await Promise.all([
    loadKlyntLogoPng(),
    roundedImage(
      previewBuffer,
      PREVIEW_CARD_WIDTH,
      PREVIEW_CARD_HEIGHT,
      PREVIEW_CARD_RADIUS
    ),
    Promise.resolve(
      buildOverlaySvg({
        domain,
        scoreLabel,
        subtitle,
        badgeBg: theme.badgeBg,
        heroBg: theme.heroBg,
      })
    ),
  ]);

  return sharp(overlay)
    .composite([
      { input: logo, top: 48, left: 72 },
      { input: previewCard, top: PREVIEW_CARD_Y, left: PREVIEW_CARD_X },
    ])
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();
}
