"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { AppFooter } from "@/components/AppFooter";
import { REPORT_PAGE_CONTAINER_CLASS } from "@/components/report/reportStyles";

function AppFooterContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isV2Landing = pathname === "/" && searchParams.get("v2") === "true";
  const isDarkFooter =
    pathname === "/" ||
    pathname === "/landing-copy" ||
    pathname?.startsWith("/landing-copy/") ||
    pathname?.startsWith("/report/");
  const isPrintRoute = pathname?.includes("/print");

  if (isPrintRoute || isV2Landing) {
    return null;
  }

  return (
    <AppFooter
      variant={isDarkFooter ? "dark" : "light"}
      containerClass={isDarkFooter ? undefined : REPORT_PAGE_CONTAINER_CLASS}
    />
  );
}

export function AppFooterWrapper() {
  return (
    <Suspense fallback={null}>
      <AppFooterContent />
    </Suspense>
  );
}
