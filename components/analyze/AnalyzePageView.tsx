"use client";

import {
  RiCheckLine,
  RiCloseLine,
  RiLink,
  RiShieldCheckLine,
  RiUpload2Line,
} from "@remixicon/react";

import {
  useAnalyzePage,
  type AnalyzeErrorKind,
  type AnalyzeInputMode,
} from "@/hooks/useAnalyzePage";
import { AnalyzePageContextPanel } from "@/components/analyze/AnalyzePageContextPanel";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/Button";
import { LoadingProgressPanel } from "@/components/ui/LoadingProgressPanel";
import { inputFieldClass } from "@/components/ui/inputClasses";
import { useLoadingStall } from "@/hooks/useLoadingStall";
import {
  ANALYZE_STALL_HELPER,
  ANALYZE_STALL_LABEL,
  getStallLoadingLabel,
} from "@/lib/loading-progress";
import {
  ANALYZE_CARD_CLASS,
  ANALYZE_INPUT_CLASS,
  ANALYZE_PAGE_CONTAINER_CLASS,
  ANALYZE_PRIMARY_BUTTON_CLASS,
  ANALYZE_TAB_BUTTON_ACTIVE_CLASS,
  ANALYZE_TAB_BUTTON_INACTIVE_CLASS,
  ANALYZE_TAB_LIST_CLASS,
} from "@/lib/analyze-page-styles";

const INPUT_TABS: { id: AnalyzeInputMode; label: string }[] = [
  { id: "url", label: "Website URL" },
  { id: "screenshot", label: "Screenshot" },
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
  const loadingStalled = useLoadingStall(loading, progress);

  if (loading) {
    return (
      <LoadingProgressPanel
        title="Generating UX report"
        loadingLabel={getStallLoadingLabel(
          loadingStalled,
          loadingLabel,
          ANALYZE_STALL_LABEL
        )}
        progress={progress}
        loadingStalled={loadingStalled}
        helperText="Evaluating hierarchy, clarity, trust and conversion flow"
        stallHelperText={ANALYZE_STALL_HELPER}
      />
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
          className={ANALYZE_PRIMARY_BUTTON_CLASS}
        >
          Upload screenshot
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleAnalyze}
          className="!rounded-2xl"
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
        className={ANALYZE_PRIMARY_BUTTON_CLASS}
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
      className={ANALYZE_PRIMARY_BUTTON_CLASS}
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
    brandStage,
    setBrandStage,
    trafficSource,
    setTrafficSource,
    audienceType,
    setAudienceType,
  } = useAnalyzePage();

  return (
    <>
      <AppHeader />

      <main className="flex flex-1 flex-col bg-white px-4 pb-10 pt-6 text-[var(--ink-primary)] md:px-6 md:pb-12 md:pt-10">
        <div className={`${ANALYZE_PAGE_CONTAINER_CLASS} flex flex-1 flex-col justify-center`}>
          <header className="text-center">
            <h1 className="text-[30px] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--ink-primary)] md:text-[38px] md:leading-[1.05]">
              Check your site&apos;s UX in minutes
            </h1>
            <p className="mx-auto mt-3 max-w-[540px] text-[15px] leading-[24px] text-[rgba(6,28,47,0.5)] md:text-[16px] md:leading-[25px]">
              Paste a URL or upload a screenshot. Klynt flags friction, weak copy, and trust
              gaps — with fixes you can ship.
            </p>
          </header>

          <div className={`${ANALYZE_CARD_CLASS} mt-8`}>
            <div
              className={ANALYZE_TAB_LIST_CLASS}
              role="tablist"
              aria-label="Analysis input type"
            >
              {INPUT_TABS.map(({ id, label }) => {
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
                      "flex flex-1 items-center justify-center rounded-full px-3 py-2.5 text-[14px] font-medium transition",
                      isActive
                        ? ANALYZE_TAB_BUTTON_ACTIVE_CLASS
                        : ANALYZE_TAB_BUTTON_INACTIVE_CLASS,
                      loading ? "cursor-not-allowed opacity-60" : "",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {inputMode === "url" ? (
              <div className="relative mt-4" role="tabpanel" aria-label="Website URL">
                <RiLink
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#9AA3AC]"
                  aria-hidden
                />
                <input
                  type="text"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  onKeyDown={handleUrlKeyDown}
                  placeholder="yoursite.com"
                  disabled={loading}
                  aria-label="Website URL"
                  aria-invalid={showUrlError ? true : undefined}
                  aria-describedby={showUrlError ? "url-error" : undefined}
                  className={`${inputFieldClass({
                    disabled: loading,
                    error: showUrlError,
                    withClearButton: url.length > 0,
                    withMargin: false,
                  })} ${ANALYZE_INPUT_CLASS}`}
                />

                {url.length > 0 && !loading && (
                  <button
                    type="button"
                    onClick={clearUrl}
                    aria-label="Clear URL"
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#F5F7FA] text-[#8E99A2] transition hover:bg-[#EBEFF3] hover:text-[var(--ink-primary)]"
                  >
                    <RiCloseLine size={18} aria-hidden />
                  </button>
                )}

                {showUrlError && urlValidationError && (
                  <p id="url-error" role="alert" className="mt-2 text-[13px] text-[#D14343]">
                    {urlValidationError}
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-4" role="tabpanel" aria-label="Screenshot upload">
                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={loading}
                  className={[
                    "w-full rounded-[20px] border-2 border-dashed text-left transition",
                    uploadedImage
                      ? "border-[#A4F4CF] bg-[#ECFDF5]"
                      : "border-[#DCE2E7] bg-white hover:border-[#8E99A2]",
                    loading ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                  ].join(" ")}
                >
                  {!uploadedImage ? (
                    <span className="flex items-center gap-4 px-4 py-5 md:px-5">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[rgba(6,28,47,0.05)]">
                        <RiUpload2Line size={22} className="text-[var(--ink-primary)]" aria-hidden />
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

            {error && errorKind && (
              <div className="mt-4">
                <AnalyzeErrorAlert errorKind={errorKind} error={error} />
              </div>
            )}

            <div className="mt-4">
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

            <AnalyzePageContextPanel
              brandStage={brandStage}
              trafficSource={trafficSource}
              audienceType={audienceType}
              onBrandStageChange={setBrandStage}
              onTrafficSourceChange={setTrafficSource}
              onAudienceTypeChange={setAudienceType}
              disabled={loading}
            />
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-center text-[13px] leading-5 text-[#8E99A2]">
            <RiShieldCheckLine size={14} className="shrink-0" aria-hidden />
            Your URLs and screenshots are processed securely and never shared.
          </p>
        </div>
      </main>
    </>
  );
}
