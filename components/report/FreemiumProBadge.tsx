import { RiLock2Line } from "@remixicon/react";

export function FreemiumProBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full border border-black/[0.08] bg-[#F5F5F3] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] text-[#777]",
        className,
      ].join(" ")}
    >
      <RiLock2Line size={11} aria-hidden />
      Pro
    </span>
  );
}
