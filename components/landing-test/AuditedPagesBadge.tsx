import { RiCheckLine } from "@remixicon/react";

import { getAuditedPagesCaption } from "@/lib/audit-stats";

type AuditedPagesBadgeProps = {
  count: number;
  className?: string;
};

export function AuditedPagesBadge({ count, className = "" }: AuditedPagesBadgeProps) {
  const { value, suffix } = getAuditedPagesCaption(count);

  return (
    <div
      className={[
        "inline-flex items-center gap-2 text-[13px] md:text-[14px]",
        className,
      ].join(" ")}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10">
        <RiCheckLine size={12} className="text-white/70" aria-hidden />
      </span>
      <p className="leading-snug">
        <span className="font-semibold tabular-nums text-white/90">{value}</span>
        <span className="text-white/50"> {suffix}</span>
      </p>
    </div>
  );
}
