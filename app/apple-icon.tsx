import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 36,
          background: "linear-gradient(135deg, #061C2F, #10A6DA)",
          color: "#FFFFFF",
          fontSize: 96,
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        K
      </div>
    ),
    { ...size }
  );
}
