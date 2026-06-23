"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RiArrowRightLine, RiCheckLine, RiLink } from "@remixicon/react";

import { validateWebsiteUrl } from "@/lib/validate-website-url";
import { FindingCardStack } from "./FindingCardStack";

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
      <div className="flex flex-col justify-center px-6 py-12 md:px-[40px] lg:px-[88px] lg:py-[72px]">
        <div className="max-w-[560px]">
          <h1 className="mb-6 font-sans text-[36px] font-bold leading-[1.0] tracking-[-0.035em] text-v2-dark md:text-[46px] lg:text-[62px]">
            Visitors are leaving. Find out exactly why.
          </h1>
          <p className="mb-9 max-w-[40ch] text-[18px] leading-[1.5] text-v2-ink-secondary md:text-[20px]">
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

          <p className="mt-6 flex flex-wrap items-center gap-3 font-mono text-[12px] tracking-[.05em] text-v2-ink-muted">
            <span className="inline-flex items-center gap-[6px] text-lv2-green">
              <RiCheckLine size={15} aria-hidden />
              524 PAGES IMPROVED
            </span>
            <span className="text-lv2-border">·</span>
            <span>FREE</span>
            <span className="text-lv2-border">·</span>
            <span>NO SIGNUP REQUIRED</span>
          </p>
        </div>
      </div>

      {/* RIGHT — sky bg + cards */}
      <div
        className="relative flex min-h-[520px] items-center justify-center overflow-hidden bg-[url('/bg.png')] bg-cover bg-center px-[28px] py-[56px] md:px-[64px]"
      >
        <div className="relative w-full max-w-[440px]">
          <FindingCardStack />

          {/* Dark score card */}
          <div className="mt-1 rounded-[24px] border border-white/10 bg-[#1a1a1a] px-[32px] py-[22px] pb-[24px] text-white">
            <span className="mb-4 block font-mono text-[10.5px] tracking-[.1em] text-[#8A857C]">
              SCORE POTENTIAL
            </span>

            {/* Progress bar */}
            <div className="relative mb-[11px] h-[6px] rounded-full bg-[#34322C]">
              <div className="absolute left-0 top-0 h-full w-[65%] rounded-full bg-lv2-green-bright" />
              <span
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[1px]"
                style={{ left: "65%", width: 2, height: 12, background: "#fff" }}
              />
              <span
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-lv2-green-bright bg-transparent"
                style={{ left: "80%", width: 10, height: 10 }}
              />
            </div>

            {/* NOW / TARGET labels */}
            <div className="relative mb-5 h-4">
              <span className="absolute left-0 top-0 font-mono text-[11px] tracking-[.04em] text-[#9C968B]">
                NOW <span className="font-semibold text-white">6.5</span>
              </span>
              <span
                className="absolute top-0 -translate-x-1/2 font-mono text-[11px] tracking-[.04em] text-lv2-green"
                style={{ left: "80%" }}
              >
                TARGET <span className="font-semibold text-lv2-green-bright">8.0</span>
              </span>
            </div>

            <div className="mb-4 h-px bg-white/10" />

            <p className="mb-3 text-[13px] font-medium leading-[1.35] tracking-[-0.005em] text-white">
              Fix 3 gaps to close most of the distance
            </p>
            <p className="text-[13px] leading-[1.6] text-white">
              Raise contrast{" "}
              <span className="font-mono font-semibold text-lv2-green-bright">+0.6</span>
              <span className="text-white/35"> · </span>
              Add trial offer{" "}
              <span className="font-mono font-semibold text-lv2-green-bright">+0.5</span>
              <span className="text-white/35"> · </span>
              Place logos{" "}
              <span className="font-mono font-semibold text-lv2-green-bright">+0.4</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
