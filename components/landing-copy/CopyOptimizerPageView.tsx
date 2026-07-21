"use client";

import { useEffect, useRef } from "react";
import { RiArrowRightLine, RiCloseLine, RiLock2Line } from "@remixicon/react";

import { CopyOptimizerAtmosphere } from "@/components/landing-copy/CopyOptimizerAtmosphere";
import { CopyOptimizerFieldCard } from "@/components/landing-copy/CopyOptimizerFieldCard";
import { LANDING_DARK, LANDING_CONTAINER } from "@/components/landing-test/landingPageStyles";
import { Button } from "@/components/ui/Button";
import { LoadingProgressPanel } from "@/components/ui/LoadingProgressPanel";
import { inputFieldClass, inputFieldSizeClass } from "@/components/ui/inputClasses";
import { useCopyOptimizer } from "@/hooks/useCopyOptimizer";
import { useLoadingStall } from "@/hooks/useLoadingStall";
import type { CopyOptimizerLayer } from "@/lib/copy-optimize";
import {
  COPY_OPTIMIZE_STALL_HELPER,
  COPY_OPTIMIZE_STALL_LABEL,
  getStallLoadingLabel,
} from "@/lib/loading-progress";
import { HEADER_HEIGHT_PX } from "@/lib/layout-constants";
import { formatReportDomain } from "@/lib/report-hero-theme";

const HEADER_OFFSET = `calc(${HEADER_HEIGHT_PX}px + env(safe-area-inset-top, 0px))`;

const RESULT_LAYERS: CopyOptimizerLayer[] = ["headline", "subheadline", "cta"];

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

  const loadingStalled = useLoadingStall(loading, progress);

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
      className="relative min-h-dvh text-white"
      style={{
        backgroundColor: LANDING_DARK,
        paddingTop: HEADER_OFFSET,
      }}
    >
      <CopyOptimizerAtmosphere />

      <div className="relative z-[1]">
        <div className={`${LANDING_CONTAINER} px-4 pb-10 md:px-6 md:pb-14`}>
          <div className="mx-auto max-w-[720px]">
            <header className="text-center">
              <p className="text-[13px] font-medium text-white/45 md:text-[14px]">Free</p>
              <h1 className="mt-2 text-[30px] font-bold leading-[1.08] tracking-[-0.02em] text-white md:text-[40px]">
                Fix your hero copy in minutes
              </h1>
              <p className="mx-auto mt-3 max-w-[560px] text-[15px] leading-[24px] text-white/65 md:text-[16px] md:leading-[26px]">
                Paste a URL. Get a clearer headline, subheadline, and primary CTA — from
                what&apos;s visible above the fold.
              </p>
            </header>

            <div className="mt-7 rounded-[32px] border border-[rgba(6,28,47,0.06)] bg-white p-5 text-[var(--ink-primary)] shadow-[0_24px_80px_rgba(0,0,0,0.28)] md:p-7">
              {hasResult && !loading ? (
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 flex-1 truncate text-[15px] font-medium text-[var(--ink-primary)]">
                    {formatReportDomain(displayUrl) || displayUrl}
                  </p>
                  <button
                    type="button"
                    onClick={resetToInput}
                    className="shrink-0 text-[13px] font-medium text-[#8E99A2] underline-offset-2 transition hover:text-[var(--ink-primary)] hover:underline"
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
                      })} ${inputFieldSizeClass}`}
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
                    <LoadingProgressPanel
                      title="Optimizing hero copy"
                      loadingLabel={getStallLoadingLabel(
                        loadingStalled,
                        loadingLabel,
                        COPY_OPTIMIZE_STALL_LABEL
                      )}
                      progress={progress}
                      loadingStalled={loadingStalled}
                      stallHelperText={COPY_OPTIMIZE_STALL_HELPER}
                    />
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
            </div>

            {result && (
              <div ref={resultsRef} className="mt-7 scroll-mt-28">
                <div className="mb-5 text-center md:text-left">
                  <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-white md:text-[22px]">
                    Your optimized hero copy
                  </h2>
                  <p className="mt-1.5 text-[14px] leading-[22px] text-white/55 md:text-[15px]">
                    Copy the improved lines below — paste them straight into your page.
                  </p>
                </div>

                <div className="space-y-4">
                  {RESULT_LAYERS.map((layer) => (
                    <CopyOptimizerFieldCard
                      key={layer}
                      layer={layer}
                      field={result.fields[layer]}
                    />
                  ))}
                </div>

                <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 px-5 py-6 text-center backdrop-blur-sm md:px-8">
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
                </div>
              </div>
            )}

            <p className="mt-8 flex items-center justify-center gap-2 text-center text-[13px] leading-5 text-white/45">
              <RiLock2Line size={15} className="shrink-0" aria-hidden />
              <span>Processed securely — hero copy only, never shared</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
