"use client";

import { usePathname } from "next/navigation";

import { AppFooter } from "@/components/AppFooter";

export function AppFooterWrapper() {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return <AppFooter variant={isLanding ? "dark" : "light"} />;
}
