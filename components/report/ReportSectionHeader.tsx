type ReportSectionHeaderProps = {
  title: string;
  count: number;
};

export function ReportSectionHeader({ title, count }: ReportSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h3 className="text-[20px] font-bold tracking-[-0.02em] text-[#061C2F] md:text-[22px]">
        {title}
      </h3>
      <span className="text-[16px] font-normal leading-5 text-[#7D8C99]">{count}</span>
    </div>
  );
}
