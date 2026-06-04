"use client";

import Link from "next/link";
import {
  RiArrowRightLine,
  RiCheckLine,
  RiCloseLine,
  RiFilePdfLine,
  RiImageLine,
  RiLightbulbLine,
  RiLink,
  RiPieChartLine,
  RiUpload2Line,
} from "@remixicon/react";

import {
  useAnalyzePage,
  type AnalyzeErrorKind,
  type AnalyzeInputMode,
} from "@/hooks/useAnalyzePage";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/Button";
import { inputFieldClass } from "@/components/ui/inputClasses";
import { DEMO_REPORT_PATH } from "@/lib/demo-report";

const OUTCOMES = [
  { icon: RiPieChartLine, label: "UX score breakdown" },
  { icon: RiLightbulbLine, label: "Prioritized fixes" },
  { icon: RiFilePdfLine, label: "Shareable PDF" },
] as const;

const INPUT_TABS: {
  id: AnalyzeInputMode;
  label: string;
  icon: typeof RiLink;
}[] = [
  { id: "url", label: "Website URL", icon: RiLink },
  { id: "screenshot", label: "Screenshot", icon: RiImageLine },
];

type AnalyzeErrorAlertProps = {
  errorKind: Exclude<AnalyzeErrorKind, null>;
  error: string;
};

function AnalyzeErrorAlert({ errorKind, error }: AnalyzeErrorAlertProps) {
  const isRateLimited = errorKind === "rate_limit";

  const title =
    errorKind === "rate_limit"
      ? "Rate limit reached"
      : errorKind === "url_analysis"
        ? "We couldn't analyze this URL"
        : errorKind === "screenshot_analysis"
          ? "We couldn't analyze this screenshot"
          : "Couldn't save your report";

  const body =
    errorKind === "url_analysis"
      ? "The site may block automated access, require login, or load too slowly. Upload a screenshot instead — you'll get the same UX report."
      : errorKind === "screenshot_analysis"
        ? error ||
          "Something went wrong while reading your image. Try a PNG or JPG under 10 MB."
        : error;

  return (
    <div
      className={[
        "rounded-[16px] px-4 py-3.5",
        isRateLimited
          ? "border border-amber-200 bg-amber-50"
          : "border border-[#FFD9D6] bg-[#FFF4F3]",
      ].join(" ")}
      role="alert"
    >
      <p
        className={[
          "text-[15px] font-medium",
          isRateLimited ? "text-amber-800" : "text-[#D14343]",
        ].join(" ")}
      >
        {title}
      </p>
      <p
        className={[
          "mt-1 text-[14px] leading-5",
          isRateLimited ? "text-amber-700" : "text-[#9F5C5C]",
        ].join(" ")}
      >
        {body}
      </p>
    </div>
  );
}

function AnalyzeFormActions({
  loading,
  progress,
  loadingLabel,
  errorKind,
  isButtonDisabled,
  handleAnalyze,
  switchToScreenshotUpload,
}: {
  loading: boolean;
  progress: number;
  loadingLabel: string;
  errorKind: AnalyzeErrorKind;
  isButtonDisabled: boolean;
  handleAnalyze: () => void;
  switchToScreenshotUpload: () => void;
}) {
  if (loading) {
    return (
      <div className="pt-1">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--ink-primary)]">
              Generating UX report
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
        <p className="mt-3 text-[13px] text-[rgba(6,28,47,0.5)]">
          Evaluating hierarchy, clarity, trust and conversion flow
        </p>
      </div>
    );
  }

  if (errorKind === "url_analysis") {
    return (
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="primary"
          onClick={switchToScreenshotUpload}
          icon={<RiUpload2Line size={18} aria-hidden />}
          className="!rounded-full"
        >
          Upload screenshot
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleAnalyze}
          className="!rounded-full"
        >
          Try again
        </Button>
      </div>
    );
  }

  if (errorKind === "screenshot_analysis" || errorKind === "storage") {
    return (
      <Button
        type="button"
        variant="primary"
        onClick={handleAnalyze}
        className="!rounded-full"
      >
        Try again
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="primary"
      disabled={isButtonDisabled}
      onClick={handleAnalyze}
      icon={<RiArrowRightLine size={18} aria-hidden />}
      className="!rounded-full"
    >
      Analyze UX
    </Button>
  );
}

export function AnalyzePageView() {
  const {
    fileInputRef,
    url,
    setUrl,
    clearUrl,
    uploadedImage,
    imageName,
    imageSize,
    loading,
    error,
    errorKind,
    progress,
    inputMode,
    setInputMode,
    showUrlError,
    urlValidationError,
    isButtonDisabled,
    loadingLabel,
    handleAnalyze,
    handleImageUpload,
    handleUrlKeyDown,
    openFilePicker,
    switchToScreenshotUpload,
  } = useAnalyzePage();

  return (
    <>
      <AppHeader />

      <main className="min-h-[calc(100dvh-68px)] bg-white px-4 pb-12 pt-6 text-[var(--ink-primary)] md:px-6 md:pt-10">
        <div className="mx-auto max-w-[640px]">
          <header className="text-center">
            <h1 className="text-[30px] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--ink-primary)] md:text-[38px] md:leading-[1.05]">
              Check your site&apos;s UX in minutes
            </h1>
            <p className="mx-auto mt-3 max-w-[540px] text-[15px] leading-[24px] text-[rgba(6,28,47,0.5)] md:text-[16px] md:leading-[25px]">
              Paste a URL or upload a screenshot. Klynt flags friction, weak copy, and trust
              gaps — with fixes you can ship.
            </p>
          </header>

          <ul className="mt-6 flex flex-row flex-wrap justify-center gap-x-5 gap-y-2 sm:gap-x-6">
            {OUTCOMES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-[14px] text-[#8E99A2]">
                <Icon size={16} className="shrink-0" aria-hidden />
                {label}
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-[32px] border border-[rgba(6,28,47,0.06)] bg-[#FAFBFC] p-5 md:p-8">
            <div
              className="flex rounded-full bg-[#ECF0F6] p-1"
              role="tablist"
              aria-label="Analysis input type"
            >
              {INPUT_TABS.map(({ id, label, icon: Icon }) => {
                const isActive = inputMode === id;

                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    disabled={loading}
                    onClick={() => setInputMode(id)}
                    className={[
                      "flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2.5 text-[14px] font-medium transition",
                      isActive
                        ? "bg-white text-[var(--ink-primary)] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                        : "text-[#8E99A2] hover:text-[var(--ink-primary)]",
                      loading ? "cursor-not-allowed opacity-60" : "",
                    ].join(" ")}
                  >
                    <Icon size={16} className="shrink-0" aria-hidden />
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 md:mt-6">
              {inputMode === "url" ? (
                <div role="tabpanel" aria-label="Website URL">
                  <div className="relative">
                    <input
                      type="text"
                      value={url}
                      onChange={(event) => setUrl(event.target.value)}
                      onKeyDown={handleUrlKeyDown}
                      placeholder="https://stripe.com"
                      disabled={loading}
                      aria-label="Website URL"
                      aria-invalid={showUrlError ? true : undefined}
                      aria-describedby={showUrlError ? "url-error" : undefined}
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
                    <p id="url-error" role="alert" className="mt-2 text-[13px] text-[#D14343]">
                      {urlValidationError}
                    </p>
                  )}

                  <p className="mt-3 text-[13px] leading-5 text-[#8E99A2]">
                    Klynt captures the page and analyzes layout, copy, and conversion flow.
                  </p>
                </div>
              ) : (
                <div role="tabpanel" aria-label="Screenshot upload">
                  <button
                    type="button"
                    onClick={openFilePicker}
                    disabled={loading}
                    className={[
                      "w-full rounded-[24px] border-2 border-dashed text-left transition",
                      uploadedImage
                        ? "border-[#A4F4CF] bg-[#ECFDF5]"
                        : "border-[#DCE2E7] bg-white hover:border-[#8E99A2]",
                      loading ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                    ].join(" ")}
                  >
                    {!uploadedImage ? (
                      <span className="flex items-center gap-4 px-4 py-5 md:px-5">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[rgba(37,99,235,0.08)]">
                          <RiUpload2Line size={22} className="text-[#2563EB]" aria-hidden />
                        </span>
                        <span className="min-w-0 text-left">
                          <span className="block text-[15px] font-medium text-[var(--ink-primary)]">
                            Click to upload screenshot
                          </span>
                          <span className="mt-0.5 block text-[13px] text-[#8E99A2]">
                            PNG or JPG, up to 20 MB · full-page works best
                          </span>
                        </span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-between gap-4 px-4 py-4 md:px-5">
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#10B981]">
                            <RiCheckLine size={18} className="text-white" aria-hidden />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[15px] font-medium text-[var(--ink-primary)]">
                              {imageName}
                            </span>
                            <span className="mt-0.5 block text-[13px] text-[#10B981]">
                              {imageSize} · Ready for analysis
                            </span>
                          </span>
                        </span>
                        <span className="shrink-0 rounded-full border border-[rgba(6,28,47,0.10)] bg-white px-3 py-1.5 text-[13px] font-medium text-[var(--ink-primary)]">
                          Replace
                        </span>
                      </span>
                    )}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={loading}
                  />
                </div>
              )}
            </div>

            {error && errorKind && (
              <div className="mt-4">
                <AnalyzeErrorAlert errorKind={errorKind} error={error} />
              </div>
            )}

            <div className="mt-5 border-t border-[rgba(6,28,47,0.06)] pt-5">
              <AnalyzeFormActions
                loading={loading}
                progress={progress}
                loadingLabel={loadingLabel}
                errorKind={errorKind}
                isButtonDisabled={isButtonDisabled}
                handleAnalyze={handleAnalyze}
                switchToScreenshotUpload={switchToScreenshotUpload}
              />
            </div>
          </div>

          <p className="mt-6 text-center text-[13px] leading-5 text-[#8E99A2]">
            Your URLs and screenshots are processed securely and never shared.{" "}
            <Link
              href={DEMO_REPORT_PATH}
              className="font-medium text-[var(--ink-primary)] underline-offset-2 hover:underline"
            >
              View a sample report
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
