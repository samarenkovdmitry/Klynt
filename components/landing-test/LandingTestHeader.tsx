"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DEMO_REPORT_PATH } from "@/lib/demo-report";

const navItems = [
  { href: "/landing-test", label: "Home", match: (p: string) => p === "/landing-test" },
  { href: "/analyze", label: "Analyze", match: (p: string) => p.startsWith("/analyze") },
  { href: DEMO_REPORT_PATH, label: "View demo", match: (p: string) => p.startsWith("/report") },
  { href: "/contact", label: "Contact", match: (p: string) => p.startsWith("/contact") },
];

export function LandingTestHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-transparent bg-transparent pt-[env(safe-area-inset-top,0px)]">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-6">
        <Link href="/landing-test" className="shrink-0" aria-label="Klynt — home">
          <img src="/klynt-logo-light.svg" alt="Klynt" className="h-auto w-[108px]" />
        </Link>

        <nav className="flex items-center gap-1" aria-label="Main">
          {navItems.map((item) => {
            const isActive = item.match(pathname);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-full px-4 py-2 text-[14px] font-medium transition-colors",
                  isActive
                    ? "bg-white/15 font-semibold text-white"
                    : "text-white/75 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
