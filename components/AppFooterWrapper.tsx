"use client";

import { usePathname } from "next/navigation";

import { AppFooter } from "@/components/AppFooter";
import { REPORT_PAGE_CONTAINER_CLASS } from "@/components/report/reportStyles";

export function AppFooterWrapper() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const isPrintRoute = pathname?.includes("/print");

  if (isPrintRoute) {
    return null;
  }

  return (
    <AppFooter
      variant={isLanding ? "dark" : "light"}
      containerClass={isLanding ? undefined : REPORT_PAGE_CONTAINER_CLASS}
    />
  );
}
