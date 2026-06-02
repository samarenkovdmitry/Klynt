"use client";

import { RiLock2Line } from "@remixicon/react";

export function ReportWaitlistStickyBar() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 md:hidden">
      <div className="border-t border-[rgba(6,28,47,0.08)] bg-white/95 px-4 py-3 backdrop-blur-sm">
        <a
          href="#waitlist-gate"
          className="pointer-events-auto flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] text-[14px] font-semibold text-white shadow-[0_8px_24px_rgba(37,99,235,0.24)]"
        >
          <RiLock2Line size={16} aria-hidden />
          Unlock full report
        </a>
      </div>
    </div>
  );
}
