import { ImageResponse } from "@vercel/og";

import type { AuditReport } from "@/lib/audit-report";
import { FAMILJEN_GROTESK_400, FAMILJEN_GROTESK_700 } from "@/lib/report-og-font-data";
import {
  buildReportOgPatternDataUrl,
  REPORT_OG_PATTERN_LEFT,
  REPORT_OG_PATTERN_RENDER_WIDTH,
} from "@/lib/report-og-pattern";
import {
  formatOverallScore,
  formatReportDomain,
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

const LEFT_WIDTH = 560;
const CONTENT_PADDING = 48;

type ReportOgInput = Pick<AuditReport, "url" | "score" | "verdict" | "summary">;

type ComposeOptions = {
  includePattern?: boolean;
  includePreview?: boolean;
};

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

export async function composeReportOpenGraphImage(
  report: ReportOgInput,
  previewBuffer: Buffer | null,
  options: ComposeOptions = {}
) {
  const { includePattern = true, includePreview = true } = options;
  const theme = getReportHeroTheme(report.score);
  const domain = formatReportDomain(report.url) || "Landing page";
  const scoreLabel = formatOverallScore(report.score);
  const tierLabel = getTierLabel(theme.tier);
  const headline = truncateText(
    report.verdict?.trim() || report.summary?.trim() || "UX clarity report",
    96
  );
  const previewSrc =
    includePreview && previewBuffer
      ? `data:image/jpeg;base64,${previewBuffer.toString("base64")}`
      : null;
  const patternSrc = includePattern
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
          position: "relative",
          backgroundColor: theme.heroBg,
          fontFamily: "Familjen Grotesk",
        }}
      >
        {patternSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={patternSrc}
            alt=""
            width={REPORT_OG_PATTERN_RENDER_WIDTH}
            height={REPORT_OG_HEIGHT}
            style={{
              position: "absolute",
              top: 0,
              left: REPORT_OG_PATTERN_LEFT,
              height: "100%",
              opacity: 0.9,
            }}
          />
        ) : null}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.28) 42%, rgba(255,255,255,0.42) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: CONTENT_PADDING,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              height: "100%",
              width: LEFT_WIDTH,
              paddingRight: 32,
              gap: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#061C2F",
                  letterSpacing: "-0.03em",
                }}
              >
                Klynt
              </div>
              <div
                style={{
                  fontSize: 18,
                  color: "rgba(6, 28, 47, 0.45)",
                }}
              >
                UX clarity report
              </div>
            </div>

            <div
              style={{
                fontSize: 28,
                fontWeight: 500,
                color: "#061C2F",
              }}
            >
              {domain}
            </div>

            <div
              style={{
                fontSize: 42,
                fontWeight: 700,
                color: "#061C2F",
                lineHeight: 1.16,
                maxWidth: LEFT_WIDTH,
              }}
            >
              {headline}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                alignSelf: "flex-start",
                height: 56,
                paddingLeft: 6,
                paddingRight: 22,
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
                  minWidth: 52,
                  height: 42,
                  paddingLeft: 14,
                  paddingRight: 14,
                  borderRadius: 999,
                  backgroundColor: theme.badgeBg,
                  color: "#ffffff",
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                {scoreLabel}
              </div>
              <div
                style={{
                  marginLeft: 12,
                  fontSize: 22,
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
              display: "flex",
              flexDirection: "column",
              width: REPORT_OG_PREVIEW_WIDTH,
              height: frameHeight,
              borderRadius: 14,
              border: "2px solid rgba(0, 0, 0, 0.08)",
              backgroundColor: "#F8FAFC",
              overflow: "hidden",
              boxShadow: "0 12px 36px rgba(6, 28, 47, 0.10)",
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
                  fontSize: 16,
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
