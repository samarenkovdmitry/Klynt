import type { Metadata, Viewport } from "next";

import { LandingJsonLd } from "@/components/landing-json-ld";
import { LANDING_DARK_BG } from "@/components/landing-test/landingPageStyles";
import { buildPageMetadata } from "@/lib/seo";
import { DEFAULT_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "AI UX review for landing pages",
  description: DEFAULT_DESCRIPTION,
  path: "/",
});

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
      <LandingJsonLd />
      <div className={`flex min-h-0 flex-1 flex-col ${LANDING_DARK_BG}`}>{children}</div>
    </>
  );
}
