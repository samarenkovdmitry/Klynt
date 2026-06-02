"use client";

import { useEffect, useState } from "react";

export function useWaitlistGateInView(enabled = true) {
  const [gateInView, setGateInView] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setGateInView(false);
      return;
    }

    let observer: IntersectionObserver | null = null;
    let retryTimer: number | undefined;

    const attach = () => {
      const gate = document.getElementById("waitlist-gate");
      if (!gate) {
        return false;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          setGateInView(entry.isIntersecting);
        },
        { threshold: 0.12 }
      );

      observer.observe(gate);
      return true;
    };

    if (!attach()) {
      retryTimer = window.setInterval(() => {
        if (attach()) {
          window.clearInterval(retryTimer);
        }
      }, 100);
    }

    return () => {
      if (retryTimer) {
        window.clearInterval(retryTimer);
      }

      observer?.disconnect();
    };
  }, [enabled]);

  return gateInView;
}
