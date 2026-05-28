/**
 * Pre-launch / Product Hunt mode.
 *
 * Set `enabled: false` to revert all pre-launch UI (banner, waitlist, etc.) in one place.
 */
export const preLaunch = {
  enabled: true,
  productHuntBanner: {
    label: "Launching on Product Hunt this Tuesday 🚀",
  },
  waitlist: {
    enabled: false,
  },
} as const;

export function isPreLaunchEnabled() {
  return preLaunch.enabled;
}
