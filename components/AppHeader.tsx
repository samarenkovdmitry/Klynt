"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { RiCloseLine, RiMenuLine } from "@remixicon/react";
import { DEMO_REPORT_PATH } from "@/lib/demo-report";

type HeaderVariant = "app" | "landing";

type NavItem = {
  href: string;
  label: string;
  isActive?: (pathname: string) => boolean;
};

const appNav: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/analyze", label: "Analyze" },
  { href: DEMO_REPORT_PATH, label: "View demo" },
  { href: "/contact", label: "Contact" },
];

const landingNav: NavItem[] = [
  { href: "/", label: "Home", isActive: (p) => p === "/" },
  { href: "/analyze", label: "Analyze" },
  { href: DEMO_REPORT_PATH, label: "View demo" },
  { href: "/contact", label: "Contact" },
];

function navLinkClass(isActive: boolean, variant: HeaderVariant) {
  if (variant === "landing") {
    return [
      "rounded-full px-3 py-2 text-[13px] font-medium transition-colors md:px-4 md:text-[14px]",
      isActive
        ? "bg-[#061C2F]/10 text-[#061C2F] font-semibold"
        : "text-[#061C2F]/70 hover:bg-[#061C2F]/5 hover:text-[#061C2F]",
    ].join(" ");
  }

  return [
    "rounded-full px-3 py-2 text-[13px] font-medium transition-colors md:px-4 md:text-[14px]",
    isActive
      ? "bg-[#F4F8FF] text-[#061C2F] font-semibold"
      : "text-[#061C2F]/65 hover:bg-[#F8FAFC] hover:text-[#061C2F]",
  ].join(" ");
}

function mobileNavLinkClass(isActive: boolean, variant: HeaderVariant) {
  if (variant === "landing") {
    return [
      "block w-full rounded-xl px-4 py-3 text-left text-[15px] font-medium transition-colors",
      isActive
        ? "bg-[#061C2F]/10 text-[#061C2F] font-semibold"
        : "text-[#061C2F]/80 hover:bg-[#061C2F]/5 hover:text-[#061C2F]",
    ].join(" ");
  }

  return [
    "block w-full rounded-xl px-4 py-3 text-left text-[15px] font-medium transition-colors",
    isActive
      ? "bg-[#F4F8FF] text-[#061C2F] font-semibold"
      : "text-[#061C2F]/80 hover:bg-[#F8FAFC] hover:text-[#061C2F]",
  ].join(" ");
}

function isNavActive(item: NavItem, pathname: string) {
  if (item.isActive) return item.isActive(pathname);
  if (item.href === "/") return pathname === "/";
  if (item.href.startsWith("#")) return false;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

type AppHeaderProps = {
  variant?: HeaderVariant;
};

export function AppHeader({ variant = "app" }: AppHeaderProps) {
  const pathname = usePathname();
  const navItems = variant === "landing" ? landingNav : appNav;
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

  const headerClass =
    variant === "landing"
      ? "relative z-50 w-full border-b border-transparent bg-transparent pt-[env(safe-area-inset-top,0px)]"
      : "sticky top-0 z-50 w-full border-b border-[rgba(6,28,47,0.06)] bg-white";

  const subtitleClass =
    variant === "landing"
      ? "truncate text-[12px] font-semibold tracking-[-0.02em] text-[#061C2F] sm:text-[13px] md:text-[14px]"
      : "truncate text-[12px] font-semibold tracking-[-0.02em] text-[#061C2F] sm:text-[13px] md:text-[14px]";

  return (
    <>
      <header className={headerClass}>
        <div className="mx-auto flex h-[64px] max-w-[1440px] items-center justify-between gap-4 px-4 md:h-[72px] md:px-6">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3.5 sm:gap-4 md:gap-5"
            aria-label="Klynt — home"
            onClick={() => setMenuOpen(false)}
          >
            <img
              src="/klynt-logo-dark.svg"
              alt=""
              className="h-[34px] w-auto shrink-0 md:h-[40px]"
            />
            <span className={subtitleClass}>UX Clarity Analyzer</span>
          </Link>

          <nav
            className="hidden shrink-0 items-center gap-0.5 md:flex md:gap-1"
            aria-label="Main"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navLinkClass(isNavActive(item, pathname), variant)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              text-[#061C2F]
              transition-colors
              hover:bg-[#061C2F]/8
              md:hidden
            "
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
          className={`fixed inset-0 z-40 bg-[#061C2F]/40 ${menuOpen ? "" : "pointer-events-none invisible"}`}
          aria-label="Close menu"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
        />

        <nav
          id="mobile-nav-menu"
          className={`
            fixed
            right-4
            top-[calc(64px+env(safe-area-inset-top,0px)+8px)]
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
          aria-label="Main mobile"
          aria-hidden={!menuOpen}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              tabIndex={menuOpen ? 0 : -1}
              className={mobileNavLinkClass(
                isNavActive(item, pathname),
                variant
              )}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
