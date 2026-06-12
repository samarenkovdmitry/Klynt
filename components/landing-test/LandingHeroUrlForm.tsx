"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useState } from "react";
import { buildAnalyzeUrl } from "@/lib/analyze-route";
import { RiArrowRightLine } from "@remixicon/react";
import { LANDING_DARK_INPUT_FOCUS } from "./landingPageStyles";

type LandingHeroUrlFormProps = {
  inputId?: string;
  className?: string;
  maxWidthClass?: string;
};

export function LandingHeroUrlForm({
  inputId = "landing-hero-url",
  className = "",
  maxWidthClass = "max-w-[400px]",
}: LandingHeroUrlFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goAnalyze = useCallback(
    (rawUrl?: string) => {
      const url = rawUrl?.trim();
      setIsSubmitting(true);
      router.push(buildAnalyzeUrl({ url, autostart: Boolean(url) }));
    },
    [router]
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.namedItem("url") as HTMLInputElement | null;
    goAnalyze(input?.value);
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className={[
        "flex overflow-hidden rounded-xl border border-white/[0.14] bg-[#1C1C19] transition-[border-color,box-shadow]",
        LANDING_DARK_INPUT_FOCUS,
        maxWidthClass,
        className,
      ].join(" ")}
    >
      <input
        id={inputId}
        name="url"
        type="text"
        inputMode="url"
        autoComplete="url"
        spellCheck={false}
        placeholder="https://yoursite.com"
        disabled={isSubmitting}
        className="min-w-0 flex-1 bg-transparent px-4 py-[13px] text-[14px] text-[#F2F2EF] outline-none placeholder:text-[#7A7A74] disabled:opacity-70"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="m-[5px] inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#F2F2EF] px-5 py-2.5 font-sans text-[14px] font-semibold tracking-[-0.02em] text-[#0E0E0C] transition-opacity hover:opacity-88 disabled:cursor-wait disabled:opacity-70"
      >
        {isSubmitting ? "Analyzing…" : "Analyze"}
        {!isSubmitting ? <RiArrowRightLine size={16} aria-hidden /> : null}
      </button>
    </form>
  );
}
