"use client";

import { RiLock2Line } from "@remixicon/react";

type FreemiumProStickyBarProps = {
  onOpen: () => void;
};

export function FreemiumProStickyBar({ onOpen }: FreemiumProStickyBarProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 md:hidden">
      <div className="border-t border-black/[0.07] bg-[#EFEFED]/95 px-4 py-3 backdrop-blur-sm">
        <button
          type="button"
          onClick={onOpen}
          className="pointer-events-auto flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#111] text-[14px] font-medium text-white transition-opacity hover:opacity-90"
        >
          <RiLock2Line size={16} aria-hidden />
          Upgrade to Pro
        </button>
      </div>
    </div>
  );
}
