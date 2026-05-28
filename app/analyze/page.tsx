"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  RiUpload2Line,
  RiCheckLine,
  RiCloseLine,
} from "@remixicon/react";
import { FormLabel } from "@/components/ui/FormLabel";
import { Button } from "@/components/ui/Button";
import { BrandPill } from "@/components/ui/BrandPill";
import { inputFieldClass } from "@/components/ui/inputClasses";
import { AppHeader } from "@/components/AppHeader";
import { TrustBadgeRow } from "@/components/TrustBadgeRow";
import { isValidAuditResponse, saveReport } from "@/lib/report-storage";
import { validateWebsiteUrl } from "@/lib/validate-website-url";

type FlatIssue = {
  category: "Clarity" | "Navigation" | "Visuals" | "Trust" | "Conversion";
  title: string;
  severity: "low" | "medium" | "high";
  impact_metric_1: string;
  impact_value_1: number;
  impact_metric_2: string;
  impact_value_2: number;
  bullets: string[];
  why: string;
};

type FlatSuggestion = {
  category: "Clarity" | "Navigation" | "Visuals" | "Trust" | "Conversion";
  section: string;
  recommendation: string;
  impact_metric_1: string;
  impact_value_1: number;
  impact_metric_2: string;
  impact_value_2: number;
  why: string;
};

type FlatCopy = {
  section: string;
  before: string;
  after: string;
  impact_metric_1: string;
  impact_value_1: number;
  impact_metric_2: string;
  impact_value_2: number;
  why: string;
};

type AuditResponseFlat = {
  url: string;
  score: number;
  risk: "low" | "medium" | "high";
  summary: string;
  verdict: string;
  key_observation: string;
  confidence: number;
  issues: FlatIssue[];
  suggestions: FlatSuggestion[];
  copy: FlatCopy[];
  breakdown: {
    clarity: number;
    navigation: number;
    visuals: number;
    trust: number;
    conversion: number;
  };
  generatedAt: string;
};

/** Target duration for UX copy (~15–25 sec); progress eases toward cap over this window. */
const ESTIMATED_ANALYSIS_MS = 18_000;
const MAX_PROGRESS_WHILE_WAITING = 92;
const PROGRESS_TICK_MS = 50;
const FINISH_ANIMATION_MS = 180;

function getTimeBasedProgress(elapsedMs: number): number {
  const tau = ESTIMATED_ANALYSIS_MS / 2.8;
  const value =
    MAX_PROGRESS_WHILE_WAITING * (1 - Math.exp(-elapsedMs / tau));
  return Math.min(MAX_PROGRESS_WHILE_WAITING, value);
}

function animateProgressTo100(
  from: number,
  onUpdate: (value: number) => void
): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();

    function tick(now: number) {
      const t = Math.min(1, (now - start) / FINISH_ANIMATION_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      onUpdate(from + (100 - from) * eased);

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(tick);
  });
}

export default function Analyze() {
  const [data, setData] = useState<AuditResponseFlat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imageName, setImageName] = useState("");
  const [imageSize, setImageSize] = useState("");
  const [url, setUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageUpload(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedImage(file);
    setImageName(file.name);
    setImageSize(`${(file.size / 1024 / 1024).toFixed(1)} MB`);
  }

  const urlValidationError = url.trim() ? validateWebsiteUrl(url) : null;
  const showUrlError = formSubmitted && Boolean(urlValidationError);
  const isButtonDisabled = !url.trim() && !uploadedImage;

  const steps = [
    { threshold: 10, label: "Scanning layout…" },
    { threshold: 30, label: "Analyzing hierarchy…" },
    { threshold: 55, label: "Checking clarity…" },
    { threshold: 75, label: "Evaluating trust signals…" },
    { threshold: 90, label: "Reviewing conversion flow…" },
    { threshold: 100, label: "Finalizing report…" }
  ];

  function getLoadingLabel(progress: number) {
    const step = steps.find((s) => progress <= s.threshold);
    return step ? step.label : "Analyzing…";
  }

  function handleUrlKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" || loading) return;

    e.preventDefault();
    void handleAnalyze();
  }

  async function handleAnalyze() {
    let progressTimer: ReturnType<typeof setInterval> | null = null;
    let latestProgress = 0;

    const stopProgressTimer = () => {
      if (progressTimer) {
        clearInterval(progressTimer);
        progressTimer = null;
      }
    };

    try {
      setFormSubmitted(true);

      if (!url.trim() && !uploadedImage) return;
      if (url.trim() && validateWebsiteUrl(url)) return;

      setLoading(true);
      setData(null);
      setProgress(0);
      setError(null);

      const startedAt = performance.now();
      progressTimer = setInterval(() => {
        latestProgress = getTimeBasedProgress(performance.now() - startedAt);
        setProgress(latestProgress);
      }, PROGRESS_TICK_MS);

      const screenshotToSend = uploadedImage;

      const form = new FormData();
      form.append("url", url);

      if (screenshotToSend) {
        form.append("screenshot", screenshotToSend);
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: form,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json) {
        stopProgressTimer();
        setProgress(0);
        setLoading(false);
        setError(
          json?.error ||
            "Something went wrong during analysis. Please try again."
        );
        return;
      }

      if (!isValidAuditResponse(json)) {
        stopProgressTimer();
        setProgress(0);
        setLoading(false);
        setError(
          json?.error ||
            "Analysis returned an incomplete report. Please try again."
        );
        return;
      }

      const flat: AuditResponseFlat = {
        url: json.url ?? url ?? "",
        score: json.score ?? 0,
        risk:
          json.risk === "medium" || json.risk === "high" ? json.risk : "low",
        summary: json.summary ?? "",
        verdict: json.verdict ?? "",
        key_observation: json.key_observation ?? "",
        confidence: json.confidence ?? 0,
        issues: json.issues ?? [],
        suggestions: json.suggestions ?? [],
        copy: json.copy ?? [],
        breakdown: {
          clarity: json.breakdown?.clarity ?? 0,
          navigation: json.breakdown?.navigation ?? 0,
          visuals: json.breakdown?.visuals ?? 0,
          trust: json.breakdown?.trust ?? 0,
          conversion: json.breakdown?.conversion ?? 0,
        },
        generatedAt: new Date().toISOString(),
      };

      const reportId = crypto.randomUUID();

      try {
        saveReport(reportId, flat);
      } catch {
        stopProgressTimer();
        setProgress(0);
        setLoading(false);
        setError(
          "Could not save the report in this browser. Try again or free up storage."
        );
        return;
      }

      stopProgressTimer();
      latestProgress = getTimeBasedProgress(performance.now() - startedAt);

      if (latestProgress < 90) {
        await animateProgressTo100(latestProgress, setProgress);
      } else {
        setProgress(100);
      }

      router.push(`/report/${reportId}`);
    } catch (error: any) {
      stopProgressTimer();
      setProgress(0);
      setError(
        error?.message ||
          "Something went wrong while analyzing the website."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AppHeader />

      {/* MAIN */}
      <main className="min-h-[calc(100dvh-68px)] bg-[#F5F7FA] px-4 py-5 md:px-6 md:py-8">
        <div className="mx-auto max-w-[920px]">

          {/* CARD */}
          <div
            className="
              rounded-[28px]
              md:rounded-[36px]
              border
              border-[rgba(6,28,47,0.06)]
              bg-white
              px-5
              py-6
              md:px-10
              md:py-10
              shadow-[0_10px_40px_rgba(0,0,0,0.03)]
            "
          >

            {/* HERO */}
            <div className="mx-auto max-w-[700px] text-center">

              <BrandPill>AI UX Review</BrandPill>

              <h1
                className="
                  mt-4
                  text-[30px]
                  leading-[1.05]
                  tracking-[-0.05em]
                  font-semibold
                  text-[#061C2F]
                  sm:text-[36px]
                  md:text-[44px]
                "
              >
                Check your site&apos;s UX in minutes
              </h1>

              <p
                className="
                  mt-3
                  mx-auto
                  max-w-[520px]
                  text-[15px]
                  leading-7
                  text-[#6B7280]
                  md:text-[17px]
                "
              >
                AI spots friction, weak copy, and trust gaps — with clear fixes
                you can ship.
              </p>

              
            </div>

            {/* FORM */}
            <div className="mt-8 md:mt-10">

              {/* URL */}
              <div>
                <FormLabel>Website URL</FormLabel>

                <div className="relative mt-3">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleUrlKeyDown}
                    placeholder="https://stripe.com"
                    disabled={loading}
                    aria-invalid={showUrlError ? true : undefined}
                    aria-describedby={showUrlError ? "url-error" : undefined}
                    className={`${inputFieldClass({
                      disabled: loading,
                      error: showUrlError,
                      withClearButton: url.length > 0,
                      withMargin: false,
                    })} h-[54px] md:h-[58px]`}
                  />

                  {url.length > 0 && !loading && (
                    <button
                      type="button"
                      onClick={() => setUrl("")}
                      aria-label="Clear URL"
                      className="
                        absolute
                        right-4
                        top-1/2
                        flex
                        h-8
                        w-8
                        shrink-0
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-full
                        text-[#8E99A2]
                        transition-colors
                        hover:bg-[#EBEFF3]
                        hover:text-[#061C2F]
                      "
                    >
                      <RiCloseLine size={18} className="shrink-0" />
                    </button>
                  )}
                </div>

                {showUrlError && urlValidationError && (
                  <p
                    id="url-error"
                    role="alert"
                    className="mt-2 text-[13px] text-[#D14343]"
                  >
                    {urlValidationError}
                  </p>
                )}
              </div>

              {/* DIVIDER */}
              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-[#E6EBF0]" />

                <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#9AA3AC]">
                  Or
                </span>

                <div className="h-px flex-1 bg-[#E6EBF0]" />
              </div>

              {/* UPLOAD */}
              <div>

                <label className="text-[14px] font-medium text-[#6B7280]">
                  Upload screenshot
                </label>

                <div
                  onClick={() =>
                    !loading && fileInputRef.current?.click()
                  }
                  className={`
                    mt-3
                    rounded-[24px]
                    border-2
                    border-dashed
                    transition-all
                    duration-200
                    cursor-pointer

                    ${
                      uploadedImage
                        ? `
                          border-[#BFE7F8]
                          bg-[#F7FCFF]
                        `
                        : `
                          border-[#DCE2E7]
                          bg-white
                          hover:border-[#8E99A2]
                        `
                    }

                    ${
                      loading
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                  `}
                >

                  {!uploadedImage ? (
                    <div className="flex flex-col items-center justify-center px-5 py-8 md:px-6 md:py-10 text-center">

                      <div
                        className="
                          flex
                          h-12
                          w-12
                          md:h-14
                          md:w-14
                          items-center
                          justify-center
                          rounded-full
                          bg-[#2563EB]/10
                        "
                      >
                        <RiUpload2Line
                          size={24}
                          className="text-[#2563EB]"
                        />
                      </div>

                      <p className="mt-4 text-[15px] font-medium text-[#061C2F]">
                        Click to upload screenshot
                      </p>

                      <p className="mt-1 text-[13px] md:text-[14px] text-[#8F99A2]">
                        PNG, JPG up to 20 MB
                      </p>

                      <p className="mt-3 text-[12px] md:text-[13px] text-neutral-400">
                        Full-page screenshots produce better analysis
                      </p>

                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6 md:py-5">

                      <div className="flex min-w-0 items-center gap-4">

                        <div
                          className="
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-[#14A8E8]
                          "
                        >
                          <RiCheckLine
                            size={20}
                            className="text-white"
                          />
                        </div>

                        <div className="min-w-0">

                          <p
                            className="
                              truncate
                              text-[14px]
                              md:text-[15px]
                              font-semibold
                              text-[#061C2F]
                            "
                          >
                            {imageName}
                          </p>

                          <p className="mt-1 text-[12px] md:text-[13px] text-[#14A8E8]">
                            {imageSize} • Ready for analysis
                          </p>
                        </div>
                      </div>

                      <div
                        className="
                          shrink-0
                          rounded-full
                          border
                          border-[#D9EAF3]
                          bg-white
                          px-3
                          py-1.5
                          text-[12px]
                          md:text-[13px]
                          font-medium
                          text-[#061C2F]
                        "
                      >
                        Replace
                      </div>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={loading}
                />
              </div>

              {/* ACTION */}
              <div className="mt-8 md:mt-10">

                {!loading ? (
                  <Button
                    type="button"
                    variant="accent"
                    disabled={isButtonDisabled}
                    onClick={handleAnalyze}
                    className="h-[58px] min-h-[58px] w-full text-[17px]"
                  >
                    Analyze UX
                  </Button>
                ) : (
                  <div
                    className="
                      rounded-[24px]
                      border
                      border-[rgba(20,168,232,0.10)]
                      bg-[#F8FCFF]
                      px-5
                      py-5
                      md:px-6
                    "
                  >

                    <div className="flex items-start justify-between gap-5">

                      <div>
                        <p
                          className="
                            text-[16px]
                            md:text-[18px]
                            font-semibold
                            tracking-[-0.02em]
                            text-[#061C2F]
                          "
                        >
                          Generating UX report
                        </p>

                        <p className="mt-1 text-[13px] md:text-[14px] text-[#6B7280]">
                          {getLoadingLabel(progress)}
                        </p>
                      </div>

                      <div
                        className="
                          rounded-full
                          border
                          border-[rgba(20,168,232,0.12)]
                          bg-white
                          px-3
                          py-1.5
                          text-[13px]
                          md:text-[14px]
                          font-semibold
                          text-[#14A8E8]
                        "
                      >
                        {Math.floor(progress)}%
                      </div>
                    </div>

                    <div className="mt-5">

                      <div
                        className="
                          h-[10px]
                          overflow-hidden
                          rounded-full
                          bg-[#DDEAF2]
                        "
                      >
                        <div
                          className="
                            h-full
                            rounded-full
                            transition-all
                            duration-500
                            ease-out
                          "
                          style={{
                            width: `${progress}%`,
                            background:
                              "linear-gradient(90deg, #14A8E8 0%, #3CC6FF 100%)",
                            boxShadow:
                              "0 0 18px rgba(20,168,232,0.35)",
                          }}
                        />
                      </div>

                      <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

                        <span className="text-[12px] md:text-[13px] text-[#6B7280]">
                          AI is evaluating hierarchy, clarity & trust
                        </span>

                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-[#14A8E8] animate-pulse" />

                          <span className="text-[12px] md:text-[13px] font-medium text-[#14A8E8]">
                            Processing
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>


{!loading && <TrustBadgeRow variant="light" className="mt-5" />}


              {/* ERROR */}
              {error && (
                <div
                  className="
                    mt-5
                    rounded-2xl
                    border
                    border-[#FFD9D6]
                    bg-[#FFF4F3]
                    px-4
                    py-4
                  "
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="text-[15px] font-medium text-[#D14343]">
                        Analysis failed
                      </p>

                      <p className="mt-1 text-[14px] text-[#9F5C5C]">
                        {error}
                      </p>
                    </div>

                    <button
                      onClick={handleAnalyze}
                      className="
                        shrink-0
                        rounded-full
                        bg-red-100
                        px-3
                        py-1.5
                        text-[12px]
                        font-medium
                        text-red-700
                        transition
                        hover:bg-red-200
                      "
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* FOOTNOTE */}
          <div className="mt-6 text-center">
            <p className="text-[12px] md:text-[13px] text-[#9AA3AC]">
              Your screenshots and URLs are processed securely and never shared.
            </p>
          </div>

        </div>
      </main>
    </>
  );
}