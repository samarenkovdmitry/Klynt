import {
  getReportHeroPatternDesktopMaskStyle,
  getReportHeroPatternMobileMaskStyle,
  REPORT_HERO_PATTERN_HEIGHT,
  REPORT_HERO_PATTERN_WIDTH,
  type ReportHeroPatternMaskStyle,
} from "@/lib/report-hero-pattern";

type ReportHeroPatternProps = {
  gridColor: string;
  className?: string;
};

function TintedPattern({
  gridColor,
  maskStyle,
  className = "",
}: {
  gridColor: string;
  maskStyle: ReportHeroPatternMaskStyle;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: gridColor,
        ...maskStyle,
      }}
      aria-hidden
    />
  );
}

export function ReportHeroPattern({
  gridColor,
  className = "",
}: ReportHeroPatternProps) {
  return (
    <>
      <div
        className={`pointer-events-none absolute inset-y-0 right-0 hidden w-[620px] max-w-[60%] md:block ${className}`}
        aria-hidden
      >
        <TintedPattern
          gridColor={gridColor}
          maskStyle={getReportHeroPatternDesktopMaskStyle()}
          className="h-full w-full"
        />
      </div>

      <div
        className={`pointer-events-none absolute left-0 top-0 md:hidden ${className}`}
        style={{
          width: REPORT_HERO_PATTERN_WIDTH,
          height: REPORT_HERO_PATTERN_HEIGHT,
        }}
        aria-hidden
      >
        <TintedPattern
          gridColor={gridColor}
          maskStyle={getReportHeroPatternMobileMaskStyle()}
          className="h-full w-full"
        />
      </div>
    </>
  );
}
