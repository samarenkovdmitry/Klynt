"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { RiCloseLine, RiMenuLine } from "@remixicon/react";

const NAV_ITEMS = [
  { href: "/analyze",  label: "UX audit",      isActive: (p: string) => p.startsWith("/analyze") || p.startsWith("/report") },
  { href: "/examples", label: "Sample reports", isActive: (p: string) => p.startsWith("/examples") },
  { href: "/contact",  label: "Contact",       isActive: (p: string) => p === "/contact" },
];

export function AppHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    if (isHome) return;
    fetch("/api/stats").then((r) => r.json()).then((d) => setCount(d.count)).catch(() => {});
  }, [isHome]);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 4); }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setMenuOpen(false); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      <header
        className="app-site-header sticky top-0 z-50 w-full border-b border-[#DCD8CD] px-6 pt-[env(safe-area-inset-top,0px)] transition-[background] duration-200 md:px-[72px]"
        style={{
          background: scrolled ? "rgba(236,234,226,0.82)" : "#ECEAE2",
          backdropFilter: scrolled ? "blur(14px)" : "none",
        }}
      >
        <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-4">
          {/* Logo + badge */}
          <div className="flex min-w-0 items-center gap-8">
            <Link href="/" aria-label="Klynt — home" onClick={() => setMenuOpen(false)}>
              <Image
                src="/klynt-logo-v4.svg"
                alt="Klynt"
                width={108}
                height={32}
                className="block h-[28px] w-auto"
                priority
              />
            </Link>

            {isHome ? (
              <span className="hidden font-mono text-[11.5px] tracking-[.04em] text-[#8C887D] sm:block">
                LANDING IMPROVEMENT KIT
              </span>
            ) : count !== null && (
              <span
                className="hidden items-center gap-[7px] text-[11.5px] tracking-[0.04em] text-[#57544C] sm:inline-flex"
                style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
              >
                <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-v2-pass" />
                {count.toLocaleString("en-US")} PAGES IMPROVED
              </span>
            )}
          </div>

          {/* Desktop nav */}
          <nav className="hidden shrink-0 items-center gap-[22px] md:flex" aria-label="Main">
            {NAV_ITEMS.map((item) => {
              const active = item.isActive(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "rounded-full px-3 py-[6px] text-[14px] transition-colors duration-150 ease-out",
                    active
                      ? "bg-[#E8E6E0] font-semibold text-[#1B1A17]"
                      : "font-medium text-[#9B9B9B] hover:text-[#1A1A1A]",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#1B1A17] transition-colors hover:bg-[rgba(27,26,23,0.06)] md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <RiCloseLine size={24} aria-hidden /> : <RiMenuLine size={24} aria-hidden />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <div className="md:hidden" aria-hidden={!menuOpen}>
        <button
          type="button"
          className={`fixed inset-0 z-40 bg-[#1B1A17]/40 ${menuOpen ? "" : "pointer-events-none invisible"}`}
          aria-label="Close menu"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
        />
        <nav
          id="mobile-nav-menu"
          className={[
            "fixed right-4 z-50 min-w-[200px] rounded-2xl border border-[#DCD8CD] bg-[rgba(236,234,226,0.96)] p-2 shadow-[0_16px_48px_rgba(27,26,23,0.14)] backdrop-blur-sm",
            menuOpen ? "" : "pointer-events-none invisible",
          ].join(" ")}
          style={{ top: `calc(64px + env(safe-area-inset-top, 0px) + 8px)` }}
          aria-label="Main mobile"
          aria-hidden={!menuOpen}
        >
          {NAV_ITEMS.map((item) => {
            const active = item.isActive(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                tabIndex={menuOpen ? 0 : -1}
                className={[
                  "block w-full rounded-xl px-4 py-3 text-left text-[15px] transition-colors",
                  active
                    ? "bg-[rgba(27,26,23,0.06)] font-semibold text-[#1B1A17]"
                    : "font-medium text-[#57544C] hover:bg-[rgba(27,26,23,0.04)] hover:text-[#1B1A17]",
                ].join(" ")}
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
