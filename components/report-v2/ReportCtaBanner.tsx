"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RiArrowDownLine, RiArrowRightLine } from "@remixicon/react";
import { validateWebsiteUrl } from "@/lib/validate-website-url";

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function ReportCtaBanner() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Enter a URL to audit");
      return;
    }
    const validationError = validateWebsiteUrl(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    router.push(`/analyze?url=${encodeURIComponent(normalizeUrl(trimmed))}&autostart=1`);
  }

  return (
    <section className="overflow-hidden rounded-[20px] bg-v2-accent px-6 py-14 text-center md:px-12">
      {/* Eyebrow */}
      <div className="mb-6 flex items-center justify-center gap-2">
        <RiArrowDownLine size={13} className="text-[rgba(255,255,255,0.5)]" />
        <span className="font-mono text-[11px] tracking-[0.1em] text-[rgba(255,255,255,0.5)]">
          TRY IT NOW
        </span>
      </div>

      {/* Headline */}
      <h2 className="mx-auto mb-8 max-w-[520px] text-[32px] font-bold leading-[1.2] tracking-[-0.02em] text-white md:text-[36px]">
        Audit your landing page — free, in about a minute.
      </h2>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-[660px]">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-0">
          <input
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(""); }}
            placeholder="https://yoursite.com"
            className="h-[56px] flex-1 rounded-[12px] bg-white px-5 text-[16px] text-[#1B1A17] placeholder:text-[#B0ABA0] outline-none sm:rounded-r-none sm:rounded-l-[12px]"
          />
          <button
            type="submit"
            className="inline-flex h-[56px] shrink-0 items-center justify-center gap-2 rounded-[12px] bg-[#1B1A17] px-7 text-[16px] font-semibold text-white transition-opacity hover:opacity-90 sm:rounded-l-none sm:rounded-r-[12px]"
          >
            Analyse free
            <RiArrowRightLine size={18} />
          </button>
        </div>
        {error && (
          <p className="mt-2 text-[13px] text-[rgba(255,255,255,0.8)]">{error}</p>
        )}
      </form>

      {/* Micro copy */}
      <p className="font-mono mt-6 text-[11px] tracking-[0.08em] text-[rgba(255,255,255,0.45)]">
        FREE · NO SIGNUP · RESULTS IN ABOUT A MINUTE
      </p>
    </section>
  );
}
