"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";

import { V2Footer } from "@/components/landing-v2/V2Footer";

function AppFooterContent() {
  const pathname = usePathname();

  if (pathname?.includes("/print")) {
    return null;
  }

  return <V2Footer />;
}

export function AppFooterWrapper() {
  return (
    <Suspense fallback={null}>
      <AppFooterContent />
    </Suspense>
  );
}
