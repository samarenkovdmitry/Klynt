export function ReportIndexBadge({
  index,
  className,
}: {
  index: number;
  className?: string;
}) {
  return (
    <span
      className={[
        "w-5 shrink-0 text-[16px] font-medium tabular-nums leading-5 text-[#B0B8C4]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {index + 1}
    </span>
  );
}
