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
    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] leading-5">
      <span className="text-[#8E99A2]">How established is your brand?</span>

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
            "inline-flex items-center gap-0.5 font-semibold text-[var(--ink-primary)] transition",
            disabled ? "cursor-not-allowed opacity-60" : "hover:opacity-80",
          ].join(" ")}
        >
          {getBrandStageLabel(value)}
          <RiArrowDownSLine size={16} className="text-[var(--ink-primary)]" aria-hidden />
        </button>

        {open ? (
          <ul
            id={listboxId}
            role="listbox"
            aria-label="How established is your brand?"
            className="absolute left-0 top-[calc(100%+8px)] z-20 min-w-[240px] overflow-hidden rounded-[16px] border border-[rgba(6,28,47,0.06)] bg-white p-1.5 shadow-[0_12px_32px_rgba(6,28,47,0.10)]"
          >
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
                      "flex w-full flex-col rounded-[12px] px-3 py-2 text-left transition",
                      isActive
                        ? "bg-[rgba(37,99,235,0.08)]"
                        : "hover:bg-[#F5F7FA]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "text-[14px] font-semibold",
                        isActive ? "text-[#2563EB]" : "text-[var(--ink-primary)]",
                      ].join(" ")}
                    >
                      {option.label}
                    </span>
                    <span
                      className={[
                        "mt-0.5 text-[12px] leading-4",
                        isActive ? "text-[#2563EB]/80" : "text-[#8E99A2]",
                      ].join(" ")}
                    >
                      {option.shortLabel}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </span>

      <span
        className="hidden h-3.5 w-px shrink-0 bg-[rgba(6,28,47,0.12)] sm:inline-block"
        aria-hidden
      />

      <span className="text-[#8E99A2]">Shapes headline directions in your report</span>
    </div>
  );
}
