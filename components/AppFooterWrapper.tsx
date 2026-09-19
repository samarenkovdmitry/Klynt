"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";

import { AppFooter } from "@/components/AppFooter";

const CONTENT_CONTAINER_CLASS = "mx-auto w-full max-w-[1040px]";

function AppFooterContent() {
  const pathname = usePathname();

  if (pathname?.includes("/print")) {
    return null;
  }

  const isDarkFooter = pathname === "/";

  return (
    <AppFooter
      variant={isDarkFooter ? "dark" : "light"}
      containerClass={isDarkFooter ? undefined : CONTENT_CONTAINER_CLASS}
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
