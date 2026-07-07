"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";

import { AppFooter } from "@/components/AppFooter";
import { REPORT_PAGE_CONTAINER_CLASS } from "@/components/report/reportStyles";

function AppFooterContent() {
  const pathname = usePathname();

  if (pathname?.includes("/print")) {
    return null;
  }

  const isDarkFooter =
    pathname === "/" || pathname === "/landing-copy" || pathname?.startsWith("/landing-copy/");

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
