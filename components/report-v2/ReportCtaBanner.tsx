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
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(""); }}
            placeholder="https://yoursite.com"
            className="min-h-[52px] w-full rounded-full bg-white px-6 text-[16px] text-[#1B1A17] placeholder:text-[#B0ABA0] outline-none sm:flex-1 sm:min-w-0"
          />
          <button
            type="submit"
            className="inline-flex min-h-[52px] w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#1B1A17] px-8 text-[17px] font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
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
