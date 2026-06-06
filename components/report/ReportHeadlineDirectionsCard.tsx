"use client";

import { useEffect, useRef, useState } from "react";
import {
  RiCheckLine,
  RiFileCopyLine,
  RiInformationLine,
  RiLock2Line,
} from "@remixicon/react";

import type { HeadlineDirections } from "@/lib/audit-report";
import { getBrandStageLabel, type BrandStage } from "@/lib/brand-stage";
import { ReportVariantCard } from "@/components/report/ReportVariantCard";
import {
  IMPROVED_COPY_BUTTON_CLASS,
  IMPROVED_COPY_PANEL_CLASS,
  IMPROVED_COPY_TOAST_CLASS,
} from "@/lib/report-priority";
import { REPORT_CARD_TITLE_CLASS } from "@/components/report/reportStyles";

type ReportHeadlineDirectionsCardProps = {
  directions: HeadlineDirections;
  beforeGap?: string;
  brandStage?: BrandStage;
  copiedIndex: number | null;
  copyIndexOffset: number;
  onCopy: (text: string, index: number) => void;
  copyLocked?: boolean;
};

export function ReportHeadlineDirectionsCard({
  directions,
  beforeGap,
  brandStage,
  copiedIndex,
  copyIndexOffset,
  onCopy,
  copyLocked = false,
}: ReportHeadlineDirectionsCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showContext, setShowContext] = useState(false);
  const contextRef = useRef<HTMLDivElement>(null);

  const options = directions.options;
  const safeIndex = Math.min(activeIndex, Math.max(0, options.length - 1));
  const activeOption = options[safeIndex];
  const before = directions.before?.trim();
  const gap = beforeGap?.trim() || directions.gap?.trim();
  const copyIndex = copyIndexOffset + safeIndex;

  useEffect(() => {
    if (!showContext) return;

    function handlePointerDown(event: MouseEvent) {
      if (!contextRef.current?.contains(event.target as Node)) {
        setShowContext(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [showContext]);

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
            <div ref={contextRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowContext((open) => !open)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-[#8E99A2] transition hover:bg-[#F5F7FA] hover:text-[var(--ink-primary)]"
                aria-label="Why these directions"
                aria-expanded={showContext}
              >
                <RiInformationLine size={15} aria-hidden />
              </button>

              {showContext ? (
                <div className="absolute right-0 top-[calc(100%+6px)] z-10 w-[min(260px,calc(100vw-48px))] rounded-[12px] border border-[rgba(6,28,47,0.08)] bg-white p-2.5 text-[12px] leading-5 text-[#6B7280] shadow-[0_8px_24px_rgba(6,28,47,0.08)]">
                  {directions.context}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {before ? (
          <div className="mt-4">
            <p className="text-[14px] leading-6 text-neutral-600">
              <span className="font-medium uppercase tracking-[0.08em] text-[11px] text-neutral-400">
                Before
              </span>
              <span className="mx-2 text-neutral-300">·</span>
              {before}
            </p>
            {gap ? (
              <p className="mt-1.5 text-[13px] leading-5 text-[#8E99A2]">{gap}</p>
            ) : null}
          </div>
        ) : null}

        <div
          className="mt-4 flex gap-4 overflow-x-auto border-b border-neutral-200 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Headline direction"
        >
          {options.map((option, index) => {
            const isActive = safeIndex === index;

            return (
              <button
                key={`${option.label}-${index}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveIndex(index)}
                className={[
                  "-mb-px shrink-0 border-b-2 pb-2 text-[12px] font-medium transition",
                  isActive
                    ? "border-[var(--ink-primary)] text-[var(--ink-primary)]"
                    : "border-transparent text-[#8E99A2] hover:text-neutral-600",
                ].join(" ")}
              >
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
