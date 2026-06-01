import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "@vercel/og";

import type { AuditReport } from "@/lib/audit-report";
import { FAMILJEN_GROTESK_400, FAMILJEN_GROTESK_700 } from "@/lib/report-og-font-data";
import {
  formatOverallScore,
  formatReportDomain,
  formatReportHref,
  getReportHeroTheme,
  getTierLabel,
} from "@/lib/report-hero-theme";
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
const SCORE_PILL_HEIGHT = 76;
const OG_GRID_LINE = "rgba(6, 28, 47, 0.07)";
const OG_GRID_MASK =
  "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.28) 20%, #000 42%, #000 100%)";

type ReportOgInput = Pick<AuditReport, "url" | "score" | "verdict" | "summary">;

type ComposeOptions = {
  includeGrid?: boolean;
  includePreview?: boolean;
};

let klyntLogoDataUrlPromise: Promise<string> | null = null;

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

function getFaviconUrl(url?: string) {
  const href = formatReportHref(url);

  if (!href) {
    return null;
  }

  return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(href)}&sz=32`;
}

async function getKlyntLogoDataUrl() {
  if (!klyntLogoDataUrlPromise) {
    klyntLogoDataUrlPromise = readFile(
      path.join(process.cwd(), "public", "klynt-logo-dark.svg"),
      "utf8"
    ).then(
      (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    );
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
  const faviconUrl = getFaviconUrl(report.url);
  const logoSrc = await getKlyntLogoDataUrl();
  const chipBorder = hexWithAlpha(theme.badgeBg, "33");
  const chipBg = hexWithAlpha(theme.badgeBg, "14");
  const frameHeight =
    REPORT_OG_BROWSER_CHROME_HEIGHT + REPORT_OG_PREVIEW_HEIGHT;
  const gridBackground = {
    backgroundImage: `linear-gradient(${OG_GRID_LINE} 1px, transparent 1px), linear-gradient(90deg, ${OG_GRID_LINE} 1px, transparent 1px)`,
    backgroundSize: "24px 24px",
    backgroundPosition: "0 7px",
  } as const;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: theme.heroBg,
          fontFamily: "Familjen Grotesk",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt=""
          width={88}
          height={26}
          style={{
            position: "absolute",
            top: CONTENT_PADDING,
            right: CONTENT_PADDING,
            zIndex: 3,
          }}
        />

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
              alignItems: "center",
              gap: 10,
              maxWidth: LEFT_PANEL_WIDTH - CONTENT_PADDING - 120,
            }}
          >
            {faviconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={faviconUrl}
                alt=""
                width={22}
                height={22}
                style={{
                  borderRadius: 4,
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 4,
                  backgroundColor: "rgba(6, 28, 47, 0.08)",
                  flexShrink: 0,
                }}
              />
            )}
            <div
              style={{
                fontSize: 24,
                fontWeight: 500,
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
                minWidth: 58,
                height: 58,
                paddingLeft: 16,
                paddingRight: 16,
                borderRadius: 999,
                backgroundColor: theme.badgeBg,
                color: "#ffffff",
                fontSize: 34,
                fontWeight: 700,
              }}
            >
              {scoreLabel}
            </div>
            <div
              style={{
                marginLeft: 14,
                fontSize: 26,
                fontWeight: 500,
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
          {includeGrid ? (
            <>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  ...gridBackground,
                  maskImage: OG_GRID_MASK,
                  WebkitMaskImage: OG_GRID_MASK,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(ellipse 85% 80% at 72% 42%, ${theme.gridColor}55, transparent 72%)`,
                  maskImage: OG_GRID_MASK,
                  WebkitMaskImage: OG_GRID_MASK,
                }}
              />
            </>
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
              border: "2px solid rgba(0, 0, 0, 0.08)",
              backgroundColor: "#F8FAFC",
              overflow: "hidden",
              boxShadow: "0 14px 40px rgba(6, 28, 47, 0.12)",
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
                borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                backgroundColor: "#ffffff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
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
                    borderRadius: 999,
                    backgroundColor: "#FFBD2E",
                  }}
                />
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    backgroundColor: "#28CA41",
                  }}
                />
              </div>
              <div
                style={{
                  marginLeft: 10,
                  fontSize: 15,
                  color: "rgba(6, 28, 47, 0.45)",
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
                  backgroundColor: "rgba(6, 28, 47, 0.06)",
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
