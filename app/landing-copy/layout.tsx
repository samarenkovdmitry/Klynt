import type { Viewport } from "next";

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "transparent",
};

export default function LandingCopyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
