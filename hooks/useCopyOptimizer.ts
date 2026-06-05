"use client";

import { useState, type KeyboardEvent } from "react";

import { COPY_OPTIMIZE_FALLBACK_ERROR, isJsonParseErrorMessage } from "@/lib/api-errors";
import type { CopyOptimizerResult } from "@/lib/copy-optimize";
import { parseApiJsonResponse } from "@/lib/parse-api-response";
import { validateWebsiteUrl } from "@/lib/validate-website-url";

const ESTIMATED_MS = 12_000;
const MAX_PROGRESS = 92;
const PROGRESS_TICK_MS = 50;

const LOADING_STEPS = [
  { threshold: 15, label: "Capturing hero section…" },
  { threshold: 40, label: "Reading headline and CTA…" },
  { threshold: 70, label: "Rewriting for clarity…" },
  { threshold: 100, label: "Finalizing suggestions…" },
] as const;

function getTimeBasedProgress(elapsedMs: number) {
  const tau = ESTIMATED_MS / 2.8;
  const value = MAX_PROGRESS * (1 - Math.exp(-elapsedMs / tau));
  return Math.min(MAX_PROGRESS, value);
}

function getLoadingLabel(progress: number) {
  const step = [...LOADING_STEPS].reverse().find((item) => progress >= item.threshold);
  return step?.label ?? LOADING_STEPS[0].label;
}

export function useCopyOptimizer() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CopyOptimizerResult | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const urlValidationError = url.trim() ? validateWebsiteUrl(url) : null;
  const showUrlError = formSubmitted && Boolean(urlValidationError);
  const isButtonDisabled = loading || !url.trim();
  const loadingLabel = getLoadingLabel(progress);

  function clearUrl() {
    setUrl("");
    setFormSubmitted(false);
    setError(null);
  }

  function resetToInput() {
    setResult(null);
    setError(null);
    setFormSubmitted(false);
    setProgress(0);
  }

  async function optimize() {
    setFormSubmitted(true);

    if (!url.trim()) return;
    if (validateWebsiteUrl(url)) return;
    setError(null);
    setResult(null);
    setLoading(true);
    setProgress(0);

    const startedAt = performance.now();
    const progressTimer = window.setInterval(() => {
      setProgress(getTimeBasedProgress(performance.now() - startedAt));
    }, PROGRESS_TICK_MS);

    try {
      const response = await fetch("/api/copy-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const { data: payload, error: responseError } =
        await parseApiJsonResponse<CopyOptimizerResult & { error?: string }>(
          response,
          COPY_OPTIMIZE_FALLBACK_ERROR
        );

      if (responseError || !payload) {
        throw new Error(responseError || COPY_OPTIMIZE_FALLBACK_ERROR);
      }

      setProgress(100);
      setResult(payload);
    } catch (optimizeError) {
      const message =
        optimizeError instanceof Error ? optimizeError.message.trim() : "";

      setError(
        !message || isJsonParseErrorMessage(message)
          ? COPY_OPTIMIZE_FALLBACK_ERROR
          : message
      );
    } finally {
      window.clearInterval(progressTimer);
      setLoading(false);
    }
  }

  function handleUrlKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" || loading) return;

    event.preventDefault();
    void optimize();
  }

  return {
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
  };
}
