import { REPORT_CARD_CLASS } from "@/components/report/reportStyles";
import { ReportIndexBadge } from "@/components/report/ReportIndexBadge";

type ReportLockedSkeletonCardProps = {
  index: number;
};

export function ReportLockedSkeletonCard({ index }: ReportLockedSkeletonCardProps) {
  return (
    <div
      className={`${REPORT_CARD_CLASS} pointer-events-none select-none opacity-70`}
      aria-hidden
    >
      <div className="flex flex-col gap-5 md:flex-row md:gap-6">
        <div className="hidden items-start justify-center pt-0.5 md:flex">
          <ReportIndexBadge index={index} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-start justify-between gap-3 md:hidden">
            <ReportIndexBadge index={index} />
            <div className="h-9 w-[108px] rounded-full bg-[#EEF2F6]" />
          </div>

          <div className="space-y-2.5">
            <div className="h-5 w-[92%] rounded-full bg-[#EEF2F6] md:h-6" />
            <div className="h-4 w-[68%] rounded-full bg-[#EEF2F6]" />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <div className="h-7 w-[88px] rounded-lg bg-[#EEF2F6]" />
            <div className="h-7 w-[104px] rounded-lg bg-[#EEF2F6]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReportLockedCopySkeletonCard({ index }: ReportLockedSkeletonCardProps) {
  return (
    <div
      className={`${REPORT_CARD_CLASS} pointer-events-none select-none opacity-70`}
      aria-hidden
    >
      <div className="flex flex-col gap-5 md:flex-row md:gap-6">
        <div className="hidden items-start justify-center pt-0.5 md:flex">
          <ReportIndexBadge index={index} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-4 h-4 w-24 rounded-full bg-[#EEF2F6] md:hidden" />
          <div className="mb-4 h-5 w-[75%] rounded-full bg-[#EEF2F6]" />

          <div className="grid gap-3 md:gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-[rgba(6,28,47,0.06)] bg-[#F8FAFC] p-5">
              <div className="mb-3 h-3 w-14 rounded-full bg-[#EEF2F6]" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded-full bg-[#EEF2F6]" />
                <div className="h-4 w-[80%] rounded-full bg-[#EEF2F6]" />
              </div>
            </div>

            <div className="rounded-2xl border border-[rgba(6,28,47,0.06)] bg-[#F8FAFC] p-5">
              <div className="mb-3 h-3 w-16 rounded-full bg-[#EEF2F6]" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded-full bg-[#EEF2F6]" />
                <div className="h-4 w-[70%] rounded-full bg-[#EEF2F6]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
