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
  { href: "https://x.com/useklynt", label: "X", icon: RiTwitterXLine },
  {
    href: "https://www.linkedin.com/in/dmitry-samarenkov/",
    label: "LinkedIn",
    icon: RiLinkedinBoxFill,
  },
  {
    href: "https://www.reddit.com/user/DmitryKlynt/",
    label: "Reddit",
    icon: RiReddit2Line,
  },
  {
    href: "https://www.producthunt.com/@dmitry_klynt",
    label: "Product Hunt",
    icon: RiProductHuntFill,
  },
];

const variantStyles = {
  light: {
    footer: "border-t border-[rgba(6,28,47,0.06)] bg-white",
    text: "text-[#8E99A2]",
    link: "transition hover:text-[#061C2F]",
    social: "text-[#8E99A2] transition hover:text-[#061C2F]",
  },
  dark: {
    footer: "border-t border-white/[0.06] bg-[#18181B]",
    text: "text-white/40",
    link: "transition hover:text-white/80",
    social: "text-white/40 transition hover:text-white/75",
  },
} as const;

type AppFooterProps = {
  variant?: keyof typeof variantStyles;
  containerClass?: string;
};

export function AppFooter({ variant = "light", containerClass }: AppFooterProps) {
  const styles = variantStyles[variant];
  const container = containerClass ?? LANDING_UPDATE_CONTAINER;

  return (
    <footer
      className={`app-site-footer mt-auto w-full shrink-0 px-4 py-2 md:px-6 ${styles.footer}`}
    >
      <div
        className={`${container} flex h-[68px] items-center justify-between gap-3 md:gap-4`}
      >
        <div
          className={`flex min-w-0 items-center gap-3 text-[13px] md:gap-7 md:text-[14px] ${styles.text}`}
        >
          <p className="shrink-0 font-normal sm:hidden">© 2026 Klynt</p>
          <p className="hidden shrink-0 font-normal sm:block">
            © 2026 Klynt – Landing improvement kit
          </p>
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href} className={`shrink-0 font-medium ${styles.link}`}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {socialLinks.map((link) => {
            const Icon = link.icon;

            return (
              <a
                key={link.label}
                href={link.href}
                className={`inline-flex h-10 w-10 items-center justify-center ${styles.social}`}
                aria-label={link.label}
              >
                <Icon size={20} aria-hidden />
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
