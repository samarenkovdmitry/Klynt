import { ImageResponse } from "@vercel/og";

import type { AuditReport } from "@/lib/audit-report";
import { FAMILJEN_GROTESK_400, FAMILJEN_GROTESK_700 } from "@/lib/report-og-font-data";
import { buildReportOgPatternDataUrl } from "@/lib/report-og-pattern";
import {
  formatOverallScore,
  formatReportDomain,
  getReportHeroTheme,
} from "@/lib/report-hero-theme";
import {
  REPORT_OG_HEIGHT,
  REPORT_OG_WIDTH,
} from "@/lib/report-preview-size";

const PREVIEW_WIDTH = 520;
const PREVIEW_HEIGHT = 400;
const LEFT_WIDTH = 600;
const SCORE_CIRCLE_SIZE = 88;

type ReportOgInput = Pick<AuditReport, "url" | "score" | "verdict" | "summary">;

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

export async function composeReportOpenGraphImage(
  report: ReportOgInput,
  previewBuffer: Buffer | null
) {
  const theme = getReportHeroTheme(report.score);
  const domain = formatReportDomain(report.url) || "Landing page";
  const scoreLabel = formatOverallScore(report.score);
  const headline = truncateText(
    report.verdict?.trim() || report.summary?.trim() || "UX clarity report",
    110
  );
  const previewSrc = previewBuffer
    ? `data:image/jpeg;base64,${previewBuffer.toString("base64")}`
    : null;
  const patternSrc = await buildReportOgPatternDataUrl(theme.gridColor);

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
          src={patternSrc}
          alt=""
          width={REPORT_OG_WIDTH}
          height={REPORT_OG_HEIGHT}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
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
            padding: "52px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "100%",
              width: LEFT_WIDTH,
              paddingRight: 36,
            }}
          >
            <div
              style={{
                fontSize: 30,
                color: "rgba(6, 28, 47, 0.45)",
              }}
            >
              {domain}
            </div>

            <div
              style={{
                fontSize: 46,
                fontWeight: 700,
                color: "#061C2F",
                lineHeight: 1.18,
                maxWidth: LEFT_WIDTH,
              }}
            >
              {headline}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  color: "rgba(6, 28, 47, 0.45)",
                  flexShrink: 0,
                }}
              >
                UX clarity score
              </div>
              <div
                style={{
                  width: SCORE_CIRCLE_SIZE,
                  height: SCORE_CIRCLE_SIZE,
                  borderRadius: SCORE_CIRCLE_SIZE / 2,
                  backgroundColor: theme.badgeBg,
                  color: "#ffffff",
                  fontSize: 36,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 18,
                  flexShrink: 0,
                }}
              >
                {scoreLabel}
              </div>
            </div>
          </div>

          {previewSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewSrc}
              alt=""
              width={PREVIEW_WIDTH}
              height={PREVIEW_HEIGHT}
              style={{
                borderRadius: 16,
                objectFit: "cover",
                objectPosition: "top",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: PREVIEW_WIDTH,
                height: PREVIEW_HEIGHT,
                borderRadius: 16,
                backgroundColor: "rgba(6, 28, 47, 0.08)",
                flexShrink: 0,
              }}
            />
          )}
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
