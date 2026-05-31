import Link from "next/link";
import {
  RiLinkedinBoxFill,
  RiProductHuntFill,
  RiReddit2Line,
  RiTwitterXLine,
} from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";

import { LANDING_UPDATE_CONTAINER } from "@/lib/landing-update-content";

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
      <div className={`${LANDING_UPDATE_CONTAINER} flex flex-col items-center text-center`}>
        <p className="text-[14px] font-normal text-[#8E99A2]">
          © 2026 Klynt – UX Clarity Analyzer
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[14px] font-medium text-[#8E99A2] md:mt-4">
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

        <div className="mt-10 flex items-center justify-center gap-11 md:mt-10">
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
    </footer>
  );
}
