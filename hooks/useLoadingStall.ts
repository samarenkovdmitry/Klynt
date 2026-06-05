"use client";

import { useEffect, useState } from "react";

const DEFAULT_STALL_THRESHOLD = 88;
const DEFAULT_STALL_DELAY_MS = 4500;

export function useLoadingStall(
  loading: boolean,
  progress: number,
  options?: { threshold?: number; delayMs?: number }
) {
  const threshold = options?.threshold ?? DEFAULT_STALL_THRESHOLD;
  const delayMs = options?.delayMs ?? DEFAULT_STALL_DELAY_MS;
  const [loadingStalled, setLoadingStalled] = useState(false);

  useEffect(() => {
    if (!loading || progress < threshold) {
      setLoadingStalled(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setLoadingStalled(true);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
      setLoadingStalled(false);
    };
  }, [loading, progress, threshold, delayMs]);

  return loadingStalled;
}
