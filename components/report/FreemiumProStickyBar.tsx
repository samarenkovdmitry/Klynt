"use client";

import { RiLock2Line } from "@remixicon/react";

type FreemiumProStickyBarProps = {
  visible?: boolean;
};

export function FreemiumProStickyBar({ visible = true }: FreemiumProStickyBarProps) {
  return (
    <div
      className={[
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 transition-transform duration-200 ease-out md:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      ].join(" ")}
      aria-hidden={!visible}
    >
      <div className="border-t border-black/[0.07] bg-[#EFEFED]/95 px-4 py-3 backdrop-blur-sm">
        <a
          href="#pro-upgrade-gate"
          className={[
            "flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#111] text-[14px] font-medium text-white transition-opacity duration-200",
            visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
          ].join(" ")}
          tabIndex={visible ? 0 : -1}
        >
          <RiLock2Line size={16} aria-hidden />
          Upgrade to Pro
        </a>
      </div>
    </div>
  );
}
