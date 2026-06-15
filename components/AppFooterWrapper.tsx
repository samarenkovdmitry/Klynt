"use client";

import { usePathname } from "next/navigation";

import { ANALYZE_FOOTER_SOCIAL_LINKS, AppFooter } from "@/components/AppFooter";
import { REPORT_PAGE_CONTAINER_CLASS } from "@/components/report/reportStyles";
import { ANALYZE_FOOTER_TAGLINE, ANALYZE_PAGE_CONTAINER_CLASS } from "@/lib/analyze-page-styles";

export function AppFooterWrapper() {
  const pathname = usePathname();
  const isAnalyze = pathname === "/analyze" || pathname?.startsWith("/analyze/");
  const isDarkFooter =
    pathname === "/" || pathname === "/landing-copy" || pathname?.startsWith("/landing-copy/");
  const isPrintRoute = pathname?.includes("/print");

  if (isPrintRoute) {
    return null;
  }

  return (
    <AppFooter
      variant={isDarkFooter ? "dark" : "light"}
      containerClass={
        isDarkFooter ? undefined : isAnalyze ? ANALYZE_PAGE_CONTAINER_CLASS : REPORT_PAGE_CONTAINER_CLASS
      }
      tagline={isAnalyze ? ANALYZE_FOOTER_TAGLINE : undefined}
      socialLinks={isAnalyze ? ANALYZE_FOOTER_SOCIAL_LINKS : undefined}
    />
  );
}
