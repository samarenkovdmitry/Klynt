import { ImageResponse } from "next/og";

import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background:
            "linear-gradient(135deg, #061C2F 0%, #0B3D5C 45%, #10A6DA 100%)",
          color: "#FFFFFF",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            opacity: 0.92,
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            marginTop: 24,
            maxWidth: 900,
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
          }}
        >
          Clarity drives conversion
        </div>
        <div
          style={{
            marginTop: 28,
            maxWidth: 820,
            fontSize: 30,
            lineHeight: 1.45,
            opacity: 0.88,
          }}
        >
          {DEFAULT_DESCRIPTION}
        </div>
      </div>
    ),
    { ...size }
  );
}
