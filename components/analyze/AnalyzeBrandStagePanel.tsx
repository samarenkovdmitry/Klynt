"use client";

import { useState } from "react";
import { RiArrowDownSLine, RiArrowUpSLine } from "@remixicon/react";

import {
  BRAND_STAGE_OPTIONS,
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
  const [expanded, setExpanded] = useState(false);
  const selected = BRAND_STAGE_OPTIONS.find((option) => option.id === value);

  return (
    <div className="mt-5 border-t border-[rgba(6,28,47,0.06)] pt-5">
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        disabled={disabled}
        aria-expanded={expanded}
        className={[
          "flex w-full items-center justify-between gap-3 rounded-[16px] px-1 py-1 text-left transition",
          disabled ? "cursor-not-allowed opacity-60" : "hover:opacity-80",
        ].join(" ")}
      >
        <span>
          <span className="block text-[14px] font-medium text-[var(--ink-primary)]">
            Tailor your report
            <span className="ml-1.5 font-normal text-[#8E99A2]">(optional)</span>
          </span>
          {!expanded && selected ? (
            <span className="mt-1 block text-[13px] text-[#8E99A2]">
              Brand stage: {selected.label}
            </span>
          ) : null}
        </span>
        {expanded ? (
          <RiArrowUpSLine size={18} className="shrink-0 text-[#8E99A2]" aria-hidden />
        ) : (
          <RiArrowDownSLine size={18} className="shrink-0 text-[#8E99A2]" aria-hidden />
        )}
      </button>

      {expanded ? (
        <div className="mt-4">
          <p className="text-[13px] font-medium text-[var(--ink-primary)]">
            How established is your brand?
          </p>
          <p className="mt-1 text-[13px] leading-5 text-[#8E99A2]">
            Shapes headline directions in your report — three strategies, not one rewrite.
          </p>

          <div
            className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap"
            role="radiogroup"
            aria-label="Brand stage"
          >
            {BRAND_STAGE_OPTIONS.map((option) => {
              const isActive = value === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  disabled={disabled}
                  onClick={() => onChange(option.id)}
                  className={[
                    "rounded-full border px-4 py-2 text-left text-[13px] font-medium transition sm:text-[14px]",
                    isActive
                      ? "border-[#2563EB] bg-[rgba(37,99,235,0.08)] text-[#2563EB]"
                      : "border-[rgba(6,28,47,0.10)] bg-white text-[var(--ink-primary)] hover:border-[#8E99A2]",
                    disabled ? "cursor-not-allowed opacity-60" : "",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {selected ? (
            <p className="mt-3 text-[13px] leading-5 text-[#8E99A2]">{selected.shortLabel}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
