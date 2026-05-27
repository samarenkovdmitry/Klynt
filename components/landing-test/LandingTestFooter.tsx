import Link from "next/link";

import { DEMO_REPORT_PATH } from "@/lib/demo-report";
import { LANDING_UPDATE_CONTAINER } from "@/lib/landing-update-content";

const navLinks = [
  { href: "/landing-test", label: "Home" },
  { href: "/analyze", label: "Analyze" },
  { href: DEMO_REPORT_PATH, label: "View demo" },
];

const socialLinks = [
  { href: "https://linkedin.com", label: "LinkedIn" },
  { href: "https://reddit.com", label: "Reddit" },
  { href: "https://producthunt.com", label: "Product Hunt" },
  { href: "https://x.com", label: "X" },
];

export function LandingTestFooter() {
  return (
    <footer className="border-t border-[rgba(6,28,47,0.06)] bg-white px-5 py-10 md:px-6">
      <div className={LANDING_UPDATE_CONTAINER}>
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[1.2fr_0.8fr_1fr] md:gap-10">
          <Link href="/landing-test" aria-label="Klynt — home">
            <img src="/klynt-logo-dark.svg" alt="Klynt" className="h-[30px] w-auto" />
          </Link>

          <div className="space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-[15px] font-medium text-[#6B7280] transition hover:text-[#061C2F]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div>
            <p className="text-[14px] font-medium text-[#8E99A2]">Connect</p>
            <div className="mt-4 flex items-center gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(6,28,47,0.08)] text-[12px] font-semibold text-[#6B7280] transition hover:text-[#061C2F]"
                  aria-label={link.label}
                >
                  {link.label[0]}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-[rgba(6,28,47,0.06)] pt-6 text-[14px] text-[#8E99A2] md:mt-10 md:flex-row md:items-center md:justify-between md:gap-7">
          <p>© 2026 Klynt – UX Clarity Analyzer</p>
          <div className="flex flex-wrap items-center gap-5 md:gap-7">
            <Link href="/privacy" className="transition hover:text-[#061C2F]">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-[#061C2F]">
              Terms
            </Link>
            <Link href="/contact" className="transition hover:text-[#061C2F]">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
