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

const defaultSocialLinks: {
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

export const ANALYZE_FOOTER_SOCIAL_LINKS = defaultSocialLinks.slice(0, 2);

const variantStyles = {
  light: {
    footer: "border-t border-[rgba(6,28,47,0.06)] bg-white",
    text: "text-[#8E99A2]",
    link: "transition hover:text-[#061C2F]",
    social: "text-[#8E99A2] transition hover:text-[#061C2F]",
  },
  dark: {
    footer: "border-t border-white/[0.08] bg-[#0E0E0C]",
    text: "text-[#7A7A74]",
    link: "transition hover:text-[#9A9A93]",
    social: "text-[#7A7A74] transition hover:text-[#9A9A93]",
  },
} as const;

type AppFooterProps = {
  variant?: keyof typeof variantStyles;
  containerClass?: string;
  tagline?: string;
  socialLinks?: typeof defaultSocialLinks;
};

export function AppFooter({
  variant = "light",
  containerClass,
  tagline = "Landing improvement kit",
  socialLinks = defaultSocialLinks,
}: AppFooterProps) {
  const styles = variantStyles[variant];
  const container = containerClass ?? LANDING_UPDATE_CONTAINER;

  return (
    <footer
      className={`app-site-footer mt-auto w-full shrink-0 px-6 py-[33px] md:py-10 ${styles.footer}`}
    >
      <div className={container}>
        <div className="flex flex-col items-center text-center md:hidden">
          <p className={`text-[14px] font-normal ${styles.text}`}>
            © 2026 Klynt — {tagline}
          </p>

          <div
            className={`mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px] font-medium ${styles.text}`}
          >
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className={styles.link}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center gap-4">
            {socialLinks.map((link) => {
              const Icon = link.icon;

              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`inline-flex h-9 w-9 items-center justify-center ${styles.social}`}
                  aria-label={link.label}
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
        </div>

        <div className="hidden items-center justify-between md:flex">
          <div
            className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] ${styles.text}`}
          >
            <p className="font-normal">© 2026 Klynt — {tagline}</p>
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`font-medium ${styles.link}`}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {socialLinks.map((link) => {
              const Icon = link.icon;

              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`inline-flex h-9 w-9 items-center justify-center ${styles.social}`}
                  aria-label={link.label}
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
