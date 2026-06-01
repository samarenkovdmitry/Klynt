export function ReportIndexBadge({ index }: { index: number }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(6,28,47,0.06)] bg-[#F8FAFC] text-[15px] font-medium leading-[22.5px] text-[#8E99A2]">
      {index + 1}
    </div>
  );
}
