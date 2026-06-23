import Image from "next/image";
import Link from "next/link";
import { RiCheckboxCircleLine } from "@remixicon/react";

import { DEMO_REPORT_PATH } from "@/lib/demo-report";

const PRODUCT = [
  { href: "/analyze",       label: "UX audit" },
  { href: "/landing-copy",  label: "Hero copy" },
  { href: DEMO_REPORT_PATH, label: "Sample report" },
];

const COMPANY = [
  { href: "/contact",  label: "Contact" },
  { href: "/terms",    label: "Terms" },
  { href: "/privacy",  label: "Privacy" },
];

export function V2Footer() {
  return (
    <footer className="bg-v2-dark px-6 pb-10 pt-16 text-[#EDEAE2] md:px-[72px]">
      <div className="mx-auto max-w-[1080px]">
        <div className="grid gap-12 border-b border-[#34322C] pb-10 md:grid-cols-[1.6fr_1fr_1fr]">
          <div className="max-w-[340px]">
            <Image
              src="/klynt-logo-light.svg"
              alt="Klynt"
              width={92}
              height={28}
              className="mb-4"
            />
            <p className="text-[14px] leading-[1.55] text-[#A8A294]">
              The landing-page audit that measures, not guesses. Paste a URL, get exactly what to fix.
            </p>
          </div>

          <div className="flex flex-col gap-[11px]">
            <span className="mb-[3px] font-mono text-[11px] tracking-[.08em] text-[#6B6557]">PRODUCT</span>
            {PRODUCT.map((l) => (
              <Link key={l.href} href={l.href} className="text-[14px] text-[#A8A294] transition-colors hover:text-white">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-[11px]">
            <span className="mb-[3px] font-mono text-[11px] tracking-[.08em] text-[#6B6557]">COMPANY</span>
            {COMPANY.map((l) => (
              <Link key={l.href} href={l.href} className="text-[14px] text-[#A8A294] transition-colors hover:text-white">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-6">
          <span className="font-mono text-[11.5px] tracking-[.04em] text-[#6B6557]">
            © 2026 KLYNT · LANDING IMPROVEMENT KIT
          </span>
          <span className="inline-flex items-center gap-[7px] font-mono text-[11.5px] tracking-[.05em] text-lv2-green">
            <RiCheckboxCircleLine size={14} aria-hidden />
            NO AI GUESSING
          </span>
        </div>
      </div>
    </footer>
  );
}
