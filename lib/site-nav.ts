import { DEMO_REPORT_PATH } from "@/lib/demo-report";

export type SiteNavItem = {
  href: string;
  label: string;
  isActive: (pathname: string) => boolean;
};

export function isSampleReportActive(pathname: string) {
  return (
    pathname === DEMO_REPORT_PATH || pathname.startsWith(`${DEMO_REPORT_PATH}/`)
  );
}

export function isAnalyzeActive(pathname: string) {
  return pathname.startsWith("/analyze");
}

export function isContactActive(pathname: string) {
  return pathname.startsWith("/contact");
}

export function isLandingHomeActive(pathname: string) {
  return pathname === "/";
}

/** Shared product nav — Hero copy omitted (page stays at /landing-copy). */
export const SITE_NAV_ITEMS: SiteNavItem[] = [
  {
    href: "/analyze",
    label: "Analyze",
    isActive: isAnalyzeActive,
  },
  {
    href: DEMO_REPORT_PATH,
    label: "Sample report",
    isActive: isSampleReportActive,
  },
  {
    href: "/contact",
    label: "Contact",
    isActive: isContactActive,
  },
];
