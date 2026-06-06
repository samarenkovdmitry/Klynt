"use client";

import { useState } from "react";
import {
  RiCheckLine,
  RiFileCopyLine,
  RiInformationLine,
  RiLock2Line,
} from "@remixicon/react";

import type { HeadlineDirections } from "@/lib/audit-report";
import { getBrandStageLabel, type BrandStage } from "@/lib/brand-stage";
import { getHeadlineStrategyIcon } from "@/lib/headline-strategy-icons";
import { ReportVariantCard } from "@/components/report/ReportVariantCard";
import {
  IMPROVED_COPY_BUTTON_CLASS,
  IMPROVED_COPY_PANEL_CLASS,
  IMPROVED_COPY_TOAST_CLASS,
} from "@/lib/report-priority";
import { REPORT_CARD_TITLE_CLASS } from "@/components/report/reportStyles";

type ReportHeadlineDirectionsCardProps = {
  directions: HeadlineDirections;
  brandStage?: BrandStage;
  copiedIndex: number | null;
  copyIndexOffset: number;
  onCopy: (text: string, index: number) => void;
  copyLocked?: boolean;
};

export function ReportHeadlineDirectionsCard({
  directions,
  brandStage,
  copiedIndex,
  copyIndexOffset,
  onCopy,
  copyLocked = false,
}: ReportHeadlineDirectionsCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showContext, setShowContext] = useState(false);

  const options = directions.options;
  const safeIndex = Math.min(activeIndex, Math.max(0, options.length - 1));
  const activeOption = options[safeIndex];
  const before = directions.before?.trim();
  const copyIndex = copyIndexOffset + safeIndex;

  if (!activeOption) {
    return null;
  }

  return (
    <ReportVariantCard variant="copy">
      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={REPORT_CARD_TITLE_CLASS}>Hero headline</p>
            {brandStage ? (
              <p className="mt-1 text-[13px] text-[#8E99A2]">
                {getBrandStageLabel(brandStage)} brand · 3 directions
              </p>
            ) : null}
          </div>

          {directions.context ? (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowContext((open) => !open)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(6,28,47,0.08)] text-[#8E99A2] transition hover:border-[#8E99A2] hover:text-[var(--ink-primary)]"
                aria-label="Why these directions"
                aria-expanded={showContext}
              >
                <RiInformationLine size={16} aria-hidden />
              </button>

              {showContext ? (
                <div className="absolute right-0 top-[calc(100%+8px)] z-10 w-[min(280px,calc(100vw-48px))] rounded-[14px] border border-[rgba(6,28,47,0.08)] bg-white p-3 text-[13px] leading-5 text-[#6B7280] shadow-[0_12px_32px_rgba(6,28,47,0.10)]">
                  {directions.context}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {before ? (
          <p className="mt-4 text-[14px] leading-6 text-[#8E99A2]">
            <span className="font-medium uppercase tracking-[0.08em] text-[11px] text-neutral-400">
              Before
            </span>
            <span className="mx-2 text-neutral-300">·</span>
            <span className="text-neutral-600">{before}</span>
          </p>
        ) : null}

        <div
          className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Headline direction"
        >
          {options.map((option, index) => {
            const Icon = getHeadlineStrategyIcon(option.label);
            const isActive = safeIndex === index;

            return (
              <button
                key={`${option.label}-${index}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveIndex(index)}
                className={[
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-medium transition",
                  isActive
                    ? "border-[#2563EB] bg-[#2563EB] text-white shadow-[0_4px_14px_rgba(37,99,235,0.22)]"
                    : "border-[rgba(6,28,47,0.10)] bg-white text-[var(--ink-primary)] hover:border-[#8E99A2]",
                ].join(" ")}
              >
                <Icon size={15} aria-hidden />
                {option.label}
              </button>
            );
          })}
        </div>

        <div className={`relative mt-4 rounded-2xl border p-5 ${IMPROVED_COPY_PANEL_CLASS}`}>
          <div className="flex items-start justify-between gap-4">
            <p className="min-w-0 flex-1 text-[18px] font-semibold leading-7 tracking-[-0.01em] text-[var(--ink-primary)] md:text-[20px] md:leading-8">
              {activeOption.text}
            </p>

            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => onCopy(activeOption.text, copyIndex)}
                disabled={copyLocked}
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-xl border",
                  copyLocked
                    ? "cursor-not-allowed border-[rgba(6,28,47,0.08)] bg-white text-[rgba(6,28,47,0.35)]"
                    : IMPROVED_COPY_BUTTON_CLASS,
                ].join(" ")}
                aria-label={
                  copyLocked
                    ? "Copy available after unlocking the full report"
                    : "Copy headline"
                }
              >
                {copyLocked ? (
                  <RiLock2Line size={16} aria-hidden />
                ) : copiedIndex === copyIndex ? (
                  <RiCheckLine size={18} />
                ) : (
                  <RiFileCopyLine size={18} />
                )}
              </button>

              {!copyLocked && copiedIndex === copyIndex ? (
                <div
                  className={`absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-medium shadow-sm ${IMPROVED_COPY_TOAST_CLASS}`}
                >
                  Copied
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </ReportVariantCard>
  );
}
