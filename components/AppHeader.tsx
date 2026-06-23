"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { RiCloseLine, RiMenuLine } from "@remixicon/react";
import { DEMO_REPORT_PATH, DEMO_REPORT_SLUG } from "@/lib/demo-report";
import { ReportPrefetchLink } from "@/components/ReportPrefetchLink";

const NAV_ITEMS = [
  {
    href: "/landing-copy",
    label: "Hero copy",
    isActive: (p: string) => p.startsWith("/landing-copy"),
  },
  {
    href: "/analyze",
    label: "UX audit",
    isActive: (p: string) => p.startsWith("/analyze") || p.startsWith("/report"),
  },
  {
    href: "/contact",
    label: "Contact",
    isActive: (p: string) => p === "/contact",
  },
];

function isActive(item: (typeof NAV_ITEMS)[number], pathname: string) {
  return item.isActive(pathname);
}

export function AppHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 4); }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      <header
        className="app-site-header sticky top-0 z-50 w-full border-b border-[#DCD8CD] pt-[env(safe-area-inset-top,0px)] transition-[background] duration-200"
        style={{
          background: scrolled ? "rgba(236,234,226,0.82)" : "#ECEAE2",
          backdropFilter: scrolled ? "blur(14px)" : "none",
        }}
      >
        <div className="mx-auto flex h-[64px] max-w-[1080px] items-center justify-between gap-4 px-[26px]">
          {/* Left: logo + divider + badge */}
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/" aria-label="Klynt — home" onClick={() => setMenuOpen(false)}>
              <Image
                src="/klynt-logo-v4.svg"
                alt="Klynt"
                width={92}
                height={28}
                className="block h-[22px] w-auto"
                priority
              />
            </Link>

            {count !== null && (
              <>
                <span className="h-[18px] w-px shrink-0 bg-[#CFC9BB]" aria-hidden />
                <span
                  className="inline-flex items-center gap-[7px] text-[11.5px] tracking-[0.04em] text-[#57544C]"
                  style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
                >
                  <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-v2-pass" />
                  {count.toLocaleString("en-US")} PAGES IMPROVED
                </span>
              </>
            )}
          </div>

          {/* Desktop nav */}
          <nav className="hidden shrink-0 items-center gap-[22px] md:flex" aria-label="Main">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item, pathname);
              const cls = [
                "text-[14px] pb-[3px] transition-colors",
                active
                  ? "font-semibold text-[#1B1A17] border-b-2 border-v2-accent"
                  : "font-medium text-[#8C887D] border-b-2 border-transparent hover:text-[#1B1A17]",
              ].join(" ");

              if (item.href === DEMO_REPORT_PATH) {
                return (
                  <ReportPrefetchLink
                    key={item.href}
                    href={item.href}
                    routeParam={DEMO_REPORT_SLUG}
                    className={cls}
                  >
                    {item.label}
                  </ReportPrefetchLink>
                );
              }
              return (
                <Link key={item.href} href={item.href} className={cls}>
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
            const active = isActive(item, pathname);
            const cls = [
              "block w-full rounded-xl px-4 py-3 text-left text-[15px] transition-colors",
              active
                ? "font-semibold text-[#1B1A17] bg-[rgba(27,26,23,0.06)]"
                : "font-medium text-[#57544C] hover:bg-[rgba(27,26,23,0.04)] hover:text-[#1B1A17]",
            ].join(" ");

            if (item.href === DEMO_REPORT_PATH) {
              return (
                <ReportPrefetchLink
                  key={item.href}
                  href={item.href}
                  routeParam={DEMO_REPORT_SLUG}
                  tabIndex={menuOpen ? 0 : -1}
                  className={cls}
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
                className={cls}
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
