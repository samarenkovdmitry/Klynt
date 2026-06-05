"use client";

import Link from "next/link";
import { RiArrowRightLine, RiCloseLine, RiSparkling2Line } from "@remixicon/react";

import { AppHeader } from "@/components/AppHeader";
import { CopyOptimizerFieldCard } from "@/components/landing-copy/CopyOptimizerFieldCard";
import { Button } from "@/components/ui/Button";
import { inputFieldClass } from "@/components/ui/inputClasses";
import { useCopyOptimizer } from "@/hooks/useCopyOptimizer";
import type { CopyOptimizerLayer } from "@/lib/copy-optimize";

const RESULT_LAYERS: CopyOptimizerLayer[] = ["headline", "subheadline", "cta"];

const OUTCOMES = ["Headline", "Subheadline", "CTA"] as const;

export function CopyOptimizerPageView() {
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
  } = useCopyOptimizer();

  const fullAuditHref = result?.url
    ? `/analyze?url=${encodeURIComponent(result.url)}`
    : url.trim()
      ? `/analyze?url=${encodeURIComponent(url.trim())}`
      : "/analyze";

  return (
    <>
      <AppHeader />

      <main className="min-h-[calc(100dvh-68px)] bg-white px-4 pb-12 pt-6 text-[var(--ink-primary)] md:px-6 md:pt-10">
        <div className="mx-auto max-w-[720px]">
          <header className="text-center">
            <h1 className="text-[30px] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--ink-primary)] md:text-[38px] md:leading-[1.05]">
              Free Landing Page Copy Optimizer
            </h1>
            <p className="mx-auto mt-3 max-w-[560px] text-[15px] leading-[24px] text-[rgba(6,28,47,0.5)] md:text-[16px] md:leading-[25px]">
              Paste a URL. Klynt rewrites your hero headline, subheadline, and primary CTA for
              clarity — using only what&apos;s visible above the fold.
            </p>
          </header>

          <ul className="mt-6 flex flex-row flex-wrap justify-center gap-x-5 gap-y-2 sm:gap-x-6">
            {OUTCOMES.map((label) => (
              <li key={label} className="flex items-center gap-2 text-[14px] text-[#8E99A2]">
                <RiSparkling2Line size={16} className="shrink-0" aria-hidden />
                {label}
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-[32px] border border-[rgba(6,28,47,0.06)] bg-[#FAFBFC] p-5 md:p-8">
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
              We capture the hero section and suggest clearer copy you can paste into your page.
            </p>

            {error && (
              <div
                className="mt-4 rounded-[16px] border border-[#FFD9D6] bg-[#FFF4F3] px-4 py-3.5"
                role="alert"
              >
                <p className="text-[15px] font-medium text-[#D14343]">{error}</p>
              </div>
            )}

            <div className="mt-5 border-t border-[rgba(6,28,47,0.06)] pt-5">
              {loading ? (
                <div className="pt-1">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--ink-primary)]">
                        Optimizing hero copy
                      </p>
                      <p className="mt-0.5 text-[14px] text-[rgba(6,28,47,0.5)]">{loadingLabel}</p>
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
          </div>

          {result && (
            <div className="mt-8 space-y-4">
              {RESULT_LAYERS.map((layer) => (
                <CopyOptimizerFieldCard key={layer} layer={layer} field={result.fields[layer]} />
              ))}

              <div className="rounded-[24px] border border-[rgba(6,28,47,0.06)] bg-[#FAFBFC] px-5 py-6 text-center md:px-8">
                <p className="text-[15px] leading-[23px] text-[rgba(6,28,47,0.55)]">
                  Want UX score, prioritized fixes, and a shareable PDF?
                </p>
                <div className="mt-4 flex justify-center">
                  <Button
                    href={fullAuditHref}
                    variant="primary"
                    icon={<RiArrowRightLine size={18} aria-hidden />}
                    className="!rounded-full md:!w-auto"
                    fullWidth={false}
                  >
                    Run full UX audit
                  </Button>
                </div>
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-[13px] leading-5 text-[#8E99A2]">
            Processed securely · Hero copy only ·{" "}
            <Link
              href="/analyze"
              className="font-medium text-[var(--ink-primary)] underline-offset-2 hover:underline"
            >
              Full UX audit
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
