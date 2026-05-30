export const REPORT_HERO_PATTERN_URL = "/report/klynt-analyze-bg.svg";

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

export function getReportHeroPatternMaskStyle(): ReportHeroPatternMaskStyle {
  return {
    WebkitMaskImage: `url(${REPORT_HERO_PATTERN_URL})`,
    maskImage: `url(${REPORT_HERO_PATTERN_URL})`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "left top",
    maskPosition: "left top",
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
  };
}
