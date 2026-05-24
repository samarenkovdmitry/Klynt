import type { Viewport } from "next";

import { LandingBodyColor } from "./LandingBodyColor";

const HERO_BG = "#53C2EE";

export const viewport: Viewport = {
  themeColor: HERO_BG,
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
