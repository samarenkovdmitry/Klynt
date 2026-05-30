import { ImageResponse } from "@vercel/og";

import type { AuditReport } from "@/lib/audit-report";
import { FAMILJEN_GROTESK_400, FAMILJEN_GROTESK_700 } from "@/lib/report-og-font-data";
import {
  formatOverallScore,
  formatReportDomain,
  getReportHeroTheme,
} from "@/lib/report-hero-theme";
import {
  REPORT_OG_HEIGHT,
  REPORT_OG_WIDTH,
} from "@/lib/report-preview-size";

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
    120
  );
  const previewSrc = previewBuffer
    ? `data:image/jpeg;base64,${previewBuffer.toString("base64")}`
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: theme.heroBg,
          padding: "48px",
          fontFamily: "Familjen Grotesk",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
            width: 580,
            paddingRight: 40,
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: "rgba(6, 28, 47, 0.45)",
            }}
          >
            {domain}
          </div>

          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#061C2F",
              lineHeight: 1.25,
              maxWidth: 580,
            }}
          >
            {headline}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: 28,
                color: "rgba(6, 28, 47, 0.45)",
              }}
            >
              UX clarity score
            </div>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: theme.badgeBg,
                color: "#ffffff",
                fontSize: 30,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 16,
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
            width={520}
            height={400}
            style={{
              borderRadius: 16,
              objectFit: "cover",
              objectPosition: "top",
            }}
          />
        ) : (
          <div
            style={{
              width: 520,
              height: 400,
              borderRadius: 16,
              backgroundColor: "rgba(6, 28, 47, 0.08)",
            }}
          />
        )}
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
