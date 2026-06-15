import { RiLock2Line } from "@remixicon/react";

export function FreemiumProBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={[
        "inline-flex h-6 items-center gap-1 rounded-lg bg-[#EEF2FF] px-2 text-[12px] font-semibold uppercase tracking-[0.05em] text-[#6366F1]",
        className,
      ].join(" ")}
    >
      <RiLock2Line size={12} aria-hidden />
      PRO
    </span>
  );
}
