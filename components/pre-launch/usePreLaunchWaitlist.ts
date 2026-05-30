"use client";

import { useCallback, useEffect, useState } from "react";

import { isPreLaunchWaitlistActive, preLaunch } from "@/lib/pre-launch";

function readWaitlistUnlocked(): boolean {
  try {
    return localStorage.getItem(preLaunch.waitlist.storageKey) === "true";
  } catch {
    return false;
  }
}

export function usePreLaunchWaitlist(isDemoReport: boolean) {
  const [unlocked, setUnlocked] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!isPreLaunchWaitlistActive() || isDemoReport) {
      setUnlocked(true);
      setHydrated(true);
      return;
    }

    setUnlocked(readWaitlistUnlocked());
    setHydrated(true);
  }, [isDemoReport]);

  const unlock = useCallback(() => {
    try {
      localStorage.setItem(preLaunch.waitlist.storageKey, "true");
    } catch {
      // Ignore storage failures — unlock for this session anyway
    }

    setUnlocked(true);
  }, []);

  const waitlistActive =
    hydrated && isPreLaunchWaitlistActive() && !isDemoReport && !unlocked;

  return {
    hydrated,
    unlocked: !waitlistActive,
    waitlistActive,
    unlock,
  };
}
