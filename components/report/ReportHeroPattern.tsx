import {
  getReportHeroPatternDesktopMaskStyle,
  getReportHeroPatternMobileMaskStyle,
  REPORT_HERO_PATTERN_HEIGHT,
  REPORT_HERO_PATTERN_WIDTH,
  type ReportHeroPatternMaskStyle,
} from "@/lib/report-hero-pattern";

type ReportHeroPatternProps = {
  gridColor: string;
  heroBg: string;
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

const PATTERN_FADE_MASK =
  "linear-gradient(to bottom, #000 0%, #000 58%, transparent 100%)";

export function ReportHeroPattern({
  gridColor,
  heroBg,
  className = "",
}: ReportHeroPatternProps) {
  return (
    <>
      <div
        className={`pointer-events-none absolute right-0 top-0 hidden w-[620px] max-w-[60%] md:block ${className}`}
        style={{
          height: REPORT_HERO_PATTERN_HEIGHT,
          WebkitMaskImage: PATTERN_FADE_MASK,
          maskImage: PATTERN_FADE_MASK,
        }}
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
          WebkitMaskImage: PATTERN_FADE_MASK,
          maskImage: PATTERN_FADE_MASK,
        }}
        aria-hidden
      >
        <TintedPattern
          gridColor={gridColor}
          maskStyle={getReportHeroPatternMobileMaskStyle()}
          className="h-full w-full"
        />
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 md:hidden"
        style={{
          background: `linear-gradient(to bottom, transparent, ${heroBg})`,
        }}
        aria-hidden
      />
    </>
  );
}
