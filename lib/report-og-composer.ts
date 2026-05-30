import { readFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import type { AuditReport } from "@/lib/audit-report";
import { getMetricObservationFallbacks } from "@/lib/metric-observations";
import {
  formatAnalyzedDate,
  formatOverallScore,
  formatReportDomain,
  getFrictionScore,
  getMetricBarColor,
  getReportHeroTheme,
} from "@/lib/report-hero-theme";
import {
  REPORT_HERO_PATTERN_HEIGHT,
  REPORT_HERO_PATTERN_WIDTH,
} from "@/lib/report-hero-pattern";
import {
  REPORT_OG_HEIGHT,
  REPORT_OG_WIDTH,
  REPORT_PREVIEW_HEIGHT,
  REPORT_PREVIEW_WIDTH,
} from "@/lib/report-preview-size";

const CARD_RADIUS = 24;
const PADDING_X = 28;
const HERO_HEIGHT = 348;
const METRICS_HEIGHT = 206;
const FOOTER_HEIGHT = REPORT_OG_HEIGHT - HERO_HEIGHT - METRICS_HEIGHT;
const PREVIEW_X = REPORT_OG_WIDTH - PADDING_X - REPORT_PREVIEW_WIDTH;
const PREVIEW_Y = 72;

type ReportOgInput = Pick<
  AuditReport,
  | "url"
  | "score"
  | "verdict"
  | "summary"
  | "key_observation"
  | "confidence"
  | "generatedAt"
  | "breakdown"
  | "metric_observations"
  | "issues"
>;

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
    const consumed = lines.join(" ").split(/\s+/).length;
    if (consumed < words.length) {
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
  lineHeight?: number;
}) {
  const lineHeight = params.lineHeight ?? Math.round(params.fontSize * 1.28);

  return params.lines
    .map(
      (line, index) =>
        `<text x="${params.x}" y="${params.y + index * lineHeight}" font-family="Arial, Helvetica, sans-serif" font-size="${params.fontSize}" font-weight="${params.fontWeight ?? 400}" fill="${params.fill}">${escapeXml(line)}</text>`
    )
    .join("");
}

function metricBarMarkup(
  x: number,
  y: number,
  width: number,
  value: number,
  color: string
) {
  const fillWidth = Math.max(0, Math.min(width, Math.round((width * value) / 100)));

  return `
    <text x="${x + width}" y="${y - 2}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="700" fill="${color}">${value}%</text>
    <rect x="${x}" y="${y + 4}" width="${width}" height="5" rx="2.5" fill="#F5F5F5"/>
    <rect x="${x}" y="${y + 4}" width="${fillWidth}" height="5" rx="2.5" fill="${color}"/>
  `;
}

function metricColumnMarkup(params: {
  x: number;
  y: number;
  width: number;
  icon: string;
  label: string;
  description: string;
  value: number;
}) {
  const { x, y, width, icon, label, description, value } = params;
  const color = getMetricBarColor(value);
  const descriptionLines = wrapText(description, 34, 3);

  return `
    <g transform="translate(${x}, ${y})">
      <g transform="translate(0, 1)">${icon}</g>
      <text x="24" y="14" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="#061C2F">${escapeXml(label)}</text>
      ${svgTextBlock({
        lines: descriptionLines,
        x: 0,
        y: 38,
        fontSize: 12,
        fill: "rgba(6,28,47,0.5)",
        lineHeight: 16,
      })}
      ${metricBarMarkup(0, 88, width, value, color)}
    </g>
  `;
}

const ICONS = {
  trust: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6V11C4 16.55 7.84 21.74 12 23C16.16 21.74 20 16.55 20 11V6L12 2ZM10.5 15.5L7.5 12.5L8.91 11.09L10.5 12.67L15.09 8.09L16.5 9.5L10.5 15.5Z" fill="#8E99A2"/></svg>`,
  clarity: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12 6C9.79 6 8 7.79 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 7.79 14.21 6 12 6ZM6 18.05C7.03 16.09 9.28 14.75 12 14.75C14.72 14.75 16.97 16.09 18 18.05C16.71 19.23 14.87 20 12 20C9.13 20 7.29 19.23 6 18.05Z" fill="#8E99A2"/></svg>`,
  friction: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9C5 11.38 6.19 13.47 8 14.74V17C8 17.55 8.45 18 9 18H15C15.55 18 16 17.55 16 17V14.74C17.81 13.47 19 11.38 19 9C19 5.13 15.87 2 12 2ZM14 13.7V16H10V13.7C8.84 13.07 8 11.64 8 10C8 7.79 9.79 6 12 6C14.21 6 16 7.79 16 10C16 11.64 15.16 13.07 14 13.7Z" fill="#8E99A2"/></svg>`,
};

async function loadHeroPatternPng(gridColor: string) {
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

  return sharp(pattern)
    .composite([
      {
        input: await sharp(fadeMask).png().toBuffer(),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();
}

async function loadFaviconBuffer(url?: string) {
  if (!url) {
    return null;
  }

  try {
    const domain = formatReportDomain(url);
    const response = await fetch(
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`,
      { signal: AbortSignal.timeout(4000) }
    );

    if (!response.ok) {
      return null;
    }

    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  }
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
  report: ReportOgInput;
  theme: ReturnType<typeof getReportHeroTheme>;
  domain: string;
  analyzedDate: string;
  overallScore: string;
  trust: number;
  clarity: number;
  friction: number;
  trustDescription: string;
  clarityDescription: string;
  frictionDescription: string;
  overallDescription: string;
  confidenceValue: number;
  topIssueTitle?: string;
}) {
  const {
    report,
    theme,
    domain,
    analyzedDate,
    overallScore,
    trust,
    clarity,
    friction,
    trustDescription,
    clarityDescription,
    frictionDescription,
    overallDescription,
    confidenceValue,
    topIssueTitle,
  } = params;

  const headlineLines = wrapText(
    report.verdict || "UX assessment complete",
    52,
    2
  );
  const summaryLines = wrapText(report.summary || "No summary generated.", 58, 2);
  const insightLines = wrapText(
    report.key_observation || "No key observation available.",
    56,
    2
  );

  const headlineY = 76;
  const summaryY = headlineY + headlineLines.length * 28 + 10;
  const keyInsightLabelY = summaryY + summaryLines.length * 19 + 18;
  const keyInsightTextY = keyInsightLabelY + 14;

  const metricsTop = HERO_HEIGHT;
  const footerTop = HERO_HEIGHT + METRICS_HEIGHT;
  const columnGap = 24;
  const columnWidth = Math.floor(
    (REPORT_OG_WIDTH - PADDING_X * 2 - columnGap * 3) / 4
  );
  const columnXs = [
    PADDING_X,
    PADDING_X + columnWidth + columnGap,
    PADDING_X + (columnWidth + columnGap) * 2,
    PADDING_X + (columnWidth + columnGap) * 3,
  ];

  const pillText = topIssueTitle ? wrapText(topIssueTitle, 34, 1)[0] : "";
  const pillMarkup = pillText
    ? `
      <rect x="${PREVIEW_X + 8}" y="${PREVIEW_Y + REPORT_PREVIEW_HEIGHT + 10}" width="${REPORT_PREVIEW_WIDTH - 16}" height="24" rx="12" fill="#ffffff" stroke="rgba(6,28,47,0.08)"/>
      <text x="${PREVIEW_X + 18}" y="${PREVIEW_Y + REPORT_PREVIEW_HEIGHT + 26}" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#061C2F">${escapeXml(pillText)}</text>
    `
    : "";

  return Buffer.from(`
    <svg width="${REPORT_OG_WIDTH}" height="${REPORT_OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="cardClip">
          <rect width="${REPORT_OG_WIDTH}" height="${REPORT_OG_HEIGHT}" rx="${CARD_RADIUS}" ry="${CARD_RADIUS}"/>
        </clipPath>
      </defs>
      <g clip-path="url(#cardClip)">
        <rect width="${REPORT_OG_WIDTH}" height="${REPORT_OG_HEIGHT}" fill="#ffffff"/>
        <rect width="${REPORT_OG_WIDTH}" height="${HERO_HEIGHT}" fill="${theme.heroBg}"/>

        <text x="${PADDING_X + 22}" y="40" font-family="Arial, Helvetica, sans-serif" font-size="13" fill="#061C2F">
          <tspan font-weight="600">${escapeXml(domain)}</tspan>
          <tspan dx="12" fill="rgba(6,28,47,0.25)">|</tspan>
          <tspan dx="12" fill="rgba(6,28,47,0.5)">${escapeXml(analyzedDate)}</tspan>
        </text>

        ${svgTextBlock({
          lines: headlineLines,
          x: PADDING_X,
          y: headlineY,
          fontSize: 22,
          fontWeight: 700,
          fill: "#000000",
          lineHeight: 28,
        })}
        ${svgTextBlock({
          lines: summaryLines,
          x: PADDING_X,
          y: summaryY,
          fontSize: 14,
          fill: "rgba(6,28,47,0.5)",
          lineHeight: 19,
        })}

        <text x="${PADDING_X}" y="${keyInsightLabelY}" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="rgba(6,28,47,0.5)">Key Insight</text>
        ${svgTextBlock({
          lines: insightLines,
          x: PADDING_X,
          y: keyInsightTextY,
          fontSize: 14,
          fontWeight: 600,
          fill: "#061C2F",
          lineHeight: 18,
        })}

        <rect x="${PREVIEW_X - 1}" y="${PREVIEW_Y - 1}" width="${REPORT_PREVIEW_WIDTH + 2}" height="${REPORT_PREVIEW_HEIGHT + 2}" rx="10" fill="#ffffff" stroke="rgba(6,28,47,0.09)"/>
        ${pillMarkup}

        <rect y="${metricsTop}" width="${REPORT_OG_WIDTH}" height="${METRICS_HEIGHT}" fill="#ffffff"/>
        ${metricColumnMarkup({
          x: columnXs[0],
          y: metricsTop + 22,
          width: columnWidth,
          icon: ICONS.trust,
          label: "Trust Signals",
          description: trustDescription,
          value: trust,
        })}
        ${metricColumnMarkup({
          x: columnXs[1],
          y: metricsTop + 22,
          width: columnWidth,
          icon: ICONS.clarity,
          label: "Decision Clarity",
          description: clarityDescription,
          value: clarity,
        })}
        ${metricColumnMarkup({
          x: columnXs[2],
          y: metricsTop + 22,
          width: columnWidth,
          icon: ICONS.friction,
          label: "Cognitive Friction",
          description: frictionDescription,
          value: friction,
        })}

        <g transform="translate(${columnXs[3]}, ${metricsTop + 22})">
          <rect x="0" y="0" width="34" height="24" rx="12" fill="${theme.badgeBg}"/>
          <text x="17" y="16" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="#ffffff">${escapeXml(overallScore)}</text>
          <text x="42" y="16" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="#061C2F">Overall Assessment</text>
          ${svgTextBlock({
            lines: wrapText(overallDescription, 34, 3),
            x: 0,
            y: 38,
            fontSize: 12,
            fill: "rgba(6,28,47,0.5)",
            lineHeight: 16,
          })}
        </g>

        <rect y="${footerTop}" width="${REPORT_OG_WIDTH}" height="${FOOTER_HEIGHT}" fill="#ffffff"/>
        <line x1="${PADDING_X}" y1="${footerTop + 1}" x2="${REPORT_OG_WIDTH - PADDING_X}" y2="${footerTop + 1}" stroke="rgba(32,52,94,0.09)"/>

        <text x="${PADDING_X}" y="${footerTop + 28}" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="600" fill="rgba(6,28,47,0.5)">
          AI confidence:
          <tspan fill="#061C2F">${confidenceValue}%</tspan>
        </text>
        <rect x="${PADDING_X + 132}" y="${footerTop + 16}" width="1" height="14" fill="rgba(6,28,47,0.1)"/>
        <text x="${PADDING_X + 148}" y="${footerTop + 28}" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="rgba(6,28,47,0.5)">Based on visible UI structure, messaging clarity and conversion signals.</text>
        <text x="${REPORT_OG_WIDTH - PADDING_X}" y="${footerTop + 28}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="600" fill="rgba(6,28,47,0.5)">Generated with Klynt</text>
      </g>
      <rect width="${REPORT_OG_WIDTH}" height="${REPORT_OG_HEIGHT}" rx="${CARD_RADIUS}" ry="${CARD_RADIUS}" fill="none" stroke="rgba(6,28,47,0.10)" stroke-width="2"/>
    </svg>
  `);
}

export async function composeReportOpenGraphImage(
  report: ReportOgInput,
  previewBuffer: Buffer
) {
  const theme = getReportHeroTheme(report.score);
  const domain = formatReportDomain(report.url) || "Landing page";
  const analyzedDate = formatAnalyzedDate(report.generatedAt);
  const overallScore = formatOverallScore(report.score);
  const trust = Math.max(0, Math.min(100, Number(report.breakdown?.trust ?? 0)));
  const clarity = Math.max(0, Math.min(100, Number(report.breakdown?.clarity ?? 0)));
  const friction = Math.max(0, Math.min(100, getFrictionScore(report.breakdown)));
  const confidenceValue = Math.max(0, Math.min(100, Number(report.confidence ?? 0)));
  const fallbacks = getMetricObservationFallbacks(report.breakdown, report.verdict);
  const trustDescription =
    report.metric_observations?.trust?.trim() ||
    fallbacks.trust ||
    "Trust signal assessment unavailable.";
  const clarityDescription =
    report.metric_observations?.clarity?.trim() ||
    fallbacks.clarity ||
    "Decision clarity assessment unavailable.";
  const frictionDescription =
    report.metric_observations?.friction?.trim() ||
    fallbacks.friction ||
    "Cognitive friction assessment unavailable.";
  const overallDescription =
    report.metric_observations?.overall?.trim() ||
    fallbacks.overall ||
    report.summary ||
    "Overall assessment unavailable.";
  const topIssueTitle = report.issues?.[0]?.title;

  const [pattern, previewCard, favicon, cardSvg] = await Promise.all([
    loadHeroPatternPng(theme.gridColor),
    roundedImage(
      previewBuffer,
      REPORT_PREVIEW_WIDTH,
      REPORT_PREVIEW_HEIGHT,
      8
    ),
    loadFaviconBuffer(report.url),
    Promise.resolve(
      buildCardSvg({
        report,
        theme,
        domain,
        analyzedDate,
        overallScore,
        trust,
        clarity,
        friction,
        trustDescription,
        clarityDescription,
        frictionDescription,
        overallDescription,
        confidenceValue,
        topIssueTitle,
      })
    ),
  ]);

  const cardBase = await sharp({
    create: {
      width: REPORT_OG_WIDTH,
      height: REPORT_OG_HEIGHT,
      channels: 4,
      background: "#ffffff",
    },
  })
    .composite([
      {
        input: cardSvg,
        top: 0,
        left: 0,
      },
      {
        input: pattern,
        top: 0,
        left: REPORT_OG_WIDTH - REPORT_HERO_PATTERN_WIDTH,
      },
      {
        input: previewCard,
        top: PREVIEW_Y,
        left: PREVIEW_X,
      },
      ...(favicon
        ? [
            {
              input: await sharp(favicon).resize(16, 16).png().toBuffer(),
              top: 26,
              left: PADDING_X,
            },
          ]
        : []),
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();

  return cardBase;
}
