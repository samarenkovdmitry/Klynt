"use client";

import { usePathname } from "next/navigation";

import { ANALYZE_FOOTER_SOCIAL_LINKS, AppFooter } from "@/components/AppFooter";
import {
  ANALYZE_FOOTER_TAGLINE,
  ANALYZE_PAGE_CONTAINER_CLASS,
} from "@/lib/analyze-page-styles";
import { APP_SHELL_CONTAINER_CLASS } from "@/components/report/reportStyles";

function isWorkspacePath(pathname: string | null) {
  if (!pathname) return false;

  return (
    pathname.startsWith("/analyze") ||
    (pathname.startsWith("/report") && !pathname.includes("/print")) ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms")
  );
}

function isDarkFooterPath(pathname: string | null) {
  if (!pathname) return false;

  return (
    pathname === "/" ||
    pathname === "/contact" ||
    pathname.startsWith("/landing-copy")
  );
}

export function AppFooterWrapper() {
  const pathname = usePathname();
  const isAnalyze = pathname === "/analyze" || pathname?.startsWith("/analyze/");
  const isPrintRoute = pathname?.includes("/print");

  if (isPrintRoute) {
    return null;
  }

  const variant = isDarkFooterPath(pathname)
    ? "dark"
    : isWorkspacePath(pathname)
      ? "workspace"
      : "light";

  return (
    <AppFooter
      variant={variant}
      compact
      containerClass={isAnalyze ? ANALYZE_PAGE_CONTAINER_CLASS : APP_SHELL_CONTAINER_CLASS}
      tagline={isAnalyze ? ANALYZE_FOOTER_TAGLINE : "Landing improvement workspace"}
      socialLinks={isAnalyze ? ANALYZE_FOOTER_SOCIAL_LINKS : undefined}
    />
  );
}
