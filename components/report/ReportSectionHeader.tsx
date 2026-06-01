type ReportSectionHeaderProps = {
  title: string;
  count: number;
  countNoun?: string;
  eyebrow?: string;
};

export function ReportSectionHeader({
  title,
  count,
  countNoun = "items",
  eyebrow,
}: ReportSectionHeaderProps) {
  return (
    <div className="border-t border-[rgba(6,28,47,0.06)] pt-10">
      {eyebrow ? (
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#8F99A2]">
          {eyebrow}
        </p>
      ) : null}
      <div
        className={[
          "flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4",
          eyebrow ? "mt-2" : "",
        ].join(" ")}
      >
        <h3 className="text-[22px] font-bold tracking-[-0.02em] text-[#061C2F] md:text-[24px]">
          {title}
        </h3>
        <p className="text-[14px] font-normal leading-5 text-[#7D8C99]">
          {count} {countNoun}
        </p>
      </div>
    </div>
  );
}
