import type { Viewport } from "next";

import { LandingBodyColor } from "./LandingBodyColor";

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "transparent",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LandingBodyColor />
      {children}
    </>
  );
}
