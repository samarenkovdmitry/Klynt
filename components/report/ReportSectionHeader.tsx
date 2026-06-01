type ReportSectionHeaderProps = {
  title: string;
  count: number;
};

export function ReportSectionHeader({ title, count }: ReportSectionHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <h3 className="text-[20px] font-bold tracking-[-0.02em] text-[#061C2F] md:text-[22px]">
        {title}
      </h3>
      <span className="rounded-full border border-[rgba(6,28,47,0.10)] px-2.5 py-0.5 text-[13px] font-medium tabular-nums leading-5 text-[#7D8C99]">
        {count}
      </span>
    </div>
  );
}
