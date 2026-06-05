"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  RiAlignLeft,
  RiArrowRightLine,
  RiCloseLine,
  RiCursorLine,
  RiLock2Line,
  RiTextSpacing,
} from "@remixicon/react";

import { CopyOptimizerAtmosphere } from "@/components/landing-copy/CopyOptimizerAtmosphere";
import { CopyOptimizerFieldCard } from "@/components/landing-copy/CopyOptimizerFieldCard";
import { CopyOptimizerHeader } from "@/components/landing-copy/CopyOptimizerHeader";
import { LANDING_DARK, LANDING_CONTAINER } from "@/components/landing-test/landingPageStyles";
import { Button } from "@/components/ui/Button";
import { inputFieldClass } from "@/components/ui/inputClasses";
import { useCopyOptimizer } from "@/hooks/useCopyOptimizer";
import type { CopyOptimizerLayer } from "@/lib/copy-optimize";
import { formatReportDomain } from "@/lib/report-hero-theme";

const RESULT_LAYERS: CopyOptimizerLayer[] = ["headline", "subheadline", "cta"];

const OUTCOMES = [
  {
    label: "Headline",
    icon: RiTextSpacing,
    iconWrap: "bg-teal-400/15 border-teal-300/25 text-teal-200",
  },
  {
    label: "Subheadline",
    icon: RiAlignLeft,
    iconWrap: "bg-white/8 border-white/12 text-white/75",
  },
  {
    label: "CTA",
    icon: RiCursorLine,
    iconWrap: "bg-amber-400/15 border-amber-300/25 text-amber-200",
  },
] as const;

export function CopyOptimizerPageView() {
  const resultsRef = useRef<HTMLDivElement>(null);

  const {
    url,
    setUrl,
    clearUrl,
    loading,
    progress,
    error,
    result,
    showUrlError,
    urlValidationError,
    isButtonDisabled,
    loadingLabel,
    optimize,
    handleUrlKeyDown,
    resetToInput,
  } = useCopyOptimizer();

  const hasResult = Boolean(result);
  const displayUrl = result?.url || url.trim();

  const fullAuditHref = displayUrl
    ? `/analyze?url=${encodeURIComponent(displayUrl)}`
    : "/analyze";

  useEffect(() => {
    if (!result || !resultsRef.current) return;

    window.requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [result]);

  return (
    <main
      className="relative min-h-dvh overflow-hidden text-white"
      style={{ backgroundColor: LANDING_DARK }}
    >
      <CopyOptimizerAtmosphere />

      <div className="relative z-[1]">
        <CopyOptimizerHeader />

        <div className={`${LANDING_CONTAINER} px-4 pb-10 pt-4 md:px-6 md:pb-14 md:pt-6`}>
          <div className="mx-auto max-w-[720px]">
            <header className="text-center">
              <h1 className="text-[30px] font-bold leading-[1.08] tracking-[-0.02em] text-white md:text-[40px]">
                Free Landing Page Copy Optimizer
              </h1>
              <p className="mx-auto mt-3 max-w-[560px] text-[15px] leading-[24px] text-white/65 md:text-[16px] md:leading-[26px]">
                Paste a URL. Klynt rewrites your hero headline, subheadline, and primary CTA for
                clarity — using only what&apos;s visible above the fold.
              </p>
            </header>

            <ul className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              {OUTCOMES.map(({ label, icon: Icon, iconWrap }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 sm:min-w-[190px]"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${iconWrap}`}
                    aria-hidden
                  >
                    <Icon size={18} />
                  </span>
                  <span className="text-[14px] font-medium text-white/85">{label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-[32px] border border-[rgba(6,28,47,0.06)] bg-white p-5 text-[var(--ink-primary)] shadow-[0_24px_80px_rgba(0,0,0,0.28)] md:p-8">
              {hasResult && !loading ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8E99A2]">
                      Analyzed URL
                    </p>
                    <p className="mt-1 truncate text-[15px] font-medium text-[var(--ink-primary)]">
                      {formatReportDomain(displayUrl) || displayUrl}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetToInput}
                    className="shrink-0 text-[14px] font-medium text-[#2563EB] transition hover:text-[#1D4ED8]"
                  >
                    Analyze another URL
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <input
                      type="text"
                      value={url}
                      onChange={(event) => setUrl(event.target.value)}
                      onKeyDown={handleUrlKeyDown}
                      placeholder="https://stripe.com"
                      disabled={loading}
                      aria-label="Landing page URL"
                      aria-invalid={showUrlError ? true : undefined}
                      aria-describedby={showUrlError ? "copy-url-error" : undefined}
                      className={`${inputFieldClass({
                        disabled: loading,
                        error: showUrlError,
                        withClearButton: url.length > 0,
                        withMargin: false,
                      })} h-[52px] bg-white md:h-[54px]`}
                    />

                    {url.length > 0 && !loading && (
                      <button
                        type="button"
                        onClick={clearUrl}
                        aria-label="Clear URL"
                        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#8E99A2] transition hover:bg-[#EBEFF3] hover:text-[var(--ink-primary)]"
                      >
                        <RiCloseLine size={18} aria-hidden />
                      </button>
                    )}
                  </div>

                  {showUrlError && urlValidationError && (
                    <p id="copy-url-error" role="alert" className="mt-2 text-[13px] text-[#D14343]">
                      {urlValidationError}
                    </p>
                  )}

                  <p className="mt-3 text-[13px] leading-5 text-[#8E99A2]">
                    We capture the hero section and suggest clearer copy you can paste into your
                    page.
                  </p>
                </>
              )}

              {error && (
                <div
                  className="mt-4 rounded-[16px] border border-[#FFD9D6] bg-[#FFF4F3] px-4 py-3.5"
                  role="alert"
                >
                  <p className="text-[15px] font-medium text-[#D14343]">{error}</p>
                </div>
              )}

              {!hasResult && (
                <div className="mt-5 border-t border-[rgba(6,28,47,0.06)] pt-5">
                  {loading ? (
                    <div className="pt-1">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--ink-primary)]">
                            Optimizing hero copy
                          </p>
                          <p className="mt-0.5 text-[14px] text-[rgba(6,28,47,0.5)]">
                            {loadingLabel}
                          </p>
                        </div>
                        <span className="rounded-full border border-[rgba(6,28,47,0.10)] bg-white px-3 py-1.5 text-[13px] font-semibold tabular-nums text-[#2563EB]">
                          {Math.floor(progress)}%
                        </span>
                      </div>
                      <div className="mt-4 h-[6px] overflow-hidden rounded-full bg-[#E5E7EB]">
                        <div
                          className="h-full rounded-full bg-[#2563EB] transition-all duration-500 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      disabled={isButtonDisabled}
                      onClick={() => void optimize()}
                      icon={<RiArrowRightLine size={18} aria-hidden />}
                      className="!rounded-full"
                    >
                      Optimize copy
                    </Button>
                  )}
                </div>
              )}

              {hasResult && !loading && (
                <div className="mt-5 border-t border-[rgba(6,28,47,0.06)] pt-5">
                  <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[var(--ink-primary)] md:text-[20px]">
                    Your optimized hero copy
                  </h2>
                  <p className="mt-1.5 text-[14px] leading-[22px] text-[rgba(6,28,47,0.5)] md:text-[15px]">
                    Copy the improved lines below — paste them straight into your page.
                  </p>
                </div>
              )}
            </div>

            {result && (
              <div ref={resultsRef} className="mt-8 scroll-mt-28 space-y-4">
                {RESULT_LAYERS.map((layer) => (
                  <CopyOptimizerFieldCard key={layer} layer={layer} field={result.fields[layer]} />
                ))}

                <div className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-6 text-center backdrop-blur-sm md:px-8">
                  <p className="text-[15px] leading-[23px] text-white/70">
                    Want UX score, prioritized fixes, and a shareable PDF?
                  </p>
                  <div className="mt-4 flex justify-center">
                    <Button
                      href={fullAuditHref}
                      variant="primary"
                      tone="dark"
                      icon={<RiArrowRightLine size={18} aria-hidden />}
                      className="!rounded-full md:!w-auto"
                      fullWidth={false}
                    >
                      Run full UX audit
                    </Button>
                  </div>
                  <button
                    type="button"
                    onClick={resetToInput}
                    className="mt-4 text-[13px] font-medium text-white/45 transition hover:text-white/70"
                  >
                    Try another URL
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col items-center gap-3 text-center">
              <p className="flex items-center justify-center gap-2 text-[13px] leading-5 text-white/45">
                <RiLock2Line size={15} className="shrink-0" aria-hidden />
                <span>Processed securely — hero copy only, never shared</span>
              </p>
              <Link
                href={fullAuditHref}
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2.5 text-[14px] font-medium text-white/85 transition hover:border-white/20 hover:bg-white/10"
              >
                Full UX audit
                <RiArrowRightLine size={16} className="text-white/55" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
