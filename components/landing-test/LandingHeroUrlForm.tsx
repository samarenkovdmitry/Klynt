"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useCallback } from "react";

type LandingHeroUrlFormProps = {
  inputId?: string;
  className?: string;
  maxWidthClass?: string;
};

export function LandingHeroUrlForm({
  inputId = "landing-hero-url",
  className = "",
  maxWidthClass = "max-w-[480px]",
}: LandingHeroUrlFormProps) {
  const router = useRouter();

  const goAnalyze = useCallback(
    (rawUrl?: string) => {
      const url = rawUrl?.trim();
      router.push(url ? `/analyze?url=${encodeURIComponent(url)}` : "/analyze");
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
      onSubmit={handleSubmit}
      className={[
        "flex overflow-hidden rounded-xl border border-white/[0.14] bg-[#1C1C19] transition-[border-color,box-shadow] focus-within:border-[#1D9E75]/50 focus-within:shadow-[0_0_0_3px_rgba(29,158,117,0.08)]",
        maxWidthClass,
        className,
      ].join(" ")}
    >
      <input
        id={inputId}
        name="url"
        type="url"
        inputMode="url"
        placeholder="https://yoursite.com"
        className="min-w-0 flex-1 bg-transparent px-4 py-[13px] text-[14px] text-[#F2F2EF] outline-none placeholder:text-[#7A7A74]"
      />
      <button
        type="submit"
        className="m-[5px] shrink-0 rounded-lg bg-[#F2F2EF] px-5 py-2.5 font-sans text-[14px] font-semibold tracking-[-0.02em] text-[#0E0E0C] transition-opacity hover:opacity-88"
      >
        Analyze
      </button>
    </form>
  );
}
