import Link from "next/link";
import Image from "next/image";

const PRODUCT_LINKS = [
  { href: "/landing-copy", label: "Hero copy" },
  { href: "/", label: "UX audit" },
  { href: "/report/demo", label: "Sample report" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
];

const variantStyles = {
  light: {
    footer: "bg-white border-t border-[rgba(6,28,47,0.06)]",
    tagline: "text-[#8E99A2]",
    colHead: "text-[#B0BAC3]",
    link: "text-[#4A5568] hover:text-[#061C2F]",
    divider: "border-[rgba(6,28,47,0.08)]",
    copyright: "text-[#B0BAC3]",
    logo: "/klynt-logo-dark.svg",
  },
  dark: {
    footer: "bg-[#1B1A17]",
    tagline: "text-[rgba(245,242,234,0.45)]",
    colHead: "text-[rgba(245,242,234,0.3)]",
    link: "text-[rgba(245,242,234,0.7)] hover:text-[#F5F2EA]",
    divider: "border-[rgba(245,242,234,0.08)]",
    copyright: "text-[rgba(245,242,234,0.3)]",
    logo: "/klynt-logo-light.svg",
  },
} as const;

type AppFooterProps = {
  variant?: keyof typeof variantStyles;
  containerClass?: string;
};

export function AppFooter({ variant = "light", containerClass }: AppFooterProps) {
  const s = variantStyles[variant];
  const maxW = containerClass ?? "mx-auto max-w-[1080px]";

  return (
    <footer className={`app-site-footer mt-auto w-full shrink-0 ${s.footer}`}>
      {/* Main section */}
      <div className={`${maxW} px-6 pb-10 pt-12`}>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_160px_160px]">
          {/* Brand */}
          <div>
            <Image
              src={s.logo}
              alt="Klynt"
              width={88}
              height={24}
              className="mb-4"
            />
            <p className={`max-w-[260px] text-[14px] leading-[1.6] ${s.tagline}`}>
              Turn any landing page into a prioritised list of copy, UX and trust fixes.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className={`font-mono mb-4 text-[11px] tracking-[0.09em] ${s.colHead}`}>PRODUCT</p>
            <ul className="flex flex-col gap-3">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={`text-[15px] transition-colors ${s.link}`}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className={`font-mono mb-4 text-[11px] tracking-[0.09em] ${s.colHead}`}>COMPANY</p>
            <ul className="flex flex-col gap-3">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={`text-[15px] transition-colors ${s.link}`}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className={`border-t ${s.divider}`}>
        <div className={`${maxW} px-6 py-5`}>
          <p className={`font-mono text-[11px] tracking-[0.08em] ${s.copyright}`}>
            © 2026 KLYNT · ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </footer>
  );
}
