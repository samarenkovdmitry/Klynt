import type { Metadata, Viewport } from "next";

import { LandingJsonLd } from "@/components/landing-json-ld";
import { buildPageMetadata } from "@/lib/seo";
import { DEFAULT_DESCRIPTION } from "@/lib/site";

import { LandingBodyColor } from "./LandingBodyColor";

export const metadata: Metadata = buildPageMetadata({
  title: "Landing improvement kit",
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
      <LandingBodyColor />
      {children}
    </>
  );
}
