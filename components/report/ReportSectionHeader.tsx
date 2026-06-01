type ReportSectionHeaderProps = {
  title: string;
  count: number;
  withTopRule?: boolean;
};

export function ReportSectionHeader({
  title,
  count,
  withTopRule = false,
}: ReportSectionHeaderProps) {
  return (
    <div className={withTopRule ? "border-t border-[rgba(6,28,47,0.06)] pt-10" : ""}>
      <h3 className="text-[22px] font-bold tracking-[-0.02em] text-[#061C2F] md:text-[24px]">
        {title}
        <span className="font-normal text-[#7D8C99]"> · {count}</span>
      </h3>
    </div>
  );
}
