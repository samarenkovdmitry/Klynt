export function ReportIndexBadge({ index }: { index: number }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#DCE2E7] bg-white text-[15px] font-semibold leading-[22.5px] text-[#061C2F]">
      {index + 1}
    </div>
  );
}
