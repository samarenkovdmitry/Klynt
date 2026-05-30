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

export function getReportHeroPatternMaskStyle(
  align: "left" | "right" = "left"
): ReportHeroPatternMaskStyle {
  const position = align === "right" ? "right top" : "left top";

  return {
    WebkitMaskImage: `url(${REPORT_HERO_PATTERN_URL})`,
    maskImage: `url(${REPORT_HERO_PATTERN_URL})`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: position,
    maskPosition: position,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
  };
}
