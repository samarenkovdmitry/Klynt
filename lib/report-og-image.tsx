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
import {
  REPORT_OG_HEIGHT,
  REPORT_OG_WIDTH,
} from "@/lib/report-preview-size";

const OG_BEIGE_BG = "#F5EDD8";
const CONTENT_PADDING = 60;
const LEFT_PANEL_WIDTH = Math.round(REPORT_OG_WIDTH * 0.62);
const RIGHT_PANEL_WIDTH = REPORT_OG_WIDTH - LEFT_PANEL_WIDTH;
const SCORE_PILL_HEIGHT = 80;
const LOGO_WIDTH = 148;
const LOGO_HEIGHT = 44;

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
  _previewBuffer: Buffer | null,
  _options: ComposeOptions = {}
) {
  const theme = getReportHeroTheme(report.score);
  const domain = formatReportDomain(report.url) || "Landing page";
  const scoreLabel = formatOverallScore(report.score);
  const tierLabel = getTierLabel(theme.tier);
  const headline = truncateText(
    report.verdict?.trim() || report.summary?.trim() || "UX clarity report",
    88
  );
  const logoSrc = await getKlyntLogoDataUrl();
  const chipBorder = hexWithAlpha(theme.badgeBg, "40");
  const chipBg = hexWithAlpha(theme.badgeBg, "18");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          backgroundColor: OG_BEIGE_BG,
          fontFamily: "Familjen Grotesk",
        }}
      >
        {/* Left panel — domain + headline + score */}
        <div
          style={{
            display: "flex",
            width: LEFT_PANEL_WIDTH,
            height: "100%",
            padding: CONTENT_PADDING,
            paddingRight: 40,
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 400,
              color: "#061C2F99",
              letterSpacing: "-0.01em",
            }}
          >
            {domain}
          </div>

          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              paddingTop: 32,
              paddingBottom: 32,
            }}
          >
            <div
              style={{
                fontSize: 50,
                fontWeight: 700,
                color: "#061C2F",
                lineHeight: 1.15,
                letterSpacing: "-0.025em",
                maxWidth: LEFT_PANEL_WIDTH - CONTENT_PADDING - 40,
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

        {/* Right panel — Klynt logo centered */}
        <div
          style={{
            display: "flex",
            width: RIGHT_PANEL_WIDTH,
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoSrc}
              alt=""
              width={LOGO_WIDTH}
              height={LOGO_HEIGHT}
              style={{ opacity: 0.55 }}
            />
          ) : (
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: "#061C2F",
                letterSpacing: "-0.03em",
                opacity: 0.55,
              }}
            >
              Klynt
            </div>
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
