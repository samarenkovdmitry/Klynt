/** Viewport presets for desktop + mobile capture passes. */
export const DESKTOP_CAPTURE_VIEWPORT = {
  width: 1280,
  height: 1200,
  deviceScaleFactor: 1,
} as const;

/** iPhone-class width used for responsive comparison (390 CSS px). */
export const MOBILE_CAPTURE_VIEWPORT = {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
} as const;
