"use client";

import { usePathname } from "next/navigation";

import { AppFooter } from "@/components/AppFooter";
import { APP_SHELL_CONTAINER_CLASS } from "@/components/report/reportStyles";

function isWorkspacePath(pathname: string | null) {
  if (!pathname) return false;

  return (
    pathname.startsWith("/analyze") ||
    (pathname.startsWith("/report") && !pathname.includes("/print")) ||
    pathname === "/contact" ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms")
  );
}

export function AppFooterWrapper() {
  const pathname = usePathname();
  const isDarkFooter =
    pathname === "/" || pathname === "/landing-copy" || pathname?.startsWith("/landing-copy/");
  const isWorkspaceFooter = isWorkspacePath(pathname);
  const isPrintRoute = pathname?.includes("/print");

  if (isPrintRoute) {
    return null;
  }

  if (isWorkspaceFooter) {
    return (
      <AppFooter
        variant="workspace"
        compact
        containerClass={APP_SHELL_CONTAINER_CLASS}
      />
    );
  }

  return (
    <AppFooter
      variant={isDarkFooter ? "dark" : "light"}
      containerClass={isDarkFooter ? undefined : APP_SHELL_CONTAINER_CLASS}
    />
  );
}
