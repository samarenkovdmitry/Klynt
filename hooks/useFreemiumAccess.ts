"use client";

import { useCallback, useEffect, useState } from "react";

import { freemium, isFreemiumEnabled } from "@/lib/freemium";

function readWaitlistJoined(): boolean {
  try {
    return localStorage.getItem(freemium.waitlistStorageKey) === "true";
  } catch {
    return false;
  }
}

export function useFreemiumAccess(isDemoReport: boolean) {
  const [waitlistJoined, setWaitlistJoined] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!isFreemiumEnabled() || isDemoReport) {
      setWaitlistJoined(true);
      setHydrated(true);
      return;
    }

    setWaitlistJoined(readWaitlistJoined());
    setHydrated(true);
  }, [isDemoReport]);

  const markWaitlistJoined = useCallback(() => {
    try {
      localStorage.setItem(freemium.waitlistStorageKey, "true");
    } catch {
      // ignore
    }

    setWaitlistJoined(true);
  }, []);

  const active = hydrated && isFreemiumEnabled() && !isDemoReport;

  return {
    hydrated,
    active,
    /** Full Pro access — demo + freemium off only for now */
    isPro: !active,
    exportLocked: active && freemium.hardLockExport,
    previewLocked: active,
    waitlistJoined,
    markWaitlistJoined,
  };
}
