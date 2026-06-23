"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RiLink } from "@remixicon/react";

import { DEMO_REPORT_PATH } from "@/lib/demo-report";
import { validateWebsiteUrl } from "@/lib/validate-website-url";

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

export function Hero() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

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
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="Klynt — home">
            <Image
              src="/klynt-logo-dark.svg"
              alt="Klynt"
              width={92}
              height={28}
              priority
            />
            <span className="hidden font-mono text-[10px] uppercase tracking-widest text-[#1A1814]/40 lg:inline">
              Landing Improvement Kit
            </span>
          </Link>

          <ul className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-mono text-[11px] uppercase tracking-widest text-[#1A1814]/50 transition-colors hover:text-[#1A1814]"
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

      {/* ── RIGHT: image panel with floating cards ── */}
      <div
        className="relative hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center"
        style={{
          backgroundImage: "url('/bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#2C3E50",
        }}
      >
        {/* Subtle darkening overlay for card contrast */}
        <div className="absolute inset-0 bg-black/15" />

        {/* Cards container */}
        <div className="relative z-10 flex w-full max-w-[400px] flex-col gap-0 px-8">
          {/* White card — live finding */}
          <div className="rounded-2xl border border-[#E3E0D6] bg-white/97 p-5 shadow-2xl">
            {/* Card header row */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#57554C]">
                  Live Finding
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#B4AFA4]">
                85 Signals Scanned
              </span>
            </div>

            {/* Issue badge */}
            <div className="mb-4 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-amber-700">
              Issue · Contrast
            </div>

            {/* Big metric */}
            <div className="mb-1 leading-none">
              <span className="font-sans text-[56px] font-bold tracking-tight text-[#1A1814]">
                2.8
              </span>
              <span className="font-sans text-[56px] font-bold tracking-tight text-[#1A1814]/30">
                :1
              </span>
            </div>

            <p className="font-mono text-[10px] uppercase tracking-widest text-[#9CA3AF]">
              contrast ratio · fails WCAG AA
            </p>

            {/* Color fix row */}
            <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-[#F8F7F4] px-3 py-2">
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-sm"
                style={{ backgroundColor: "#9CA3AF" }}
              />
              <span className="font-mono text-[11px] text-[#6B7280]">
                #9CA3AF on white
              </span>
              <span className="font-mono text-[11px] text-[#C3BCAD]">→</span>
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-sm"
                style={{ backgroundColor: "#4B5563" }}
              />
              <span className="font-mono text-[11px] text-[#4B5563]">
                #4B5563
              </span>
              <span className="font-mono text-[11px] font-medium text-[#22C55E]">
                · passes AA
              </span>
            </div>

            {/* Footer */}
            <div className="mt-3 border-t border-[#EDE9E2] pt-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#B4AFA4]">
                + 23 more findings
              </span>
            </div>
          </div>

          {/* Dark card — score potential (overlaps bottom of white card) */}
          <div className="-mt-3 ml-4 rounded-2xl bg-[#1C1A16] p-5 shadow-2xl">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-white/40">
              Score Potential
            </p>

            {/* Progress bar with labels */}
            <div className="mb-2 flex items-center gap-3">
              <span className="w-8 font-mono text-[13px] font-semibold text-white">
                6.5
              </span>
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                {/* Filled portion: 6.5/10 = 65% */}
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-[#22C55E]"
                  style={{ width: "65%" }}
                />
              </div>
              {/* Target marker at 80% */}
              <div className="relative flex flex-col items-center">
                <span className="font-mono text-[13px] font-semibold text-white/50">
                  8.0
                </span>
              </div>
            </div>

            <div className="mb-1 flex items-center justify-between px-0.5">
              <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">
                Now
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">
                Target
              </span>
            </div>

            <p className="mt-3 font-mono text-[11px] text-white/40">
              Fix 3 gaps to close most of the distance:
            </p>

            <div className="mt-2 space-y-1.5">
              {[
                { label: "Reduce contrast", delta: "+0.6" },
                { label: "Add trial offer", delta: "+0.5" },
                { label: "Place logos", delta: "+0.4" },
              ].map((fix) => (
                <div key={fix.label} className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-white/55">
                    {fix.label}
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-[#22C55E]">
                    {fix.delta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
