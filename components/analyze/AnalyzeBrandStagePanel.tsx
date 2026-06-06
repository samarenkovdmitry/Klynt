"use client";

import { useEffect, useId, useRef, useState } from "react";
import { RiArrowDownSLine } from "@remixicon/react";

import {
  BRAND_STAGE_OPTIONS,
  getBrandStageLabel,
  type BrandStage,
} from "@/lib/brand-stage";

type AnalyzeBrandStagePanelProps = {
  value: BrandStage;
  onChange: (stage: BrandStage) => void;
  disabled?: boolean;
};

export function AnalyzeBrandStagePanel({
  value,
  onChange,
  disabled = false,
}: AnalyzeBrandStagePanelProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const listboxId = useId();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function selectStage(stage: BrandStage) {
    onChange(stage);
    setOpen(false);
  }

  return (
    <span ref={rootRef} className="relative inline-flex items-center">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={`Brand stage: ${getBrandStageLabel(value)}`}
        onClick={() => setOpen((current) => !current)}
        className={[
          "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[13px] font-medium transition",
          open
            ? "border-[rgba(6,28,47,0.14)] bg-[#F5F7FA] text-[var(--ink-primary)]"
            : "border-[rgba(6,28,47,0.10)] bg-white text-[var(--ink-primary)] hover:border-[rgba(6,28,47,0.14)]",
          disabled ? "cursor-not-allowed opacity-60" : "",
        ].join(" ")}
      >
        {getBrandStageLabel(value)}
        <RiArrowDownSLine size={15} className="text-[#8E99A2]" aria-hidden />
      </button>

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="How established is your brand?"
          className="absolute right-0 top-[calc(100%+6px)] z-20 min-w-[200px] overflow-hidden rounded-[12px] border border-[rgba(6,28,47,0.08)] bg-white p-1 shadow-[0_8px_24px_rgba(6,28,47,0.08)]"
        >
          <li className="px-2.5 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#8E99A2]">
            How established is your brand?
          </li>
          {BRAND_STAGE_OPTIONS.map((option) => {
            const isActive = value === option.id;

            return (
              <li key={option.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => selectStage(option.id)}
                  className={[
                    "flex w-full flex-col rounded-[8px] px-2.5 py-1.5 text-left transition",
                    isActive
                      ? "bg-[#F5F7FA] text-[var(--ink-primary)]"
                      : "text-[var(--ink-primary)] hover:bg-[#F5F7FA]",
                  ].join(" ")}
                >
                  <span className="text-[13px] font-medium">{option.label}</span>
                  <span className="mt-0.5 text-[11px] leading-4 text-[#8E99A2]">
                    {option.shortLabel}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </span>
  );
}
