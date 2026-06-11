"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { RiCloseLine, RiMenuLine } from "@remixicon/react";
import { ReportPrefetchLink } from "@/components/ReportPrefetchLink";
import {
  APP_HEADER_CONTAINER_CLASS,
  APP_REPORT_HEADER_CONTAINER_CLASS,
} from "@/components/report/reportStyles";
import { DEMO_REPORT_PATH, DEMO_REPORT_SLUG } from "@/lib/demo-report";

const HEADER_HEIGHT_PX = 52;
const REPORT_HEADER_HEIGHT_PX = 70;

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
    label: "Landing report",
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
    "rounded-lg px-[11px] py-[5px] text-[13px] transition-all duration-150";

  if (isLanding) {
    return [
      base,
      isActive
        ? "bg-white/15 font-medium text-white"
        : "text-white/75 hover:bg-white/10 hover:text-white",
    ].join(" ");
  }

  return [
    base,
    isActive
      ? "bg-black/[0.07] font-medium text-[#111]"
      : "text-[#999] hover:bg-black/[0.05] hover:text-[#111]",
  ].join(" ");
}

function mobileNavLinkClass(isActive: boolean) {
  return [
    "block w-full rounded-xl px-4 py-3 text-left text-[15px] font-medium transition-colors",
    isActive
      ? "bg-black/[0.06] font-semibold text-[#111]"
      : "text-[#111]/80 hover:bg-black/[0.04] hover:text-[#111]",
  ].join(" ");
}

function isNavActive(item: NavItem, pathname: string) {
  if (item.isActive) return item.isActive(pathname);
  if (item.href === "/") return pathname === "/";
  if (item.href.startsWith("#")) return false;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AppHeader() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const isReportOrAnalyze =
    (pathname.startsWith("/report") && !pathname.includes("/print")) ||
    pathname.startsWith("/analyze");
  const [menuOpen, setMenuOpen] = useState(false);
  const headerHeightPx = isReportOrAnalyze ? REPORT_HEADER_HEIGHT_PX : HEADER_HEIGHT_PX;

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
          isReportOrAnalyze
            ? "relative z-10 border-b border-transparent bg-[#EBEBEB]"
            : "sticky top-0 z-50 border-b border-transparent",
          isLanding
            ? "bg-transparent"
            : isReportOrAnalyze
              ? ""
              : "bg-[#EFEFED]",
        ].join(" ")}
      >
        <div
          className={
            isReportOrAnalyze ? APP_REPORT_HEADER_CONTAINER_CLASS : APP_HEADER_CONTAINER_CLASS
          }
        >
          <Link
            href="/"
            className="flex min-w-0 items-center gap-[7px]"
            aria-label="Klynt — home"
            onClick={() => setMenuOpen(false)}
          >
            {isLanding ? (
              <img
                src="/klynt-logo-light.svg"
                alt="Klynt"
                className="h-[30px] w-[100px] shrink-0"
              />
            ) : isReportOrAnalyze ? (
              <img
                src="/klynt-logo-dark.svg"
                alt="Klynt"
                className="h-[30px] w-[100px] shrink-0"
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

          <nav
            className="hidden shrink-0 items-center gap-0.5 md:flex"
            aria-label="Main"
          >
            {navItems.map((item) =>
              item.href === DEMO_REPORT_PATH ? (
                <ReportPrefetchLink
                  key={item.href}
                  href={item.href}
                  routeParam={DEMO_REPORT_SLUG}
                  className={navLinkClass(isNavActive(item, pathname), isLanding)}
                >
                  {item.label}
                </ReportPrefetchLink>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navLinkClass(isNavActive(item, pathname), isLanding)}
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
              isLanding
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
          {navItems.map((item) =>
            item.href === DEMO_REPORT_PATH ? (
              <ReportPrefetchLink
                key={item.href}
                href={item.href}
                routeParam={DEMO_REPORT_SLUG}
                tabIndex={menuOpen ? 0 : -1}
                className={mobileNavLinkClass(isNavActive(item, pathname))}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </ReportPrefetchLink>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                tabIndex={menuOpen ? 0 : -1}
                className={mobileNavLinkClass(isNavActive(item, pathname))}
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
