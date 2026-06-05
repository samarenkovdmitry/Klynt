"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_STALL_DISPLAY_PERCENT = 90;
const DEFAULT_STALL_DELAY_MS = 3000;

export function useLoadingStall(
  loading: boolean,
  progress: number,
  options?: { displayPercent?: number; delayMs?: number }
) {
  const displayPercent = options?.displayPercent ?? DEFAULT_STALL_DISPLAY_PERCENT;
  const delayMs = options?.delayMs ?? DEFAULT_STALL_DELAY_MS;
  const [loadingStalled, setLoadingStalled] = useState(false);
  const highProgressSinceRef = useRef<number | null>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    if (!loading) {
      highProgressSinceRef.current = null;
      setLoadingStalled(false);
      return;
    }

    const intervalId = window.setInterval(() => {
      const current = progressRef.current;
      const isHighProgress = Math.floor(current) >= displayPercent;

      if (!isHighProgress) {
        highProgressSinceRef.current = null;
        setLoadingStalled(false);
        return;
      }

      if (highProgressSinceRef.current === null) {
        highProgressSinceRef.current = performance.now();
      }

      const elapsed = performance.now() - highProgressSinceRef.current;
      setLoadingStalled(elapsed >= delayMs);
    }, 200);

    return () => {
      window.clearInterval(intervalId);
      highProgressSinceRef.current = null;
      setLoadingStalled(false);
    };
  }, [loading, displayPercent, delayMs]);

  return loadingStalled;
}
