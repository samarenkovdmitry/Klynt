"use client";

import { useState, type KeyboardEvent } from "react";

import type { CopyOptimizerResult } from "@/lib/copy-optimize";
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
  const [showUrlError, setShowUrlError] = useState(false);

  const urlValidationError = validateWebsiteUrl(url);
  const isButtonDisabled = loading || !url.trim() || Boolean(urlValidationError);
  const loadingLabel = getLoadingLabel(progress);

  function clearUrl() {
    setUrl("");
    setShowUrlError(false);
    setError(null);
  }

  async function optimize() {
    const validationError = validateWebsiteUrl(url);
    if (validationError) {
      setShowUrlError(true);
      return;
    }

    setShowUrlError(false);
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

      const payload = (await response.json()) as CopyOptimizerResult & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Copy optimization failed. Please try again.");
      }

      setProgress(100);
      setResult(payload);
    } catch (optimizeError) {
      setError(
        optimizeError instanceof Error
          ? optimizeError.message
          : "Copy optimization failed. Please try again."
      );
    } finally {
      window.clearInterval(progressTimer);
      setLoading(false);
    }
  }

  function handleUrlKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !isButtonDisabled) {
      void optimize();
    }
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
  };
}
