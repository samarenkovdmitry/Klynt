import type { Viewport } from "next";

import { LandingBodyColor } from "./LandingBodyColor";

const HERO_BG = "#53C2EE";

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: HERO_BG,
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var c="${HERO_BG}";document.documentElement.style.backgroundColor=c;document.body.style.backgroundColor=c;})();`,
        }}
      />
      <LandingBodyColor />
      {children}
    </>
  );
}
