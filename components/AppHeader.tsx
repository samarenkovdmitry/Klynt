"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { RiCloseLine, RiMenuLine } from "@remixicon/react";
import { ReportPrefetchLink } from "@/components/ReportPrefetchLink";
import {
  APP_HEADER_CONTAINER_CLASS,
  APP_REPORT_HEADER_CONTAINER_CLASS,
  WORKSPACE_BG_CLASS,
} from "@/components/report/reportStyles";
import { DEMO_REPORT_PATH, DEMO_REPORT_SLUG } from "@/lib/demo-report";
import { SITE_NAV_ITEMS } from "@/lib/site-nav";

const HEADER_HEIGHT_PX = 52;
const REPORT_HEADER_HEIGHT_PX = 50;

function isReportPath(pathname: string) {
  return pathname.startsWith("/report") && !pathname.includes("/print");
}

function navLinkClass(isActive: boolean, isDarkPage: boolean) {
  const base =
    "rounded-lg px-3 py-[5px] text-[14px] transition-colors duration-150";

  if (isDarkPage) {
    return [
      base,
      isActive
        ? "font-medium text-white"
        : "text-white/75 hover:text-white",
    ].join(" ");
  }

  return [
    base,
    isActive
      ? "font-medium text-[#111]"
      : "text-[#999] hover:text-[#111]",
  ].join(" ");
}

function mobileNavLinkClass(isActive: boolean) {
  return [
    "block w-full rounded-xl px-4 py-3 text-left text-[15px] font-medium transition-colors",
    isActive
      ? "font-semibold text-[#111]"
      : "text-[#111]/80 hover:bg-black/[0.04] hover:text-[#111]",
  ].join(" ");
}

export function AppHeader() {
  const pathname = usePathname();
  const isDarkPage = pathname === "/" || pathname.startsWith("/analyze");
  const isReportPage = isReportPath(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerHeightPx = isReportPage ? REPORT_HEADER_HEIGHT_PX : HEADER_HEIGHT_PX;

  useEffect(() => {
    setMenuOpen(false);
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
          "app-site-header w-full pt-[env(safe-area-inset-top,0px)]",
          isReportPage
            ? `border-b border-black/[0.07] ${WORKSPACE_BG_CLASS}`
            : `sticky top-0 z-50 border-b border-transparent ${isDarkPage ? "bg-transparent" : WORKSPACE_BG_CLASS}`,
        ].join(" ")}
      >
        <div
          className={
            isReportPage ? APP_REPORT_HEADER_CONTAINER_CLASS : APP_HEADER_CONTAINER_CLASS
          }
        >
          <Link
            href="/"
            className="flex min-w-0 items-center gap-[7px]"
            aria-label="Klynt — home"
            onClick={() => setMenuOpen(false)}
          >
            {isDarkPage ? (
              <img
                src="/klynt-logo-light.svg"
                alt="Klynt"
                className="h-[26px] w-auto shrink-0"
              />
            ) : isReportPage ? (
              <img
                src="/klynt-logo-dark.svg"
                alt="Klynt"
                className="h-[26px] w-auto shrink-0"
              />
            ) : (
              <>
                <img
                  src="/icon.png"
                  alt=""
                  className="h-5 w-5 shrink-0 rounded-[6px]"
                  aria-hidden
                />
                <span className="text-[15px] font-semibold tracking-[-0.03em] text-[#111]">
                  Klynt
                </span>
              </>
            )}
          </Link>

          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <nav className="flex items-center gap-0.5" aria-label="Main">
              {SITE_NAV_ITEMS.map((item) =>
                item.href === DEMO_REPORT_PATH ? (
                  <ReportPrefetchLink
                    key={item.href}
                    href={item.href}
                    routeParam={DEMO_REPORT_SLUG}
                    className={navLinkClass(item.isActive(pathname), isDarkPage)}
                  >
                    {item.label}
                  </ReportPrefetchLink>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={navLinkClass(item.isActive(pathname), isDarkPage)}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>
          </div>

          <button
            type="button"
            className={[
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors md:hidden",
              isDarkPage
                ? "text-white hover:bg-white/10"
                : "text-[#111] hover:bg-black/[0.05]",
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

      <div className="md:hidden" aria-hidden={!menuOpen}>
        <button
          type="button"
          className={`fixed inset-0 z-40 bg-[#18181B]/45 ${menuOpen ? "" : "pointer-events-none invisible"}`}
          aria-label="Close menu"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
        />

        <nav
          id="mobile-nav-menu"
          className={`
            fixed
            right-4
            z-50
            min-w-[200px]
            rounded-2xl
            border
            border-black/[0.08]
            bg-white
            p-2
            shadow-[0_16px_48px_rgba(0,0,0,0.14)]
            ${menuOpen ? "" : "pointer-events-none invisible"}
          `}
          style={{
            top: `calc(${headerHeightPx}px + env(safe-area-inset-top, 0px) + 8px)`,
          }}
          aria-label="Main mobile"
          aria-hidden={!menuOpen}
        >
          {SITE_NAV_ITEMS.map((item) =>
            item.href === DEMO_REPORT_PATH ? (
              <ReportPrefetchLink
                key={item.href}
                href={item.href}
                routeParam={DEMO_REPORT_SLUG}
                tabIndex={menuOpen ? 0 : -1}
                className={mobileNavLinkClass(item.isActive(pathname))}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </ReportPrefetchLink>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                tabIndex={menuOpen ? 0 : -1}
                className={mobileNavLinkClass(item.isActive(pathname))}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>
      </div>
    </>
  );
}
