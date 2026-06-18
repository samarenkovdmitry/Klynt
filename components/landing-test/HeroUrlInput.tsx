"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RiInformationLine, RiLink } from "@remixicon/react";

import { validateWebsiteUrl } from "@/lib/validate-website-url";

const PLACEHOLDERS = ["folk.app", "notion.so", "linear.app"];
const FADE_MS = 300;
const HOLD_MS = 2500;

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function HeroUrlInput() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cycle = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
        setPlaceholderVisible(true);
      }, FADE_MS);
    }, HOLD_MS + FADE_MS);

    return () => clearInterval(cycle);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = value.trim();
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
    router.push(
      `/analyze?url=${encodeURIComponent(normalizeUrl(trimmed))}&autostart=1`
    );
  }

  const showPlaceholder = !value && !isFocused;

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full text-left">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-2.5">
        {/* Input */}
        <div
          className={[
            "relative flex min-w-0 flex-1 items-center rounded-2xl border transition-colors duration-200",
            isFocused
              ? "border-white/70 bg-white/10"
              : "border-white/[0.18] bg-white/[0.06] hover:border-white/35",
          ].join(" ")}
        >
          <RiLink
            size={18}
            className="ml-4 mr-2.5 shrink-0 text-white/40"
            aria-hidden
          />

          {/* Animated placeholder overlay */}
          <span
            className={[
              "pointer-events-none absolute left-[46px] right-4 select-none overflow-hidden text-ellipsis whitespace-nowrap text-[15px] text-white/35 transition-opacity duration-300",
              showPlaceholder && placeholderVisible ? "opacity-100" : "opacity-0",
            ].join(" ")}
            aria-hidden
          >
            {PLACEHOLDERS[placeholderIndex]}
          </span>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="h-[52px] min-w-0 flex-1 bg-transparent pr-4 text-[16px] text-white outline-none"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Website URL to audit"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="h-[52px] shrink-0 rounded-full bg-white px-6 text-[15px] font-semibold text-[#18181B] transition-opacity hover:opacity-90"
        >
          Start free audit
        </button>
      </div>

      {/* Validation error */}
      {error && (
        <div className="mt-3 flex items-center gap-1.5 text-[13px] text-white/55">
          <RiInformationLine size={14} className="shrink-0 text-white/40" aria-hidden />
          {error}
        </div>
      )}
    </form>
  );
}
