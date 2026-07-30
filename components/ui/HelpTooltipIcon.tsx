"use client";

import { RiQuestionLine } from "@remixicon/react";

type HelpTooltipIconProps = {
  text: string;
  /** Accessible name, e.g. "About LCP" */
  label: string;
  className?: string;
  /** Align tooltip when icon sits near the card edge. */
  tooltipAlign?: "center" | "start" | "end";
  /** Show tooltip above or below the icon. */
  tooltipPlacement?: "top" | "bottom";
};

export function HelpTooltipIcon({
  text,
  label,
  className = "",
  tooltipAlign = "center",
  tooltipPlacement = "top",
}: HelpTooltipIconProps) {
  const tooltipHorizontalClass =
    tooltipAlign === "end"
      ? "left-auto right-0 translate-x-0"
      : tooltipAlign === "start"
        ? "left-0 translate-x-0"
        : "left-1/2 -translate-x-1/2";

  const tooltipVerticalClass =
    tooltipPlacement === "bottom"
      ? "top-[calc(100%+8px)]"
      : "bottom-[calc(100%+8px)]";

  return (
    <span
      className={["group/help relative inline-flex shrink-0", className].filter(Boolean).join(" ")}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        tabIndex={0}
        aria-label={label}
        className="inline-flex rounded-full text-[#8E99A2]/50 transition-colors hover:text-[#8E99A2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
        onClick={(event) => event.stopPropagation()}
      >
        <RiQuestionLine size={16} aria-hidden />
      </button>
      <span
        role="tooltip"
        className={[
          "pointer-events-none absolute z-30 w-[min(240px,calc(100vw-48px))] rounded-xl border border-[rgba(6,28,47,0.08)] bg-[#061C2F] px-3 py-2 text-center text-[12px] leading-[1.45] text-white opacity-0 shadow-[0_8px_24px_rgba(6,28,47,0.18)] transition-opacity duration-150 group-hover/help:opacity-100 group-focus-within/help:opacity-100",
          tooltipVerticalClass,
          tooltipHorizontalClass,
        ].join(" ")}
      >
        {text}
      </span>
    </span>
  );
}
