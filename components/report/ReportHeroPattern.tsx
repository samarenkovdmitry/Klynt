import { getReportHeroPatternMaskStyle } from "@/lib/report-hero-pattern";

type ReportHeroPatternProps = {
  gridColor: string;
  className?: string;
};

function TintedPattern({
  gridColor,
  className = "",
}: {
  gridColor: string;
  className?: string;
}) {
  return (
    <div
      className={`h-full w-full ${className}`}
      style={{
        backgroundColor: gridColor,
        ...getReportHeroPatternMaskStyle(),
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
        className={`pointer-events-none absolute inset-y-0 left-0 hidden w-[min(620px,58%)] overflow-hidden md:block ${className}`}
        aria-hidden
      >
        <TintedPattern gridColor={gridColor} />
      </div>

      <div
        className={`pointer-events-none absolute inset-y-0 left-0 w-full overflow-hidden md:hidden ${className}`}
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, #000 0%, #000 62%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, #000 0%, #000 62%, transparent 100%)",
        }}
        aria-hidden
      >
        <TintedPattern gridColor={gridColor} />
      </div>
    </>
  );
}
