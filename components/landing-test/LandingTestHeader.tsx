"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { RiCloseLine, RiMenuLine } from "@remixicon/react";
import { ReportPrefetchLink } from "@/components/ReportPrefetchLink";
import { DEMO_REPORT_PATH, DEMO_REPORT_SLUG } from "@/lib/demo-report";
import { LANDING_CONTAINER, LANDING_LOGO_LIGHT } from "./landingPageStyles";

const HEADER_HEIGHT_PX = 52;

const navItems = [
  { href: "#hero", label: "Analyze", match: (p: string) => p === "/" },
  {
    href: DEMO_REPORT_PATH,
    label: "Sample report",
    match: (p: string) => p.startsWith("/report"),
    prefetch: true,
  },
  { href: "/contact", label: "Contact", match: (p: string) => p.startsWith("/contact") },
];

function navLinkClass(isActive: boolean) {
  return [
    "rounded-lg px-3 py-[5px] text-[13px] transition-colors duration-150",
    isActive ? "font-medium text-[#F2F2EF]" : "text-[#7A7A74] hover:text-[#F2F2EF]",
  ].join(" ");
}

function mobileNavLinkClass(isActive: boolean) {
  return [
    "block w-full rounded-xl px-4 py-3 text-left text-[15px] font-medium transition-colors",
    isActive
      ? "bg-white/[0.06] font-semibold text-[#F2F2EF]"
      : "text-[#F2F2EF]/80 hover:bg-white/[0.04] hover:text-[#F2F2EF]",
  ].join(" ");
}

export function LandingTestHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] bg-[#0E0E0C]/88 pt-[env(safe-area-inset-top,0px)] backdrop-blur-[16px]">
        <div className={`${LANDING_CONTAINER} flex h-[52px] items-center justify-between gap-4 px-4 md:px-8`}>
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Klynt — home">
            <img src={LANDING_LOGO_LIGHT} alt="Klynt" className="h-[22px] w-auto shrink-0" />
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <nav className="flex items-center gap-0.5" aria-label="Main">
              {navItems.map((item) => {
                const isActive = item.match(pathname);
                const className = navLinkClass(isActive);

                if (item.prefetch) {
                  return (
                    <ReportPrefetchLink
                      key={item.href}
                      href={item.href}
                      routeParam={DEMO_REPORT_SLUG}
                      className={className}
                    >
                      {item.label}
                    </ReportPrefetchLink>
                  );
                }

                return (
                  <Link key={item.href} href={item.href} className={className}>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <Link
              href="#hero"
              className="ml-1 rounded-lg bg-[#F2F2EF] px-4 py-[7px] text-[13px] font-medium text-[#0E0E0C] transition-opacity hover:opacity-85"
            >
              Analyze
            </Link>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#F2F2EF] transition-colors hover:bg-white/[0.06] md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <RiCloseLine size={24} aria-hidden /> : <RiMenuLine size={24} aria-hidden />}
          </button>
        </div>
      </header>

      <div className="md:hidden" aria-hidden={!menuOpen}>
        <button
          type="button"
          className={`fixed inset-0 z-40 bg-black/45 ${menuOpen ? "" : "pointer-events-none invisible"}`}
          aria-label="Close menu"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
        />

        <nav
          id="landing-mobile-nav"
          className={`fixed right-4 z-50 min-w-[200px] rounded-2xl border border-white/[0.08] bg-[#141412] p-2 shadow-[0_16px_48px_rgba(0,0,0,0.4)] ${menuOpen ? "" : "pointer-events-none invisible"}`}
          style={{
            top: `calc(${HEADER_HEIGHT_PX}px + env(safe-area-inset-top, 0px) + 8px)`,
          }}
          aria-label="Main mobile"
          aria-hidden={!menuOpen}
        >
          {navItems.map((item) => {
            const isActive = item.match(pathname);
            const className = mobileNavLinkClass(isActive);

            if (item.prefetch) {
              return (
                <ReportPrefetchLink
                  key={item.href}
                  href={item.href}
                  routeParam={DEMO_REPORT_SLUG}
                  tabIndex={menuOpen ? 0 : -1}
                  className={className}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </ReportPrefetchLink>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                tabIndex={menuOpen ? 0 : -1}
                className={className}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="#hero"
            tabIndex={menuOpen ? 0 : -1}
            className="mt-1 flex w-full items-center justify-center rounded-xl bg-[#F2F2EF] px-4 py-3 text-[15px] font-medium text-[#0E0E0C]"
            onClick={() => setMenuOpen(false)}
          >
            Analyze
          </Link>
        </nav>
      </div>
    </>
  );
}
