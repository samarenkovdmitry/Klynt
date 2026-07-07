"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RiArrowDownLine, RiArrowRightLine } from "@remixicon/react";

import { validateWebsiteUrl } from "@/lib/validate-website-url";

function normalizeUrl(input: string): string {
  const t = input.trim();
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

export function V2FinalCta() {
  const router = useRouter();
  const [url, setUrl] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = url.trim();
    if (!t) return;
    if (validateWebsiteUrl(t)) return;
    router.push(`/analyze?url=${encodeURIComponent(normalizeUrl(t))}&autostart=1`);
  }

  return (
    <section className="bg-v2-accent px-6 py-[96px] text-center text-white md:px-[72px] md:py-[104px]">
      <div className="mx-auto max-w-[680px]">
        <span className="mb-[18px] inline-flex items-center gap-2 font-mono text-[11.5px] tracking-[.1em] text-white/72">
          <RiArrowDownLine size={14} aria-hidden />
          TRY IT NOW
        </span>
        <h2 className="mx-auto mb-7 max-w-[20ch] text-[34px] font-bold leading-[1.04] tracking-[-0.03em] md:text-[46px]">
          See what your visitors are missing.
        </h2>

        <form
          className="mx-auto flex max-w-[480px] flex-col gap-3 sm:flex-row"
          onSubmit={handleSubmit}
          noValidate
        >
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yoursite.com"
            className="min-h-[52px] h-[56px] flex-1 min-w-0 rounded-[13px] border border-white bg-white px-[18px] font-sans text-[16px] text-v2-dark outline-none placeholder:text-[#A8A294]"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button
            type="submit"
            className="flex min-h-[52px] h-[56px] shrink-0 items-center justify-center gap-[9px] rounded-[13px] border-none bg-v2-dark px-[26px] font-sans text-[16px] font-semibold text-white transition-transform hover:-translate-y-px sm:w-auto w-full"
          >
            Analyse free
            <RiArrowRightLine size={18} aria-hidden />
          </button>
        </form>

        <p className="mt-5 font-mono text-[11.5px] tracking-[.05em] text-white/65">
          FREE · NO SIGNUP · RESULTS IN ABOUT A MINUTE
        </p>
      </div>
    </section>
  );
}
