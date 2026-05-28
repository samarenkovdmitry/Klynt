"use client";

import { useCallback, useEffect, useState } from "react";

import { isPreLaunchWaitlistActive, preLaunch } from "@/lib/pre-launch";

export function usePreLaunchWaitlist(isDemoReport: boolean) {
  const [unlocked, setUnlocked] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!isPreLaunchWaitlistActive() || isDemoReport) {
      setUnlocked(true);
      setHydrated(true);
      return;
    }

    setUnlocked(
      localStorage.getItem(preLaunch.waitlist.storageKey) === "true"
    );
    setHydrated(true);
  }, [isDemoReport]);

  const unlock = useCallback(() => {
    localStorage.setItem(preLaunch.waitlist.storageKey, "true");
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
