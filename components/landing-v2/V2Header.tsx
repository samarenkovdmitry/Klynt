"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { RiMenuLine, RiCloseLine } from "@remixicon/react";

import { DEMO_REPORT_PATH } from "@/lib/demo-report";

const NAV = [
  { href: "/landing-copy", label: "Hero copy" },
  { href: "/analyze",      label: "UX audit" },
  { href: DEMO_REPORT_PATH, label: "Sample report" },
  { href: "/contact",      label: "Contact" },
];

export function V2Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative px-6" style={{ boxShadow: "0 1px 0 rgba(27,26,23,.10)" }}>
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-4">
      {/* Logo + kit label */}
      <div className="flex min-w-0 items-center gap-[32px]">
        <Link href="/" aria-label="Klynt — home">
          <Image src="/klynt-logo-v4.svg" alt="Klynt" width={96} height={29} priority />
        </Link>
        <span className="hidden font-mono text-[11.5px] tracking-[.04em] sm:block" style={{ color: "#8C887D" }}>
          LANDING IMPROVEMENT KIT
        </span>
      </div>

      {/* Desktop nav */}
      <nav className="hidden items-center gap-[26px] text-[14px] font-medium md:flex">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="transition-colors hover:text-[#1B1A17]"
            style={{ color: "#57544C" }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Mobile burger */}
      <button
        type="button"
        className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[11px] border border-lv2-border bg-lv2-card text-v2-dark md:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <RiCloseLine size={22} aria-hidden /> : <RiMenuLine size={22} aria-hidden />}
      </button>

      {/* Mobile dropdown */}
      {open && (
        <nav className="absolute left-4 right-4 top-[68px] z-50 flex flex-col gap-0.5 rounded-[14px] border border-lv2-border bg-lv2-card p-2 shadow-[0_16px_40px_-16px_rgba(27,26,23,.35)] md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[9px] px-[14px] py-[13px] text-[15px] font-medium text-v2-dark transition-colors hover:bg-lv2-cream"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
      </div>
    </header>
  );
}
