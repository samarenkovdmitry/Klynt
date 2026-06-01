type ReportHeroPatternProps = {
  heroBg: string;
  className?: string;
};

const DOT_COLOR = "rgba(6,28,47,0.06)";

export function ReportHeroPattern({ heroBg, className = "" }: ReportHeroPatternProps) {
  const dotGridStyle = {
    backgroundImage: `radial-gradient(circle, ${DOT_COLOR} 1.25px, transparent 1.25px)`,
    backgroundSize: "20px 20px",
  } as const;

  return (
    <>
      <div
        className={`pointer-events-none absolute inset-0 ${className}`}
        style={{
          ...dotGridStyle,
          WebkitMaskImage:
            "linear-gradient(to bottom, #000 0%, #000 60%, transparent 92%)",
          maskImage: "linear-gradient(to bottom, #000 0%, #000 60%, transparent 92%)",
        }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 md:hidden"
        style={{
          background: `linear-gradient(to bottom, transparent, ${heroBg})`,
        }}
        aria-hidden
      />
    </>
  );
}
