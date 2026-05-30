import sharp from "sharp";

import type { AuditReport } from "@/lib/audit-report";
import {
  formatOverallScore,
  formatReportDomain,
  getReportHeroTheme,
} from "@/lib/report-hero-theme";
import { getReportOgFontFaces, REPORT_OG_FONT_FAMILY } from "@/lib/report-og-fonts";
import {
  REPORT_OG_HEIGHT,
  REPORT_OG_WIDTH,
} from "@/lib/report-preview-size";

const CARD_RADIUS = 32;
const PADDING = 48;
const PREVIEW_WIDTH = 520;
const PREVIEW_HEIGHT = 400;
const PREVIEW_X = REPORT_OG_WIDTH - PADDING - PREVIEW_WIDTH;
const PREVIEW_Y = Math.round((REPORT_OG_HEIGHT - PREVIEW_HEIGHT) / 2);
const SCORE_CIRCLE_R = 36;

type ReportOgInput = Pick<AuditReport, "url" | "score" | "verdict" | "summary">;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(text: string, maxCharsPerLine: number, maxLines: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;

    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }

    if (lines.length >= maxLines) {
      break;
    }
  }

  if (lines.length < maxLines && current) {
    lines.push(current);
  }

  if (lines.length === maxLines) {
    const usedWords = lines.join(" ").split(/\s+/).length;
    if (usedWords < words.length) {
      lines[maxLines - 1] = `${lines[maxLines - 1].replace(/…?$/, "")}…`;
    }
  }

  return lines;
}

function svgTextBlock(params: {
  lines: string[];
  x: number;
  y: number;
  fontSize: number;
  fontWeight?: number;
  fill: string;
  fillOpacity?: number;
  lineHeight?: number;
}) {
  const lineHeight = params.lineHeight ?? Math.round(params.fontSize * 1.28);
  const opacityAttr =
    params.fillOpacity !== undefined
      ? ` fill-opacity="${params.fillOpacity}"`
      : "";

  return params.lines
    .map(
      (line, index) =>
        `<text x="${params.x}" y="${params.y + index * lineHeight}" font-family=${REPORT_OG_FONT_FAMILY} font-size="${params.fontSize}" font-weight="${params.fontWeight ?? 400}" fill="${params.fill}"${opacityAttr}>${escapeXml(line)}</text>`
    )
    .join("");
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

function buildCardSvg(params: {
  fontFaces: string;
  domain: string;
  headlineLines: string[];
  scoreLabel: string;
  scoreCircleX: number;
  scoreCircleY: number;
  heroBg: string;
  badgeBg: string;
}) {
  const {
    fontFaces,
    domain,
    headlineLines,
    scoreLabel,
    scoreCircleX,
    scoreCircleY,
    heroBg,
    badgeBg,
  } = params;

  const headlineY = 132;
  const headlineLineHeight = 46;
  const scoreRowY = REPORT_OG_HEIGHT - 72;

  return Buffer.from(`
    <svg width="${REPORT_OG_WIDTH}" height="${REPORT_OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style><![CDATA[${fontFaces}]]></style>
        <clipPath id="cardClip">
          <rect width="${REPORT_OG_WIDTH}" height="${REPORT_OG_HEIGHT}" rx="${CARD_RADIUS}" ry="${CARD_RADIUS}"/>
        </clipPath>
      </defs>
      <g clip-path="url(#cardClip)">
        <rect width="${REPORT_OG_WIDTH}" height="${REPORT_OG_HEIGHT}" fill="${heroBg}"/>
        <text x="${PADDING}" y="78" font-family=${REPORT_OG_FONT_FAMILY} font-size="24" fill="#061C2F" fill-opacity="0.45">${escapeXml(domain)}</text>
        ${svgTextBlock({
          lines: headlineLines,
          x: PADDING,
          y: headlineY,
          fontSize: 36,
          fontWeight: 700,
          fill: "#061C2F",
          lineHeight: headlineLineHeight,
        })}
        <text x="${PADDING}" y="${scoreRowY}" font-family=${REPORT_OG_FONT_FAMILY} font-size="28" fill="#061C2F" fill-opacity="0.45">UX clarity score</text>
        <circle cx="${scoreCircleX}" cy="${scoreCircleY}" r="${SCORE_CIRCLE_R}" fill="${badgeBg}"/>
        <text x="${scoreCircleX}" y="${scoreCircleY + 11}" text-anchor="middle" font-family=${REPORT_OG_FONT_FAMILY} font-size="30" font-weight="700" fill="#ffffff">${escapeXml(scoreLabel)}</text>
      </g>
    </svg>
  `);
}

export async function composeReportOpenGraphImage(
  report: ReportOgInput,
  previewBuffer: Buffer
) {
  const theme = getReportHeroTheme(report.score);
  const domain = formatReportDomain(report.url) || "Landing page";
  const scoreLabel = formatOverallScore(report.score);
  const headline = report.verdict?.trim() || report.summary?.trim() || "UX clarity report";
  const headlineLines = wrapText(headline, 34, 3);

  const scoreTextWidth = 220;
  const scoreCircleX = PADDING + scoreTextWidth + SCORE_CIRCLE_R + 8;
  const scoreCircleY = REPORT_OG_HEIGHT - 72 - 8;

  const fontFaces = await getReportOgFontFaces();

  const [previewCard, cardSvg] = await Promise.all([
    roundedImage(previewBuffer, PREVIEW_WIDTH, PREVIEW_HEIGHT, 16),
    Promise.resolve(
      buildCardSvg({
        fontFaces,
        domain,
        headlineLines,
        scoreLabel,
        scoreCircleX,
        scoreCircleY,
        heroBg: theme.heroBg,
        badgeBg: theme.badgeBg,
      })
    ),
  ]);

  return sharp(cardSvg)
    .composite([
      {
        input: previewCard,
        top: PREVIEW_Y,
        left: PREVIEW_X,
      },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
}
