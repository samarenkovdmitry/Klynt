/** Third-party analytics, ads, and session replay — safe to block during screenshot capture. */
export const SCREENSHOT_TRACKER_PATTERN =
  /google-analytics|googletagmanager|googlesyndication|googleadservices|facebook\.net|facebook\.com\/tr|hotjar|segment\.(com|io)|intercom|clarity\.ms|doubleclick|sentry\.io|mixpanel|amplitude|optimizely|heap\.io|fullstory|crazyegg|mouseflow|luckyorange|quantserve|scorecardresearch|taboola|outbrain|adservice|adsystem|analytics|tracking|pixel|newrelic|datadoghq|bugsnag|logrocket|pendo\.io/i;

export function shouldBlockScreenshotRequest(
  resourceType: string,
  requestUrl: string
): boolean {
  if (
    resourceType === "media" ||
    resourceType === "websocket" ||
    resourceType === "eventsource"
  ) {
    return true;
  }

  return SCREENSHOT_TRACKER_PATTERN.test(requestUrl);
}
