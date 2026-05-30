export const REPORT_HERO_PATTERN_URL = "/report/klynt-analyze-bg.svg";
export const REPORT_HERO_PATTERN_WIDTH = 620;
export const REPORT_HERO_PATTERN_HEIGHT = 320;

export type ReportHeroPatternMaskStyle = {
  WebkitMaskImage: string;
  maskImage: string;
  WebkitMaskRepeat: string;
  maskRepeat: string;
  WebkitMaskPosition: string;
  maskPosition: string;
  WebkitMaskSize: string;
  maskSize: string;
};

export function getReportHeroPatternDesktopMaskStyle(): ReportHeroPatternMaskStyle {
  return {
    WebkitMaskImage: `url(${REPORT_HERO_PATTERN_URL})`,
    maskImage: `url(${REPORT_HERO_PATTERN_URL})`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "right top",
    maskPosition: "right top",
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
  };
}

export function getReportHeroPatternMobileMaskStyle(): ReportHeroPatternMaskStyle {
  return {
    WebkitMaskImage: `url(${REPORT_HERO_PATTERN_URL})`,
    maskImage: `url(${REPORT_HERO_PATTERN_URL})`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "left top",
    maskPosition: "left top",
    WebkitMaskSize: `${REPORT_HERO_PATTERN_WIDTH}px ${REPORT_HERO_PATTERN_HEIGHT}px`,
    maskSize: `${REPORT_HERO_PATTERN_WIDTH}px ${REPORT_HERO_PATTERN_HEIGHT}px`,
  };
}
