import Link from "next/link";
import {
  RiLinkedinBoxFill,
  RiProductHuntFill,
  RiReddit2Line,
  RiTwitterXLine,
} from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";

import { DEMO_REPORT_PATH } from "@/lib/demo-report";
import { LANDING_UPDATE_CONTAINER } from "@/lib/landing-update-content";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/analyze", label: "Analyze" },
  { href: DEMO_REPORT_PATH, label: "View demo" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
];

const socialLinks: {
  href: string;
  label: string;
  icon: RemixiconComponentType;
}[] = [
  { href: "https://x.com/klynt_ai", label: "X", icon: RiTwitterXLine },
  {
    href: "https://www.linkedin.com/in/smrnkov/",
    label: "LinkedIn",
    icon: RiLinkedinBoxFill,
  },
  {
    href: "https://www.reddit.com/user/DmitryKlynt/",
    label: "Reddit",
    icon: RiReddit2Line,
  },
  {
    href: "https://www.producthunt.com/@dima_samarenkov",
    label: "Product Hunt",
    icon: RiProductHuntFill,
  },
];

export function AppFooter() {
  return (
    <footer className="mt-auto w-full shrink-0 border-t border-[rgba(6,28,47,0.06)] bg-white px-6 py-[33px] md:px-6 md:py-10">
      <div className={LANDING_UPDATE_CONTAINER}>
        <div className="flex flex-col items-center text-center md:hidden">
          <p className="text-[14px] font-normal text-[#8E99A2]">
            © 2026 Klynt – UX Clarity Analyzer
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[14px] font-medium text-[#8E99A2]">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-[#061C2F]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center gap-11">
            {socialLinks.map((link) => {
              const Icon = link.icon;

              return (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[#8E99A2] transition hover:text-[#061C2F]"
                  aria-label={link.label}
                >
                  <Icon size={24} />
                </a>
              );
            })}
          </div>
        </div>

        <div className="hidden md:grid md:grid-cols-[1.2fr_0.8fr_1fr] md:items-start md:gap-10 md:text-left">
          <Link href="/" aria-label="Klynt — home" className="inline-flex justify-start">
            <img src="/klynt-logo-dark.svg" alt="Klynt" className="h-[30px] w-auto" />
          </Link>

          <div className="space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-[15px] font-medium text-[#8E99A2] transition hover:text-[#061C2F]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div>
            <p className="text-[14px] font-medium text-[#8E99A2]">Connect</p>
            <div className="mt-4 flex items-center gap-4">
              {socialLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-[#8E99A2] transition hover:text-[#061C2F]"
                    aria-label={link.label}
                  >
                    <Icon size={24} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 hidden flex-col items-center gap-4 border-t border-[rgba(6,28,47,0.06)] pt-6 text-center text-[14px] text-[#8E99A2] md:mt-10 md:flex md:flex-row md:items-center md:justify-between md:text-left">
          <p className="font-normal">© 2026 Klynt – UX Clarity Analyzer</p>
          <div className="flex flex-wrap items-center justify-center gap-5 font-medium md:justify-start md:gap-7">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-[#061C2F]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
