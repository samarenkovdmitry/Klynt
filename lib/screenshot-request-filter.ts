/** Known third-party analytics, ads, and session-replay hosts (hostname match). */
const TRACKER_HOST_SUFFIXES = [
  "google-analytics.com",
  "analytics.google.com",
  "googletagmanager.com",
  "googlesyndication.com",
  "googleadservices.com",
  "doubleclick.net",
  "facebook.net",
  "hotjar.com",
  "hotjar.io",
  "segment.io",
  "segment.com",
  "intercom.io",
  "clarity.ms",
  "sentry.io",
  "mixpanel.com",
  "amplitude.com",
  "optimizely.com",
  "heap.io",
  "fullstory.com",
  "crazyegg.com",
  "mouseflow.com",
  "luckyorange.com",
  "quantserve.com",
  "scorecardresearch.com",
  "taboola.com",
  "outbrain.com",
  "newrelic.com",
  "datadoghq.com",
  "bugsnag.com",
  "logrocket.com",
  "pendo.io",
] as const;

function hostnameMatchesTracker(hostname: string): boolean {
  const host = hostname.toLowerCase();

  return TRACKER_HOST_SUFFIXES.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`)
  );
}

export function shouldBlockScreenshotRequest(
  resourceType: string,
  requestUrl: string
): boolean {
  if (resourceType === "media" || resourceType === "websocket") {
    return true;
  }

  try {
    return hostnameMatchesTracker(new URL(requestUrl).hostname);
  } catch {
    return false;
  }
}
