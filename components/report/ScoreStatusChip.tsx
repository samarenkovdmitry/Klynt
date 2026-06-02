type ScoreStatusChipProps = {
  score: string;
  tierLabel: string;
  badgeBg: string;
  className?: string;
};

export function ScoreStatusChip({
  score,
  tierLabel,
  badgeBg,
  className = "",
}: ScoreStatusChipProps) {
  return (
    <div
      className={`inline-flex h-8 items-center gap-2 rounded-full border pl-1 pr-3 ${className}`}
      style={{
        borderColor: `${badgeBg}33`,
        backgroundColor: `${badgeBg}14`,
      }}
    >
      <span
        className="inline-flex h-6 min-w-[30px] items-center justify-center rounded-full px-2 text-[12px] font-bold leading-none tracking-[-0.03em] text-white md:text-[13px]"
        style={{ backgroundColor: badgeBg }}
      >
        {score}
      </span>
      <span className="text-[13px] font-medium leading-none" style={{ color: badgeBg }}>
        {tierLabel}
      </span>
    </div>
  );
}
