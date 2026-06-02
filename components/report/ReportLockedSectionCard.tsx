import { RiLock2Line } from "@remixicon/react";

type ReportLockedSectionCardProps = {
  title: string;
  count: number;
  description: string;
};

export function ReportLockedSectionCard({
  title,
  count,
  description,
}: ReportLockedSectionCardProps) {
  if (count <= 0) return null;

  const itemLabel = count === 1 ? "item" : "items";

  return (
    <div className="flex items-start gap-4 rounded-[18px] border border-dashed border-[rgba(6,28,47,0.12)] bg-[#F8FAFC] px-5 py-4 md:items-center md:px-6 md:py-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(6,28,47,0.08)] bg-white">
        <RiLock2Line size={18} className="text-[rgba(6,28,47,0.45)]" aria-hidden />
      </div>

      <div className="min-w-0">
        <p className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--ink-primary)]">
          {title}
        </p>
        <p className="mt-0.5 text-[14px] leading-5 text-[rgba(6,28,47,0.55)]">
          +{count} more {itemLabel} hidden — {description}
        </p>
      </div>
    </div>
  );
}
