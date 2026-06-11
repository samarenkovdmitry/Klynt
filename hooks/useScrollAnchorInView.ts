"use client";

import { useEffect, useState } from "react";

export function useScrollAnchorInView(anchorId: string, enabled = true) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setInView(false);
      return;
    }

    let observer: IntersectionObserver | null = null;
    let retryTimer: number | undefined;

    const attach = () => {
      const anchor = document.getElementById(anchorId);
      if (!anchor) {
        return false;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          setInView(entry.isIntersecting);
        },
        { threshold: 0.12 }
      );

      observer.observe(anchor);
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
  }, [anchorId, enabled]);

  return inView;
}
