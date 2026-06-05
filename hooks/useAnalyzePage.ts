"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { generateReportId } from "@/lib/report-id";
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
  priority: "quick_win" | "high_impact" | "medium_impact";
  why: string;
};

type FlatCopy = {
  section: string;
  before: string;
  after: string;
  priority: "quick_win" | "high_impact" | "medium_impact";
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
  previewImage?: string;
  ogPreviewImage?: string;
  metric_observations?: {
    trust?: string;
    clarity?: string;
    friction?: string;
    overall?: string;
  };
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

const ESTIMATED_ANALYSIS_MS = 18_000;
const MAX_PROGRESS_WHILE_WAITING = 92;
const PROGRESS_TICK_MS = 50;
const FINISH_ANIMATION_MS = 180;
const ANALYZE_HOURLY_LIMIT = 8;

const LOADING_STEPS = [
  { threshold: 10, label: "Scanning layout…" },
  { threshold: 30, label: "Analyzing hierarchy…" },
  { threshold: 55, label: "Checking clarity…" },
  { threshold: 75, label: "Evaluating trust signals…" },
  { threshold: 90, label: "Reviewing conversion flow…" },
  { threshold: 100, label: "Finalizing report…" },
] as const;

function getTimeBasedProgress(elapsedMs: number): number {
  const tau = ESTIMATED_ANALYSIS_MS / 2.8;
  const value = MAX_PROGRESS_WHILE_WAITING * (1 - Math.exp(-elapsedMs / tau));
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

function getRateLimitMessage(retryAfterSec: number | null): string {
  const base = `You've reached the limit of ${ANALYZE_HOURLY_LIMIT} free analyses per hour.`;

  if (!retryAfterSec || retryAfterSec <= 0) {
    return `${base} Please try again later.`;
  }

  if (retryAfterSec >= 3600) {
    const hours = Math.ceil(retryAfterSec / 3600);
    return `${base} Try again in about ${hours} hour${hours === 1 ? "" : "s"}.`;
  }

  const minutes = Math.max(1, Math.ceil(retryAfterSec / 60));
  return `${base} Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}

function getLoadingLabel(progress: number) {
  const step = LOADING_STEPS.find((item) => progress <= item.threshold);
  return step ? step.label : "Analyzing…";
}

export type AnalyzeInputMode = "url" | "screenshot";

export type AnalyzeErrorKind =
  | "rate_limit"
  | "url_analysis"
  | "screenshot_analysis"
  | "storage"
  | null;

export function useAnalyzePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<AnalyzeErrorKind>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imageName, setImageName] = useState("");
  const [imageSize, setImageSize] = useState("");
  const [url, setUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [inputMode, setInputMode] = useState<AnalyzeInputMode>("url");

  useEffect(() => {
    const prefill = searchParams.get("url")?.trim();
    if (prefill) {
      setUrl(prefill);
      setInputMode("url");
    }
  }, [searchParams]);

  const urlValidationError = url.trim() ? validateWebsiteUrl(url) : null;
  const showUrlError =
    formSubmitted && inputMode === "url" && Boolean(urlValidationError);
  const isButtonDisabled =
    inputMode === "url" ? !url.trim() : !uploadedImage;

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedImage(file);
    setImageName(file.name);
    setImageSize(`${(file.size / 1024 / 1024).toFixed(1)} MB`);
  }

  function clearUrl() {
    setUrl("");
  }

  function openFilePicker() {
    if (!loading) {
      fileInputRef.current?.click();
    }
  }

  function clearAnalysisError() {
    setError(null);
    setErrorKind(null);
    setIsRateLimited(false);
  }

  function failAnalysis(
    kind: Exclude<AnalyzeErrorKind, null>,
    message: string
  ) {
    setErrorKind(kind);
    setError(message);
    setIsRateLimited(kind === "rate_limit");
  }

  function switchToScreenshotUpload() {
    clearAnalysisError();
    setInputMode("screenshot");
    openFilePicker();
  }

  function handleUrlKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" || loading) return;

    event.preventDefault();
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

      if (inputMode === "url") {
        if (!url.trim()) return;
        if (validateWebsiteUrl(url)) return;
      } else if (!uploadedImage) {
        return;
      }

      setLoading(true);
      setProgress(0);
      clearAnalysisError();

      const startedAt = performance.now();
      progressTimer = setInterval(() => {
        latestProgress = getTimeBasedProgress(performance.now() - startedAt);
        setProgress(latestProgress);
      }, PROGRESS_TICK_MS);

      const form = new FormData();

      if (inputMode === "url") {
        form.append("url", url);
      } else if (uploadedImage) {
        form.append("screenshot", uploadedImage);
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: form,
      });

      const json = await res.json().catch(() => null);

      if (res.status === 429) {
        stopProgressTimer();
        setProgress(0);
        setLoading(false);
        const retryAfter = Number(res.headers.get("Retry-After"));
        failAnalysis(
          "rate_limit",
          getRateLimitMessage(Number.isFinite(retryAfter) ? retryAfter : null)
        );
        return;
      }

      const analysisFailureKind: Exclude<AnalyzeErrorKind, null | "rate_limit" | "storage"> =
        inputMode === "url" ? "url_analysis" : "screenshot_analysis";

      if (!res.ok || !json) {
        stopProgressTimer();
        setProgress(0);
        setLoading(false);
        failAnalysis(
          analysisFailureKind,
          json?.error || "Something went wrong during analysis. Please try again."
        );
        return;
      }

      if (!isValidAuditResponse(json)) {
        stopProgressTimer();
        setProgress(0);
        setLoading(false);
        failAnalysis(
          analysisFailureKind,
          json?.error || "Analysis returned an incomplete report. Please try again."
        );
        return;
      }

      const reportId =
        typeof json.reportId === "string" && json.reportId.trim()
          ? json.reportId.trim()
          : generateReportId();

      const flat: AuditResponseFlat = {
        url: json.url ?? url ?? "",
        score: json.score ?? 0,
        risk: json.risk === "medium" || json.risk === "high" ? json.risk : "low",
        summary: json.summary ?? "",
        verdict: json.verdict ?? "",
        key_observation: json.key_observation ?? "",
        confidence: json.confidence ?? 0,
        previewImage: typeof json.previewImage === "string" ? json.previewImage : undefined,
        ogPreviewImage:
          typeof json.ogPreviewImage === "string" ? json.ogPreviewImage : undefined,
        metric_observations: json.metric_observations,
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
        generatedAt:
          typeof json.generatedAt === "string" ? json.generatedAt : new Date().toISOString(),
      };

      try {
        saveReport(reportId, flat);
      } catch {
        stopProgressTimer();
        setProgress(0);
        setLoading(false);
        failAnalysis(
          "storage",
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
    } catch (caught: unknown) {
      stopProgressTimer();
      setProgress(0);
      failAnalysis(
        inputMode === "url" ? "url_analysis" : "screenshot_analysis",
        caught instanceof Error
          ? caught.message
          : "Something went wrong while analyzing the website."
      );
    } finally {
      setLoading(false);
    }
  }

  return {
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
    isRateLimited,
    progress,
    inputMode,
    setInputMode,
    showUrlError,
    urlValidationError,
    isButtonDisabled,
    loadingLabel: getLoadingLabel(progress),
    handleAnalyze,
    handleImageUpload,
    handleUrlKeyDown,
    openFilePicker,
    switchToScreenshotUpload,
  };
}
