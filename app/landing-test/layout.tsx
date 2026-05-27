import type { Metadata, Viewport } from "next";

import { LandingBodyColor } from "@/app/(landing)/LandingBodyColor";
import { LandingTestHideGlobalFooter } from "@/components/landing-test/LandingTestHideGlobalFooter";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Landing test (internal)",
  description: "Internal layout preview — not indexed.",
  path: "/landing-test",
  index: false,
});

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "transparent",
};

export default function LandingTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LandingBodyColor />
      <LandingTestHideGlobalFooter />
      {children}
    </>
  );
}
