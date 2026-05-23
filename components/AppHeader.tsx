"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type HeaderVariant = "app" | "landing";

type NavItem = {
  href: string;
  label: string;
  isActive?: (pathname: string) => boolean;
};

const appNav: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/analyze", label: "Analyze" },
];

const landingNav: NavItem[] = [
  { href: "/", label: "Home", isActive: (p) => p === "/" },
  { href: "/analyze", label: "Analyze" },
  { href: "#report", label: "View demo" },
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

  const headerClass =
    variant === "landing"
      ? "relative z-20 w-full border-b border-transparent bg-transparent"
      : "sticky top-0 z-50 w-full border-b border-[rgba(6,28,47,0.06)] bg-white/90 backdrop-blur-xl";

  const subtitleClass =
    variant === "landing"
      ? "truncate text-[12px] font-semibold tracking-[-0.02em] text-[#061C2F] sm:text-[13px] md:text-[14px]"
      : "truncate text-[12px] font-semibold tracking-[-0.02em] text-[#061C2F] sm:text-[13px] md:text-[14px]";

  return (
    <header className={headerClass}>
      <div className="mx-auto flex h-[64px] max-w-[1180px] items-center justify-between gap-4 px-4 md:h-[72px] md:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3.5 sm:gap-4 md:gap-5"
          aria-label="Klynt — home"
        >
          <img
            src="/klynt-logo-dark.svg"
            alt=""
            className="h-[34px] w-auto shrink-0 md:h-[40px]"
          />
          <span className={subtitleClass}>UX Clarity Analyzer</span>
        </Link>

        <nav
          className="flex shrink-0 items-center gap-0.5 sm:gap-1"
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
      </div>
    </header>
  );
}
