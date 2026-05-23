"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/analyze", label: "Analyze" },
] as const;

function navLinkClass(isActive: boolean) {
  return [
    "rounded-full px-3 py-2 text-[13px] font-medium transition-colors md:px-4 md:text-[14px]",
    isActive
      ? "bg-[#F4F8FF] text-[#061C2F] font-semibold"
      : "text-[#061C2F]/65 hover:bg-[#F8FAFC] hover:text-[#061C2F]",
  ].join(" ");
}

export function AppHeader() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[rgba(6,28,47,0.06)] bg-white/90 backdrop-blur-xl">
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
          <span className="truncate text-[12px] font-semibold tracking-[-0.02em] text-[#061C2F] sm:text-[13px] md:text-[14px]">
            UX Clarity Analyzer
          </span>
        </Link>

        <nav
          className="flex shrink-0 items-center gap-0.5 sm:gap-1"
          aria-label="Main"
        >
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={navLinkClass(isActive(href))}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
