/**
 * Pre-launch / Product Hunt mode.
 *
 * Set `enabled: false` to revert all pre-launch UI (banner, waitlist, etc.) in one place.
 */
export const preLaunch = {
  enabled: true,
  /** ISO date (YYYY-MM-DD) of the Product Hunt launch day. */
  productHuntLaunchDate: "2026-06-02",
  productHunt: {
    /** Featured badge above landing hero (official PH embed). */
    featuredBadgeEnabled: false,
    productUrl:
      "https://www.producthunt.com/products/klynt-3?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-klynt-3",
    badgeImageUrl:
      "https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1161583&theme=dark",
  },
  waitlist: {
    enabled: true,
    /** Inclusive end date (YYYY-MM-DD). Waitlist gate is off through this day. */
    pausedUntil: "2026-06-12",
    storageKey: "klynt-waitlist-unlocked",
  },
} as const;

export function isPreLaunchEnabled() {
  return preLaunch.enabled;
}

export function isProductHuntFeaturedBadgeEnabled() {
  return preLaunch.enabled && preLaunch.productHunt.featuredBadgeEnabled;
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
