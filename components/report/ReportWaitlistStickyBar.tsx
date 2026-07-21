"use client";

import { RiLock2Line } from "@remixicon/react";

type ReportWaitlistStickyBarProps = {
  visible?: boolean;
};

export function ReportWaitlistStickyBar({ visible = true }: ReportWaitlistStickyBarProps) {
  return (
    <div
      className={[
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 md:hidden transition-transform duration-200 ease-out",
        visible ? "translate-y-0" : "translate-y-full",
      ].join(" ")}
      aria-hidden={!visible}
    >
      <div className="border-t border-[rgba(6,28,47,0.08)] bg-white/95 px-4 py-3 backdrop-blur-sm">
        <a
          href="#waitlist-gate"
          className={[
            "flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] text-[14px] font-semibold text-white shadow-[0_8px_24px_var(--brand-primary-shadow)] transition-opacity duration-200",
            visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
          ].join(" ")}
          tabIndex={visible ? 0 : -1}
        >
          <RiLock2Line size={16} aria-hidden />
          Unlock full report
        </a>
      </div>
    </div>
  );
}
