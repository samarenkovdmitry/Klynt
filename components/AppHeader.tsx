"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { RiCloseLine, RiMenuLine } from "@remixicon/react";
import { ReportPrefetchLink } from "@/components/ReportPrefetchLink";
import { LANDING_DARK } from "@/components/landing-test/landingPageStyles";
import { DEMO_REPORT_PATH, DEMO_REPORT_SLUG } from "@/lib/demo-report";
import { HEADER_HEIGHT_PX } from "@/lib/layout-constants";

const APP_CHROME = "#FFFFFF";

type NavItem = {
  href: string;
  label: string;
  isActive?: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
  {
    href: "/landing-copy",
    label: "Hero copy",
    isActive: (p) => p.startsWith("/landing-copy"),
  },
  {
    href: "/analyze",
    label: "UX audit",
    isActive: (p) => p.startsWith("/analyze"),
  },
  {
    href: DEMO_REPORT_PATH,
    label: "Sample report",
    isActive: (p) => p === DEMO_REPORT_PATH || p.startsWith(`${DEMO_REPORT_PATH}/`),
  },
  { href: "/contact", label: "Contact" },
];

function navLinkClass(isActive: boolean, isLanding: boolean) {
  const base =
    "rounded-full px-3 py-2 text-[13px] font-medium transition-colors md:px-4 md:text-[14px]";

  if (isLanding) {
    return [
      base,
      isActive
        ? "bg-white/15 font-semibold text-white"
        : "text-white/75 hover:bg-white/10 hover:text-white",
    ].join(" ");
  }

  return [
    base,
    isActive
      ? "bg-[rgba(6,28,47,0.06)] font-semibold text-[#061C2F]"
      : "text-[#061C2F]/65 hover:bg-[rgba(6,28,47,0.04)] hover:text-[#061C2F]",
  ].join(" ");
}

function mobileNavLinkClass(isActive: boolean) {
  return [
    "block w-full rounded-xl px-4 py-3 text-left text-[15px] font-medium transition-colors",
    isActive
      ? "bg-[rgba(6,28,47,0.06)] font-semibold text-[#061C2F]"
      : "text-[#061C2F]/80 hover:bg-[rgba(6,28,47,0.04)] hover:text-[#061C2F]",
  ].join(" ");
}

function isNavActive(item: NavItem, pathname: string) {
  if (item.isActive) return item.isActive(pathname);
  if (item.href === "/") return pathname === "/";
  if (item.href.startsWith("#")) return false;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function isDarkLandingHeader(pathname: string) {
  return pathname === "/" || pathname.startsWith("/landing-copy");
}

export function AppHeader() {
  const pathname = usePathname();
  const isDarkLanding = isDarkLandingHeader(pathname);
  const isCopyOptimizer = pathname.startsWith("/landing-copy");
  const isHome = pathname === "/";
  const isOverlayHeader = isHome || isCopyOptimizer;
  const showSubtitle = !isDarkLanding;
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const themeMeta = document.querySelector(
      'meta[name="theme-color"]'
    ) as HTMLMetaElement | null;

    html.style.backgroundColor = APP_CHROME;
    body.style.backgroundColor = APP_CHROME;
    themeMeta?.setAttribute(
      "content",
      pathname === "/" ? LANDING_DARK : APP_CHROME
    );
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <>
      <header
        className={[
          "app-site-header z-50 w-full pt-[env(safe-area-inset-top,0px)]",
          isOverlayHeader
            ? "absolute inset-x-0 top-0 border-b border-transparent bg-transparent"
            : "sticky top-0 border-b border-[rgba(6,28,47,0.10)] bg-white",
        ].join(" ")}
      >
        <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between gap-4 px-4 md:px-6">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3.5 sm:gap-4 md:gap-5"
            aria-label="Klynt — home"
            onClick={() => setMenuOpen(false)}
          >
            <img
              src={isDarkLanding ? "/klynt-logo-light.svg" : "/klynt-logo-dark.svg"}
              alt="Klynt"
              className="h-[30px] w-[100px] shrink-0"
            />
            {!showSubtitle ? null : (
              <>
                <span
                  className="h-4 w-px shrink-0 bg-[rgba(6,28,47,0.10)]"
                  aria-hidden
                />
                <span className="truncate text-[13px] font-medium tracking-normal text-[rgba(6,28,47,0.72)] md:text-[14px]">
                  Landing improvement kit
                </span>
              </>
            )}
          </Link>

          <nav
            className="hidden shrink-0 items-center gap-0.5 md:flex md:gap-1"
            aria-label="Main"
          >
            {navItems.map((item) =>
              item.href === DEMO_REPORT_PATH ? (
                <ReportPrefetchLink
                  key={item.href}
                  href={item.href}
                  routeParam={DEMO_REPORT_SLUG}
                  className={navLinkClass(isNavActive(item, pathname), isDarkLanding)}
                >
                  {item.label}
                </ReportPrefetchLink>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navLinkClass(isNavActive(item, pathname), isDarkLanding)}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <button
            type="button"
            className={[
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors md:hidden",
              isDarkLanding
                ? "text-white hover:bg-white/10"
                : "text-[#061C2F] hover:bg-[#061C2F]/8",
            ].join(" ")}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <RiCloseLine size={24} aria-hidden />
            ) : (
              <RiMenuLine size={24} aria-hidden />
            )}
          </button>
        </div>
      </header>

      {menuOpen ? (
        <div className="md:hidden">
          <button
            type="button"
            className="fixed inset-0 z-40 bg-[#18181B]/45"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />

          <nav
            id="mobile-nav-menu"
            className="fixed right-4 z-50 min-w-[200px] rounded-2xl border border-[rgba(6,28,47,0.08)] bg-white p-2 shadow-[0_16px_48px_rgba(6,28,47,0.14)]"
            style={{
              top: `calc(${HEADER_HEIGHT_PX}px + env(safe-area-inset-top, 0px) + 8px)`,
            }}
            aria-label="Main mobile"
          >
            {navItems.map((item) =>
              item.href === DEMO_REPORT_PATH ? (
                <ReportPrefetchLink
                  key={item.href}
                  href={item.href}
                  routeParam={DEMO_REPORT_SLUG}
                  className={mobileNavLinkClass(isNavActive(item, pathname))}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </ReportPrefetchLink>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={mobileNavLinkClass(isNavActive(item, pathname))}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>
        </div>
      ) : null}
    </>
  );
}
