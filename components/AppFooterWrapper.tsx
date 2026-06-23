"use client";

import { usePathname } from "next/navigation";

import { AppFooter } from "@/components/AppFooter";
import { REPORT_PAGE_CONTAINER_CLASS } from "@/components/report/reportStyles";

export function AppFooterWrapper() {
  const pathname = usePathname();
  const isDarkFooter =
    pathname === "/" ||
    pathname === "/landing-copy" ||
    pathname?.startsWith("/landing-copy/") ||
    pathname?.startsWith("/report/");
  const isPrintRoute = pathname?.includes("/print");

  if (isPrintRoute) {
    return null;
  }

  return (
    <AppFooter
      variant={isDarkFooter ? "dark" : "light"}
      containerClass={isDarkFooter ? undefined : REPORT_PAGE_CONTAINER_CLASS}
    />
  );
}
