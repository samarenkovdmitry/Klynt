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
    storageKey: "klynt-waitlist-unlocked",
  },
} as const;

export function isPreLaunchEnabled() {
  return preLaunch.enabled;
}

export function isPreLaunchWaitlistActive() {
  return preLaunch.enabled && preLaunch.waitlist.enabled;
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
