"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { RiCloseLine, RiMenuLine } from "@remixicon/react";

import { LANDING_CONTAINER } from "@/components/landing-test/landingPageStyles";
import { DEMO_REPORT_PATH } from "@/lib/demo-report";

const HEADER_HEIGHT_PX = 68;

const navItems = [
  { href: "/analyze", label: "Analyze", match: (p: string) => p.startsWith("/analyze") },
  {
    href: DEMO_REPORT_PATH,
    label: "Sample report",
    match: (p: string) =>
      p === DEMO_REPORT_PATH || p.startsWith(`${DEMO_REPORT_PATH}/`),
  },
  { href: "/contact", label: "Contact", match: (p: string) => p.startsWith("/contact") },
];

function mobileNavLinkClass(isActive: boolean) {
  return [
    "block w-full rounded-xl px-4 py-3 text-left text-[15px] font-medium transition-colors",
    isActive
      ? "bg-[#F4F8FF] font-semibold text-[#061C2F]"
      : "text-[#061C2F]/80 hover:bg-[#F8FAFC] hover:text-[#061C2F]",
  ].join(" ");
}

export function CopyOptimizerHeader() {
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
      <header className="sticky top-0 z-50 w-full border-b border-transparent bg-transparent pt-[env(safe-area-inset-top,0px)]">
        <div className={`${LANDING_CONTAINER} flex h-[68px] items-center justify-between px-4 md:px-6`}>
          <Link href="/" className="shrink-0" aria-label="Klynt — home">
            <img src="/klynt-logo-light.svg" alt="Klynt" className="h-[30px] w-[100px] shrink-0" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {navItems.map((item) => {
              const isActive = item.match(pathname);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "rounded-full px-4 py-2 text-[14px] font-medium transition-colors",
                    isActive
                      ? "bg-white/5 font-semibold text-white"
                      : "text-white/75 hover:bg-white/5 hover:text-white",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="copy-optimizer-mobile-nav"
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
          className={`fixed inset-0 z-40 bg-[#061C2F]/40 ${menuOpen ? "" : "pointer-events-none invisible"}`}
          aria-label="Close menu"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
        />

        <nav
          id="copy-optimizer-mobile-nav"
          className={`
            fixed
            right-4
            z-50
            min-w-[200px]
            rounded-2xl
            border
            border-[rgba(6,28,47,0.08)]
            bg-white
            p-2
            shadow-[0_16px_48px_rgba(6,28,47,0.14)]
            ${menuOpen ? "" : "pointer-events-none invisible"}
          `}
          style={{
            top: `calc(${HEADER_HEIGHT_PX}px + env(safe-area-inset-top, 0px) + 8px)`,
          }}
          aria-label="Main mobile"
          aria-hidden={!menuOpen}
        >
          {navItems.map((item) => {
            const isActive = item.match(pathname);

            return (
              <Link
                key={item.href}
                href={item.href}
                tabIndex={menuOpen ? 0 : -1}
                className={mobileNavLinkClass(isActive)}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
