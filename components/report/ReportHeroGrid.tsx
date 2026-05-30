type ReportHeroGridProps = {
  gridColor: string;
  className?: string;
};

export function ReportHeroGrid({ gridColor, className = "" }: ReportHeroGridProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-y-0 right-0 w-[58%] max-w-[620px] overflow-hidden opacity-90 md:w-[60%] ${className}`}
      style={{
        backgroundImage: `
          repeating-linear-gradient(
            to right,
            ${gridColor} 0,
            ${gridColor} 1px,
            transparent 1px,
            transparent 48px
          ),
          repeating-linear-gradient(
            to bottom,
            ${gridColor} 0,
            ${gridColor} 1px,
            transparent 1px,
            transparent 24px
          )
        `,
      }}
    />
  );
}
