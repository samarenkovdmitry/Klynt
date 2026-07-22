"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type {
  AudienceType,
  BrandStage,
  HeadlineDirections,
  ReportCopyVariants,
  ReportScorePotential,
  ReportVisualFix,
  TrafficSource,
} from "@/lib/audit-report";
import type { HeroSlot } from "@/components/report-v2/ReportHero";
import {
  DEFAULT_AUDIENCE_TYPE,
  DEFAULT_TRAFFIC_SOURCE,
  readStoredAudienceType,
  readStoredTrafficSource,
  writeStoredAudienceType,
  writeStoredTrafficSource,
} from "@/lib/audit-context";
import {
  DEFAULT_BRAND_STAGE,
  readStoredBrandStage,
  writeStoredBrandStage,
} from "@/lib/brand-stage";
import { generateReportId } from "@/lib/report-id";
import { buildReportPath } from "@/lib/report-route";
import {
  ANALYZE_CLIENT_RETRY_DELAY_MS,
  postAnalyzeRequest,
  warmAnalyzeRuntime,
} from "@/lib/analyze-client-request";
import { ANALYZE_FALLBACK_ERROR } from "@/lib/api-errors";
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
  brand_stage?: BrandStage;
  traffic_source?: TrafficSource;
  audience_type?: AudienceType;
  headline_directions?: HeadlineDirections;
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
  copy_variants?: ReportCopyVariants;
  visual_fixes?: ReportVisualFix[];
  score_potential?: ReportScorePotential;
  hero_slot?: HeroSlot | null;
  generatedAt: string;
};

const ESTIMATED_ANALYSIS_MS = 18_000;
const MAX_PROGRESS_WHILE_WAITING = 92;
const PROGRESS_TICK_MS = 50;
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
  const autostartHandledRef = useRef(false);
  const runAnalysisRef = useRef<(urlOverride?: string) => Promise<void>>(async () => {});

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
  const [brandStage, setBrandStage] = useState<BrandStage>(DEFAULT_BRAND_STAGE);
  const [trafficSource, setTrafficSource] = useState<TrafficSource>(
    DEFAULT_TRAFFIC_SOURCE
  );
  const [audienceType, setAudienceType] = useState<AudienceType>(
    DEFAULT_AUDIENCE_TYPE
  );

  useEffect(() => {
    setBrandStage(readStoredBrandStage());
    setTrafficSource(readStoredTrafficSource());
    setAudienceType(readStoredAudienceType());
    warmAnalyzeRuntime();
  }, []);

  useEffect(() => {
    const prefill = searchParams.get("url")?.trim() ?? "";
    const shouldAutostart = searchParams.get("autostart") === "1";

    if (prefill) {
      setUrl(prefill);
      setInputMode("url");
    }

    if (!shouldAutostart || autostartHandledRef.current) {
      return;
    }

    autostartHandledRef.current = true;

    const params = new URLSearchParams(searchParams.toString());
    params.delete("autostart");
    const query = params.toString();
    router.replace(query ? `/analyze?${query}` : "/analyze", { scroll: false });

    setFormSubmitted(true);

    if (!prefill || validateWebsiteUrl(prefill)) {
      return;
    }

    void runAnalysisRef.current(prefill);
  }, [router, searchParams]);

  const urlValidationError = url.trim() ? validateWebsiteUrl(url) : "Enter a website URL";
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

  async function runAnalysis(urlOverride?: string) {
    const activeMode: AnalyzeInputMode = urlOverride ? "url" : inputMode;
    const activeUrl = urlOverride ?? url;
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

      if (activeMode === "url") {
        if (!activeUrl.trim()) return;
        if (validateWebsiteUrl(activeUrl)) return;
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

      if (activeMode === "url") {
        form.append("url", activeUrl);
      } else if (uploadedImage) {
        form.append("screenshot", uploadedImage);
      }

      form.append("brandStage", brandStage);
      form.append("trafficSource", trafficSource);
      form.append("audienceType", audienceType);

      const analysisFailureKind: Exclude<AnalyzeErrorKind, null | "rate_limit" | "storage"> =
        activeMode === "url" ? "url_analysis" : "screenshot_analysis";

      let outcome = await postAnalyzeRequest(form);

      if (outcome.kind === "error" && outcome.retryable) {
        await new Promise((resolve) =>
          setTimeout(resolve, ANALYZE_CLIENT_RETRY_DELAY_MS)
        );
        outcome = await postAnalyzeRequest(form);
      }

      if (outcome.kind === "rate_limit") {
        stopProgressTimer();
        setProgress(0);
        setLoading(false);
        failAnalysis("rate_limit", getRateLimitMessage(outcome.retryAfter));
        return;
      }

      if (outcome.kind === "error") {
        stopProgressTimer();
        setProgress(0);
        setLoading(false);
        failAnalysis(analysisFailureKind, outcome.message);
        return;
      }

      const json = outcome.data as { reportId?: string; reportSlug?: string };

      const reportId =
        typeof json.reportId === "string" && json.reportId.trim()
          ? json.reportId.trim()
          : "";

      if (!reportId) {
        stopProgressTimer();
        setProgress(0);
        setLoading(false);
        failAnalysis(analysisFailureKind, ANALYZE_FALLBACK_ERROR);
        return;
      }

      const narrativeRes = await fetch("/api/narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });

      if (!narrativeRes.ok) {
        stopProgressTimer();
        setProgress(0);
        setLoading(false);
        const narrativeError = await narrativeRes.json().catch(() => null);
        const message =
          typeof narrativeError?.error === "string" && narrativeError.error.trim()
            ? narrativeError.error.trim()
            : "Report generation failed. Please try again.";
        failAnalysis(analysisFailureKind, message);
        return;
      }

      stopProgressTimer();
      setProgress(100);

      const reportSlug =
        typeof json.reportSlug === "string" && json.reportSlug.trim()
          ? json.reportSlug.trim()
          : null;
      const reportPath = reportSlug ? `/report/${reportSlug}` : buildReportPath(reportId, activeUrl);

      router.push(reportPath);
    } catch (caught: unknown) {
      stopProgressTimer();
      setProgress(0);
      failAnalysis(
        activeMode === "url" ? "url_analysis" : "screenshot_analysis",
        caught instanceof Error
          ? caught.message
          : "Something went wrong while analyzing the website."
      );
    } finally {
      setLoading(false);
    }
  }

  runAnalysisRef.current = runAnalysis;

  async function handleAnalyze() {
    await runAnalysis();
  }

  function handleBrandStageChange(stage: BrandStage) {
    setBrandStage(stage);
    writeStoredBrandStage(stage);
  }

  function handleTrafficSourceChange(source: TrafficSource) {
    setTrafficSource(source);
    writeStoredTrafficSource(source);
  }

  function handleAudienceTypeChange(audience: AudienceType) {
    setAudienceType(audience);
    writeStoredAudienceType(audience);
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
    brandStage,
    setBrandStage: handleBrandStageChange,
    trafficSource,
    setTrafficSource: handleTrafficSourceChange,
    audienceType,
    setAudienceType: handleAudienceTypeChange,
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
