"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RiLink } from "@remixicon/react";
import { HeroFindingCard } from "@/components/landing/HeroFindingCard";

import { DEMO_REPORT_PATH } from "@/lib/demo-report";
import { validateWebsiteUrl } from "@/lib/validate-website-url";

const HERO_CARDS = [
  { format: "A" as const, badge: "CONTRAST",         domain: "linear.app", subtitle: "hero subhead" },
  { format: "B" as const, badge: "CTA COPY",          domain: "notion.com" },
  { format: "C" as const, badge: "TRUST",             domain: "vercel.com" },
  { format: "D" as const, badge: "AUDIENCE UNCLEAR",  domain: "folk.app" },
];

const NAV_LINKS = [
  { href: "/landing-copy", label: "Hero copy" },
  { href: "/analyze", label: "UX audit" },
  { href: DEMO_REPORT_PATH, label: "Sample report" },
  { href: "/contact", label: "Contact" },
];

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function renderActiveCard(idx: number) {
  const dotProps = { dotIndex: idx, dotCount: HERO_CARDS.length };
  switch (idx) {
    case 0: return <HeroFindingCard format="A" badge="CONTRAST" domain="linear.app" subtitle="hero subhead" {...dotProps} />;
    case 1: return <HeroFindingCard format="B" badge="CTA COPY" domain="notion.com" {...dotProps} />;
    case 2: return <HeroFindingCard format="C" badge="TRUST" domain="vercel.com" {...dotProps} />;
    case 3: return <HeroFindingCard format="D" badge="AUDIENCE UNCLEAR" domain="folk.app" {...dotProps} />;
    default: return null;
  }
}

export function Hero() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setActiveCard((i) => (i + 1) % HERO_CARDS.length),
      4000,
    );
    return () => clearInterval(id);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Enter a URL to audit — e.g. notion.so");
      return;
    }
    const validationError = validateWebsiteUrl(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    router.push(`/analyze?url=${encodeURIComponent(normalizeUrl(trimmed))}&autostart=1`);
  }

  return (
    <section className="flex min-h-screen">
      {/* ── LEFT: cream panel ── */}
      <div className="flex w-full flex-col bg-[#F0EDE6] px-10 py-8 lg:w-1/2 lg:px-14 xl:px-20">
        {/* Nav */}
        <nav className="flex items-center justify-between gap-6">
          <div className="flex shrink-0 items-center gap-3">
            <Link href="/" aria-label="Klynt — home">
              <Image
                src="/klynt-logo-dark.svg"
                alt="Klynt"
                width={92}
                height={28}
                priority
              />
            </Link>
            <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-widest text-[#1A1814]/35">
              Landing Improvement Kit
            </span>
          </div>

          <ul className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="whitespace-nowrap font-mono text-[11px] uppercase tracking-widest text-[#1A1814]/50 transition-colors hover:text-[#1A1814]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Hero copy */}
        <div className="mt-auto flex flex-col justify-center py-16 lg:py-0 lg:pb-16 lg:pt-24">
          <h1 className="font-sans text-[46px] font-bold leading-[1.07] tracking-[-0.025em] text-[#1A1814] md:text-[54px] lg:text-[58px]">
            Visitors are leaving.
            <br />
            Find out exactly why.
          </h1>

          <p className="mt-5 text-[17px] leading-[26px] text-[#1A1814]/55">
            Paste your URL. Get exactly what to fix, and how.
          </p>

          {/* URL form */}
          <form onSubmit={handleSubmit} noValidate className="mt-7 max-w-[480px]">
            <div className="flex items-stretch gap-2.5">
              <div className="relative flex flex-1 items-center rounded-2xl border border-[#1A1814]/12 bg-white/80 px-4 transition-colors focus-within:border-[#1A1814]/35 hover:border-[#1A1814]/20">
                <RiLink
                  size={16}
                  className="mr-2.5 shrink-0 text-[#1A1814]/25"
                  aria-hidden
                />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="https://yoursite.com"
                  className="h-[52px] flex-1 bg-transparent text-[15px] text-[#1A1814] outline-none placeholder:text-[#1A1814]/30"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  aria-label="Website URL to audit"
                />
              </div>
              <button
                type="submit"
                className="h-[52px] shrink-0 rounded-full bg-[#1A1814] px-6 text-[15px] font-semibold text-white transition-opacity hover:opacity-80"
              >
                Analyse free →
              </button>
            </div>

            {error && (
              <p className="mt-2 text-[13px] text-red-600/80">{error}</p>
            )}
          </form>

          {/* Trust bar */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[14px] text-[#22C55E]">✓</span>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#1A1814]/45">
              524 pages improved · Free · No signup required
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT: rotating finding card ── */}
      <div className="relative hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/bg.png"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <style>{`
          @keyframes heroCardIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div className="relative z-10 w-full max-w-[460px] px-8">
          <div key={activeCard} style={{ animation: "heroCardIn 0.35s ease-out both" }}>
            {renderActiveCard(activeCard)}
          </div>
        </div>
      </div>
    </section>
  );
}
