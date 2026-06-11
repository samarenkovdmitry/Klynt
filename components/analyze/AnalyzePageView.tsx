"use client";


import {
  RiArrowRightLine,
  RiCheckLine,
  RiCloseLine,
  RiGlobalLine,
  RiImageLine,
  RiLink,
  RiShieldCheckLine,
  RiUpload2Line,
} from "@remixicon/react";

import { AnalyzeContextCollapsible } from "@/components/analyze/AnalyzeContextCollapsible";
import {
  useAnalyzePage,
  type AnalyzeErrorKind,
  type AnalyzeInputMode,
} from "@/hooks/useAnalyzePage";
import { AppHeader } from "@/components/AppHeader";
import { WORKSPACE_BG_CLASS } from "@/components/report/reportStyles";
import { LoadingProgressPanel } from "@/components/ui/LoadingProgressPanel";
import { useLoadingStall } from "@/hooks/useLoadingStall";
import { ReportPrefetchLink } from "@/components/ReportPrefetchLink";
import { DEMO_REPORT_PATH, DEMO_REPORT_SLUG } from "@/lib/demo-report";
import {
  ANALYZE_STALL_HELPER,
  ANALYZE_STALL_LABEL,
  getStallLoadingLabel,
} from "@/lib/loading-progress";

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
          "Something went wrong while reading your image. Try a PNG or JPG under 20 MB."
        : error;

  return (
    <div
      className={[
        "rounded-xl px-4 py-3.5",
        isRateLimited
          ? "border border-amber-200 bg-amber-50"
          : "border border-[#FFD9D6] bg-[#FFF4F3]",
      ].join(" ")}
      role="alert"
    >
      <p
        className={[
          "text-[14px] font-medium",
          isRateLimited ? "text-amber-800" : "text-[#D14343]",
        ].join(" ")}
      >
        {title}
      </p>
      <p
        className={[
          "mt-1 text-[13px] leading-5",
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
        <button
          type="button"
          onClick={switchToScreenshotUpload}
          className="inline-flex w-full items-center justify-center gap-2 rounded-[13px] bg-[#111] px-4 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-[#2a2a2a]"
        >
          <RiUpload2Line size={18} aria-hidden />
          Upload screenshot
        </button>
        <button
          type="button"
          onClick={handleAnalyze}
          className="inline-flex w-full items-center justify-center rounded-[13px] bg-black/[0.05] px-4 py-3 text-[14px] font-medium text-[#555] transition-colors hover:bg-black/[0.08]"
        >
          Try again
        </button>
      </div>
    );
  }

  if (errorKind === "screenshot_analysis" || errorKind === "storage") {
    return (
      <button
        type="button"
        onClick={handleAnalyze}
        className="inline-flex w-full items-center justify-center rounded-[13px] bg-[#111] px-4 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-[#2a2a2a]"
      >
        Try again
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={isButtonDisabled}
      onClick={handleAnalyze}
      className="inline-flex w-full items-center justify-center gap-1 rounded-[13px] bg-[#111] px-4 py-3.5 text-[15px] font-medium tracking-[-0.01em] text-white transition-all hover:bg-[#2a2a2a] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
    >
      Analyze UX
      <RiArrowRightLine size={18} aria-hidden />
    </button>
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

      <main className={`min-h-[calc(100dvh-50px)] ${WORKSPACE_BG_CLASS} px-4 pb-16 pt-10 text-[#111] md:px-8 md:pt-16`}>
        <div className="mx-auto max-w-[520px]">
          <header className="text-center">
            <h1 className="text-[26px] font-semibold leading-[1.2] tracking-[-0.04em] text-[#111] md:text-[34px]">
              What are visitors missing?
            </h1>
            <p className="mx-auto mt-3 max-w-[460px] text-[14px] leading-[1.7] text-[#999]">
              Paste a URL and get a prioritized UX report — issues, fixes, and copy
              rewrites — in about a minute.
            </p>
          </header>

          <div className="mt-8 overflow-hidden rounded-[20px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.06)]">
            <div
              className="grid grid-cols-2 gap-1.5 border-b border-black/[0.08] bg-[#F0F0EE] p-2"
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
                      "flex items-center justify-center gap-1.5 rounded-[11px] px-3.5 py-2 text-[13px] transition-all",
                      isActive
                        ? "bg-white font-medium text-[#111] shadow-[0_1px_3px_rgba(0,0,0,0.08)] [&_svg]:opacity-100"
                        : "text-[#999] hover:text-[#111] [&_svg]:opacity-50",
                      loading ? "cursor-not-allowed opacity-60" : "",
                    ].join(" ")}
                  >
                    <Icon size={14} aria-hidden />
                    {label}
                  </button>
                );
              })}
            </div>

            {inputMode === "url" ? (
              <div className="px-[18px] pt-[18px]" role="tabpanel" aria-label="Website URL">
                <div className="relative">
                  <RiGlobalLine
                    size={14}
                    className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#bbb]"
                    aria-hidden
                  />
                  <input
                    type="text"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    onKeyDown={handleUrlKeyDown}
                    placeholder="https://yoursite.com"
                    disabled={loading}
                    aria-label="Website URL"
                    aria-invalid={showUrlError ? true : undefined}
                    aria-describedby={showUrlError ? "url-error" : undefined}
                    className={[
                      "w-full rounded-xl border-[0.5px] bg-[#F0F0EE] py-[13px] pr-11 pl-[42px] text-[14px] text-[#111] outline-none transition-all placeholder:text-[#bbb]",
                      showUrlError
                        ? "border-[#FFD9D6] bg-[#FFF4F3]"
                        : "border-transparent focus:border-[#1D9E75] focus:bg-white focus:shadow-[0_0_0_3px_rgba(29,158,117,0.1)]",
                      loading ? "cursor-not-allowed opacity-60" : "",
                    ].join(" ")}
                  />

                  {url.length > 0 && !loading ? (
                    <button
                      type="button"
                      onClick={clearUrl}
                      aria-label="Clear URL"
                      className="absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[#bbb] transition hover:bg-black/[0.05] hover:text-[#111]"
                    >
                      <RiCloseLine size={16} aria-hidden />
                    </button>
                  ) : null}
                </div>

                {showUrlError && urlValidationError ? (
                  <p id="url-error" role="alert" className="mt-2 text-[12px] text-[#D14343]">
                    {urlValidationError}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="px-[18px] pt-[18px]" role="tabpanel" aria-label="Screenshot upload">
                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={loading}
                  className={[
                    "w-full rounded-xl border-[0.5px] border-dashed text-left transition",
                    uploadedImage
                      ? "border-[rgba(29,158,117,0.35)] bg-[#E1F5EE]"
                      : "border-black/[0.13] bg-[#F0F0EE] hover:border-black/[0.2]",
                    loading ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                  ].join(" ")}
                >
                  {!uploadedImage ? (
                    <span className="flex items-center gap-3 px-4 py-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                        <RiUpload2Line size={18} className="text-[#999]" aria-hidden />
                      </span>
                      <span className="min-w-0 text-left">
                        <span className="block text-[14px] font-medium text-[#111]">
                          Click to upload screenshot
                        </span>
                        <span className="mt-0.5 block text-[12px] text-[#999]">
                          PNG or JPG, up to 20 MB
                        </span>
                      </span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-between gap-3 px-4 py-4">
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1D9E75]">
                          <RiCheckLine size={16} className="text-white" aria-hidden />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[14px] font-medium text-[#111]">
                            {imageName}
                          </span>
                          <span className="mt-0.5 block text-[12px] text-[#0F6E56]">
                            {imageSize} · Ready for analysis
                          </span>
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[12px] font-medium text-[#555]">
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

            <AnalyzeContextCollapsible
              brandStage={brandStage}
              trafficSource={trafficSource}
              audienceType={audienceType}
              onBrandStageChange={setBrandStage}
              onTrafficSourceChange={setTrafficSource}
              onAudienceTypeChange={setAudienceType}
              disabled={loading}
            />

            {error && errorKind ? (
              <div className="px-[18px] pb-2">
                <AnalyzeErrorAlert errorKind={errorKind} error={error} />
              </div>
            ) : null}

            <div className="border-t border-black/[0.08] px-[18px] py-[18px]">
              {!loading ? (
                <p className="mb-2.5 flex items-center justify-center gap-1 text-[12px] text-[#bbb]">
                  <RiShieldCheckLine size={13} aria-hidden />
                  URLs are never stored or shared
                </p>
              ) : null}

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

          <p className="mt-5 text-center text-[13px] text-[#999]">
            Not sure what you&apos;ll get?{" "}
            <ReportPrefetchLink
              href={DEMO_REPORT_PATH}
              routeParam={DEMO_REPORT_SLUG}
              className="text-[#555] underline underline-offset-[3px] hover:text-[#111]"
            >
              View a sample report →
            </ReportPrefetchLink>
          </p>
        </div>
      </main>
    </>
  );
}
