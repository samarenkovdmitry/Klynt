export const ANALYZE_MODEL = "gpt-4.1-nano";

export const VIEWPORT = {
  width: 800,
  height: 700,
  deviceScaleFactor: 1,
} as const;

export const PAGE_GOTO_TIMEOUT_MS = 8_000;
export const SCROLL_SETTLE_MS = 50;

export const TRACKER_PATTERN =
  /google-analytics|googletagmanager|googlesyndication|googleadservices|doubleclick|facebook\.net|hotjar|segment\.(com|io)|intercom|clarity\.ms|sentry\.io|mixpanel|amplitude|fullstory|optimizely|heap\.io|licdn\.com|linkedin\.com\/px|tiktok\.com\/i18n|bat\.bing\.com|adservice|cookielaw|onetrust|cookiebot|hubspot|hs-scripts|hs-analytics|newrelic|datadoghq|mouseflow|crazyegg|luckyorange|quantserve|scorecardresearch|ads\.twitter|analytics\.twitter/i;

export const BLOCKED_RESOURCE_TYPES = new Set([
  "font",
  "media",
  "websocket",
  "manifest",
  "ping",
  "events",
]);

/** Max width sent to the vision model — keeps tokens low while preserving layout detail. */
export const VISION_MAX_WIDTH = 768;
export const VISION_JPEG_QUALITY = 55;

export const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export const ANALYSIS_PROMPT = `You are a senior SaaS UX auditor (clarity, conversion, positioning).

Analyze ONLY what is visible in the screenshot(s). Never invent UI. No generic advice — name the actual element/section.

Return ONLY valid JSON (no markdown):

{
  "url": "string",
  "score": number,
  "risk": "low"|"medium"|"high",
  "summary": "string",
  "verdict": "string",
  "key_observation": "string",
  "confidence": number,
  "issues": [{
    "category": "Clarity"|"Navigation"|"Visuals"|"Trust"|"Conversion",
    "title": "one concrete sentence",
    "bullets": ["2-3 short evidence tags"],
    "why": "string",
    "impact": { "clarity"?: int, "navigation"?: int, "visuals"?: int, "trust"?: int, "conversion"?: int, "cta"?: int }
  }],
  "suggestions": [{
    "category": "Clarity"|"Navigation"|"Visuals"|"Trust"|"Conversion",
    "section": "string",
    "recommendation": "string",
    "why": "string",
    "impact": { ...same keys, positive ints only }
  }],
  "copy": [{
    "section": "string",
    "before": "exact visible copy",
    "after": "clearer rewrite",
    "why": "string",
    "impact": { ...same keys, positive ints only }
  }],
  "breakdown": { "clarity": int, "navigation": int, "visuals": int, "trust": int, "conversion": int }
}

Counts: exactly 4 issues, 3 suggestions, 3 copy (different sections).
Lengths: summary 14-22 words; verdict 6-10 words; key_observation max 14 words; why fields max 28 words each.
issues[].title: exactly ONE sentence (12-22 words). State what is wrong on THIS page, what users fail to understand, where friction happens, and why it hurts conversion. Name the visible section/element when possible. NEVER use abstract audit labels (e.g. "Weak visual hierarchy", "Messaging clarity issues", "CTA optimization gap", "Navigation friction", "Low clarity").
Good title: "The hero headline never states who the product is for, so visitors can't judge fit before scrolling."
Bad title: "Weak visual hierarchy"
Impact: issues use negative ints (-5 to -25); suggestions/copy use positive (5-20). Pick top 1-2 impact keys per item.
confidence: integer 70-98. breakdown: integers 0-100. score: integer 0-100 aligned with breakdown.
Copy: improve clarity (what/who/outcome), not hype. Preserve brand tone.`;
