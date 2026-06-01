type ReportHeroPatternProps = {
  gridColor: string;
  heroBg: string;
  className?: string;
};

const PATTERN_FADE_MASK =
  "linear-gradient(to bottom, #000 0%, #000 58%, transparent 100%)";

export function ReportHeroPattern({
  gridColor,
  heroBg,
  className = "",
}: ReportHeroPatternProps) {
  const dotGridStyle = {
    backgroundImage: `radial-gradient(circle, ${gridColor} 1px, transparent 1px)`,
    backgroundSize: "24px 24px",
  } as const;

  return (
    <>
      <div
        className={`pointer-events-none absolute right-0 top-0 hidden w-[min(620px,60%)] opacity-[0.35] md:block ${className}`}
        style={{
          height: "100%",
          minHeight: 280,
          WebkitMaskImage: `${PATTERN_FADE_MASK}, linear-gradient(to left, #000 20%, transparent 88%)`,
          maskImage: `${PATTERN_FADE_MASK}, linear-gradient(to left, #000 20%, transparent 88%)`,
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
          ...dotGridStyle,
        }}
        aria-hidden
      />

      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-[240px] opacity-[0.28] md:hidden ${className}`}
        style={{
          WebkitMaskImage: PATTERN_FADE_MASK,
          maskImage: PATTERN_FADE_MASK,
          ...dotGridStyle,
        }}
        aria-hidden
      />

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
