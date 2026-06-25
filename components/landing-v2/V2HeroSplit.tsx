"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RiArrowRightLine, RiCheckLine, RiLink } from "@remixicon/react";

import { validateWebsiteUrl } from "@/lib/validate-website-url";
import { RotatingFindingCard } from "@/components/landing/HeroFindingCard";

function normalizeUrl(input: string): string {
  const t = input.trim();
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

export function V2HeroSplit() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) { setError("Enter a URL to audit — e.g. notion.so"); return; }
    const err = validateWebsiteUrl(trimmed);
    if (err) { setError(err); return; }
    setError(null);
    router.push(`/analyze?url=${encodeURIComponent(normalizeUrl(trimmed))}&autostart=1`);
  }

  return (
    <div className="grid min-h-[calc(100vh-65px)] grid-cols-1 lg:grid-cols-2">
      {/* LEFT — copy */}
      <div className="flex flex-col justify-center px-6 py-12 md:px-[40px] lg:pl-[max(24px,calc((100vw_-_1180px)_/_2))] lg:pr-10 lg:py-[72px]">
        <div className="max-w-[560px]">
          <h1 className="mb-6 font-sans text-[36px] font-bold leading-[1.0] tracking-[-0.035em] text-v2-dark md:text-[46px] lg:text-[54px]">
            Visitors are leaving.{" "}
            <br />
            Find out exactly why.
          </h1>
          <p className="mb-9 max-w-[40ch] text-[18px] leading-[1.5] text-v2-ink-secondary">
            Paste your URL. Get exactly what to fix, and how.
          </p>

          <form className="flex max-w-[520px] flex-col gap-3 sm:flex-row" onSubmit={handleSubmit} noValidate>
            <label className="flex h-[60px] flex-1 min-w-0 cursor-text items-center gap-[11px] rounded-[13px] border border-[1.5px] border-lv2-border bg-lv2-card px-[18px] transition-colors focus-within:border-v2-dark">
              <RiLink size={19} className="shrink-0 text-[#A8A294]" aria-hidden />
              <input
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); if (error) setError(null); }}
                placeholder="https://yoursite.com"
                className="flex-1 min-w-0 bg-transparent font-sans text-[16px] text-v2-dark outline-none placeholder:text-[#A8A294]"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Website URL to audit"
              />
            </label>
            <button
              type="submit"
              className="flex h-[60px] shrink-0 items-center gap-[10px] rounded-[13px] bg-v2-dark px-[28px] font-sans text-[17px] font-semibold text-white transition-colors hover:bg-v2-dark-alt sm:w-auto w-full justify-center"
            >
              Analyse free
              <RiArrowRightLine size={19} aria-hidden />
            </button>
          </form>

          {error && (
            <p className="mt-2 text-[13px] text-red-600/80">{error}</p>
          )}

          <p className="mt-6 flex flex-wrap items-center gap-1 font-mono text-[12px] tracking-[.05em] text-v2-ink-muted">
            <span className="inline-flex items-center gap-[6px] text-lv2-green">
              <RiCheckLine size={15} aria-hidden />
              524 PAGES IMPROVED
            </span>
            <span className="text-v2-ink-secondary">·</span>
            <span>FREE</span>
            <span className="text-v2-ink-secondary">·</span>
            <span>NO SIGNUP REQUIRED</span>
          </p>
        </div>
      </div>

      {/* RIGHT — sky bg + rotating finding card */}
      <div className="relative flex min-h-[520px] items-center justify-center overflow-hidden px-[28px] py-[56px] md:px-[64px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/bg.png"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="relative z-10 w-full max-w-[460px]">
          <RotatingFindingCard />
        </div>
      </div>
    </div>
  );
}
