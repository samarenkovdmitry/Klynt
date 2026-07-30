/** CSS display size in the report hero browser frame. */
export const REPORT_PREVIEW_DISPLAY_WIDTH = 310;
export const REPORT_PREVIEW_DISPLAY_HEIGHT = 190;

/** Stored/transmitted preview asset size (2x display for retina). */
export const REPORT_PREVIEW_WIDTH = 620;
export const REPORT_PREVIEW_HEIGHT = 380;

/** Mobile hero preview — preserves narrow viewport aspect (390 CSS px wide). */
export const REPORT_MOBILE_PREVIEW_WIDTH = 390;
/** Above-the-fold crop — shorter than full 844px device height. */
export const REPORT_MOBILE_PREVIEW_HEIGHT = 520;

/** Phone frame display width in ReportMobileSection. */
export const REPORT_MOBILE_PREVIEW_DISPLAY_WIDTH = 168;

export const REPORT_OG_WIDTH = 1200;
export const REPORT_OG_HEIGHT = 630;

/** OG browser-frame content area — same 620:380 ratio as the report hero preview. */
export const REPORT_OG_PREVIEW_WIDTH = 500;
export const REPORT_OG_PREVIEW_HEIGHT = Math.round(
  (REPORT_OG_PREVIEW_WIDTH * REPORT_PREVIEW_HEIGHT) / REPORT_PREVIEW_WIDTH
);

export const REPORT_OG_BROWSER_CHROME_HEIGHT = 46;
