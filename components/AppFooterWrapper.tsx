"use client";

import { usePathname } from "next/navigation";

import { AppFooter } from "@/components/AppFooter";
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
    <AppFooter variant={variant} compact containerClass={APP_SHELL_CONTAINER_CLASS} />
  );
}
