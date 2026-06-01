import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "@vercel/og";

import type { AuditReport } from "@/lib/audit-report";
import { FAMILJEN_GROTESK_400, FAMILJEN_GROTESK_700 } from "@/lib/report-og-font-data";
import {
  formatOverallScore,
  formatReportDomain,
  getReportHeroTheme,
  getTierLabel,
} from "@/lib/report-hero-theme";
import { buildReportOgPatternDataUrl } from "@/lib/report-og-pattern";
import {
  REPORT_OG_BROWSER_CHROME_HEIGHT,
  REPORT_OG_HEIGHT,
  REPORT_OG_PREVIEW_HEIGHT,
  REPORT_OG_PREVIEW_WIDTH,
  REPORT_OG_WIDTH,
} from "@/lib/report-preview-size";

const CONTENT_PADDING = 52;
const LEFT_PANEL_WIDTH = REPORT_OG_WIDTH / 2;
const RIGHT_PANEL_WIDTH = REPORT_OG_WIDTH / 2;
const SCORE_PILL_HEIGHT = 80;
const LOGO_WIDTH = 128;
const LOGO_HEIGHT = 38;
const OG_INK_MUTED = "#061C2F73";
const OG_INK_FAINT = "#061C2F0F";
const OG_BORDER_FAINT = "#00000014";
const OG_BORDER_SOFT = "#0000000F";

type ReportOgInput = Pick<AuditReport, "url" | "score" | "verdict" | "summary">;

type ComposeOptions = {
  includeGrid?: boolean;
  includePreview?: boolean;
};

let klyntLogoDataUrlPromise: Promise<string | null> | null = null;

function toFontData(buffer: Buffer) {
  return new Uint8Array(buffer).buffer as ArrayBuffer;
}

function truncateText(text: string, maxLength: number) {
  const trimmed = text.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

function hexWithAlpha(hex: string, alphaHex: string) {
  return `${hex}${alphaHex}`;
}

async function getKlyntLogoDataUrl(): Promise<string | null> {
  if (!klyntLogoDataUrlPromise) {
    const candidatePaths = [
      path.join(process.cwd(), "public", "klynt-logo-dark.svg"),
      path.join(process.cwd(), ".next", "standalone", "public", "klynt-logo-dark.svg"),
    ];

    klyntLogoDataUrlPromise = (async () => {
      for (const filePath of candidatePaths) {
        try {
          const svg = await readFile(filePath, "utf8");
          return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        } catch {
          continue;
        }
      }

      console.error("[report opengraph-image] logo load failed for all paths");
      return null;
    })();
  }

  return klyntLogoDataUrlPromise;
}

export async function composeReportOpenGraphImage(
  report: ReportOgInput,
  previewBuffer: Buffer | null,
  options: ComposeOptions = {}
) {
  const { includeGrid = true, includePreview = true } = options;
  const theme = getReportHeroTheme(report.score);
  const domain = formatReportDomain(report.url) || "Landing page";
  const scoreLabel = formatOverallScore(report.score);
  const tierLabel = getTierLabel(theme.tier);
  const headline = truncateText(
    report.verdict?.trim() || report.summary?.trim() || "UX clarity report",
    88
  );
  const previewSrc =
    includePreview && previewBuffer
      ? `data:image/jpeg;base64,${previewBuffer.toString("base64")}`
      : null;
  const logoSrc = await getKlyntLogoDataUrl();
  const patternSrc = includeGrid
    ? buildReportOgPatternDataUrl(theme.gridColor)
    : null;
  const chipBorder = hexWithAlpha(theme.badgeBg, "33");
  const chipBg = hexWithAlpha(theme.badgeBg, "14");
  const frameHeight =
    REPORT_OG_BROWSER_CHROME_HEIGHT + REPORT_OG_PREVIEW_HEIGHT;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          position: "relative",
          backgroundColor: theme.heroBg,
          fontFamily: "Familjen Grotesk",
        }}
      >
        {logoSrc ? (
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: CONTENT_PADDING,
              right: CONTENT_PADDING,
              zIndex: 3,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt=""
              width={LOGO_WIDTH}
              height={LOGO_HEIGHT}
            />
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: CONTENT_PADDING,
              right: CONTENT_PADDING,
              zIndex: 3,
              fontSize: 28,
              fontWeight: 700,
              color: "#061C2F",
              letterSpacing: "-0.03em",
            }}
          >
            Klynt
          </div>
        )}

        <div
          style={{
            display: "flex",
            width: LEFT_PANEL_WIDTH,
            height: "100%",
            padding: CONTENT_PADDING,
            paddingRight: 36,
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: "flex",
              maxWidth: LEFT_PANEL_WIDTH - CONTENT_PADDING - LOGO_WIDTH - 24,
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 400,
                color: "#061C2F",
              }}
            >
              {domain}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
              paddingTop: 28,
              paddingBottom: 28,
            }}
          >
            <div
              style={{
                fontSize: 44,
                fontWeight: 700,
                color: "#061C2F",
                lineHeight: 1.18,
                maxWidth: LEFT_PANEL_WIDTH - CONTENT_PADDING - 36,
              }}
            >
              {headline}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              alignSelf: "flex-start",
              height: SCORE_PILL_HEIGHT,
              paddingLeft: 8,
              paddingRight: 28,
              borderRadius: 999,
              border: `2px solid ${chipBorder}`,
              backgroundColor: chipBg,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 60,
                height: 60,
                paddingLeft: 16,
                paddingRight: 16,
                borderRadius: 999,
                backgroundColor: theme.badgeBg,
                color: "#ffffff",
                fontSize: 36,
                fontWeight: 700,
              }}
            >
              {scoreLabel}
            </div>
            <div
              style={{
                marginLeft: 14,
                fontSize: 28,
                fontWeight: 400,
                color: theme.badgeBg,
              }}
            >
              {tierLabel}
            </div>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            width: RIGHT_PANEL_WIDTH,
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {patternSrc ? (
            <div
              style={{
                display: "flex",
                position: "absolute",
                inset: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={patternSrc}
                alt=""
                width={Math.round(RIGHT_PANEL_WIDTH * 0.92)}
                height={REPORT_OG_HEIGHT}
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  height: "100%",
                  opacity: 0.42,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "24%",
                  height: "100%",
                  background: `linear-gradient(to right, ${theme.heroBg}, transparent)`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(circle at 78% 42%, ${theme.gridColor}66, transparent 68%)`,
                }}
              />
            </div>
          ) : null}

          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              width: REPORT_OG_PREVIEW_WIDTH,
              height: frameHeight,
              borderRadius: 16,
              border: `2px solid ${OG_BORDER_FAINT}`,
              backgroundColor: "#F8FAFC",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: REPORT_OG_BROWSER_CHROME_HEIGHT,
                paddingLeft: 14,
                paddingRight: 14,
                borderBottom: `1px solid ${OG_BORDER_SOFT}`,
                backgroundColor: "#ffffff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    backgroundColor: "#FF5F57",
                  }}
                />
                <div
                  style={{
                    width: 10,
                    height: 10,
                    marginLeft: 6,
                    borderRadius: 999,
                    backgroundColor: "#FFBD2E",
                  }}
                />
                <div
                  style={{
                    width: 10,
                    height: 10,
                    marginLeft: 6,
                    borderRadius: 999,
                    backgroundColor: "#28CA41",
                  }}
                />
              </div>
              <div
                style={{
                  marginLeft: 10,
                  fontSize: 15,
                  color: OG_INK_MUTED,
                }}
              >
                {domain}
              </div>
            </div>

            {previewSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewSrc}
                alt=""
                width={REPORT_OG_PREVIEW_WIDTH}
                height={REPORT_OG_PREVIEW_HEIGHT}
                style={{
                  width: REPORT_OG_PREVIEW_WIDTH,
                  height: REPORT_OG_PREVIEW_HEIGHT,
                  objectFit: "cover",
                  objectPosition: "top center",
                  display: "flex",
                }}
              />
            ) : (
              <div
                style={{
                  width: REPORT_OG_PREVIEW_WIDTH,
                  height: REPORT_OG_PREVIEW_HEIGHT,
                  backgroundColor: OG_INK_FAINT,
                }}
              />
            )}
          </div>
        </div>
      </div>
    ),
    {
      width: REPORT_OG_WIDTH,
      height: REPORT_OG_HEIGHT,
      fonts: [
        {
          name: "Familjen Grotesk",
          data: toFontData(FAMILJEN_GROTESK_400),
          weight: 400,
          style: "normal",
        },
        {
          name: "Familjen Grotesk",
          data: toFontData(FAMILJEN_GROTESK_700),
          weight: 700,
          style: "normal",
        },
      ],
    }
  );
}
