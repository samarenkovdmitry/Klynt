/**
 * Pre-launch / Product Hunt mode.
 *
 * Set `enabled: false` to revert all pre-launch UI (banner, waitlist, etc.) in one place.
 */
export const preLaunch = {
  enabled: true,
  /** ISO date (YYYY-MM-DD) of the Product Hunt launch day. */
  productHuntLaunchDate: "2026-06-02",
  waitlist: {
    enabled: true,
    /** Inclusive end date (YYYY-MM-DD). Waitlist gate is off through this day. */
    pausedUntil: "2026-06-04",
    storageKey: "klynt-waitlist-unlocked",
  },
} as const;

export function isPreLaunchEnabled() {
  return preLaunch.enabled;
}

function isWaitlistPaused(now = new Date()): boolean {
  const pausedUntil = preLaunch.waitlist.pausedUntil;
  if (!pausedUntil) {
    return false;
  }

  const [year, month, day] = pausedUntil.split("-").map(Number);
  const pauseEndDay = new Date(year, month - 1, day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return today.getTime() <= pauseEndDay.getTime();
}

export function isPreLaunchWaitlistActive() {
  return preLaunch.enabled && preLaunch.waitlist.enabled && !isWaitlistPaused();
}

export function getDaysUntilProductHuntLaunch(now = new Date()): number {
  const [year, month, day] = preLaunch.productHuntLaunchDate.split("-").map(Number);
  const launchDay = new Date(year, month - 1, day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = launchDay.getTime() - today.getTime();

  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function getProductHuntCountdownLabel(days = getDaysUntilProductHuntLaunch()): string {
  if (days === 0) {
    return "Launching on Product Hunt today 🚀";
  }

  if (days === 1) {
    return "1 day until Product Hunt launch 🚀";
  }

  return `${days} days until Product Hunt launch 🚀`;
}

export type ReportWaitlistLockedSummary = {
  domain: string;
  remainingIssues: number;
  remainingSuggestions: number;
  remainingCopy: number;
};
