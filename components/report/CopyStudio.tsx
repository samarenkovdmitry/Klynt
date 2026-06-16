"use client";

import { useState } from "react";
import {
  RiPencilLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiFileCopyLine,
  RiCheckLine,
  RiLock2Line,
  RiVipCrownFill,
} from "@remixicon/react";
import type {
  ReportCopyVariants,
  CopyVariantBlock,
  CopyVariant,
  ChecklistItemStatus,
  ReportChecklistItem,
  ChecklistLinkTarget,
} from "@/lib/audit-report";
import { deriveChecklistGapLabel } from "@/lib/normalize-report-checklist";
import {
  REPORT_ROW_DIVIDER_CLASS,
  REPORT_SECTION_SCROLL_MARGIN_CLASS,
  REPORT_SECTION_SPACING_CLASS,
  REPORT_SURFACE_CARD_CLASS,
} from "@/components/report/reportStyles";
import { freemium, type RequestProUpgrade } from "@/lib/freemium";

interface CopyStudioProps {
  copyVariants: ReportCopyVariants;
  context?: { tone?: string; audience?: string };
  checklist?: ReportChecklistItem[];
  previewLocked?: boolean;
  onRequestProUpgrade?: RequestProUpgrade;
}

const BLOCKS: {
  key: keyof ReportCopyVariants;
  label: string;
  id: string;
  linkTo: ChecklistLinkTarget;
}[] = [
  { key: "headline", label: "Hero headline", id: "copy-headline", linkTo: "copy-headline" },
  { key: "subheadline", label: "Subheadline", id: "copy-subheadline", linkTo: "copy-subheadline" },
  { key: "cta", label: "Primary CTA", id: "copy-cta", linkTo: "copy-cta" },
];

function SectionStatusBadge({
  status,
  text,
}: {
  status: ChecklistItemStatus;
  text: string;
}) {
  if (status === "pass") return null;
  const isMissing = status === "missing";
  return (
    <span
      className={[
        "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full pl-2 pr-3 text-[13px] font-medium",
        isMissing ? "bg-[#FDF3E3] text-[#7A4A0A]" : "bg-[#F5F0FB] text-[#5B3F9A]",
      ].join(" ")}
    >
      {isMissing ? (
        <RiErrorWarningLine size={14} className="shrink-0" aria-hidden />
      ) : (
        <RiInformationLine size={14} className="shrink-0" aria-hidden />
      )}
      {text}
    </span>
  );
}

function VariantCard({
  variant,
  isSelected,
  onSelect,
  locked = false,
  onRequestProUpgrade,
}: {
  variant: CopyVariant;
  isSelected: boolean;
  onSelect: () => void;
  locked?: boolean;
  onRequestProUpgrade?: RequestProUpgrade;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    if (locked) {
      onRequestProUpgrade?.("copy-variant");
      return;
    }
    navigator.clipboard.writeText(variant.text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (locked) {
    return (
      <div className="rounded-[10px] border border-[#E5E5E5] bg-white px-3 py-[11px]">
        <div className="mb-2 flex items-start justify-between gap-2">
          <span className="text-[12px] text-[#8F99A2]">{variant.label}</span>
          <RiLock2Line size={14} className="shrink-0 text-[#8F99A2]" aria-hidden />
        </div>
        <div className="space-y-1.5">
          <div className="h-2.5 w-3/4 rounded-full bg-[#DDE5ED]" />
          <div className="h-2.5 w-1/2 rounded-full bg-[#DDE5ED]" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={[
        "group relative flex cursor-pointer flex-col rounded-[10px] px-3 py-[11px] transition-all duration-[120ms]",
        isSelected
          ? "border border-[rgba(29,158,117,0.5)] bg-[#E8F7F2]"
          : "border border-[rgba(6,28,47,0.08)] bg-[#F5F5F3] hover:border-[rgba(6,28,47,0.15)]",
      ].join(" ")}
    >
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <span
          className={[
            "text-[12px] font-medium leading-4",
            isSelected ? "text-[#1D9E75]" : "text-[#999]",
          ].join(" ")}
        >
          {variant.label}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          title="Copy text"
          className={[
            "shrink-0 transition-all duration-[120ms]",
            "text-[#1D9E75] opacity-0 transition-opacity duration-150 group-hover:opacity-100",
          ].join(" ")}
        >
          {copied ? (
            <RiCheckLine size={14} aria-hidden />
          ) : (
            <RiFileCopyLine size={14} aria-hidden />
          )}
        </button>
      </div>
      <span className="text-[16px] font-medium leading-snug text-[#061C2F]">
        {variant.text}
      </span>
    </div>
  );
}

function CopyBlock({
  index,
  id,
  label,
  block,
  gapItem,
  context,
  previewLocked = false,
  onRequestProUpgrade,
}: {
  index: number;
  id: string;
  label: string;
  block: CopyVariantBlock;
  gapItem?: ReportChecklistItem;
  context?: { tone?: string; audience?: string };
  previewLocked?: boolean;
  onRequestProUpgrade?: RequestProUpgrade;
}) {
  const [selected, setSelected] = useState(0);
  const hasGap = Boolean(gapItem && gapItem.status !== "pass");

  return (
    <div id={id} className={`px-5 py-5 ${REPORT_SECTION_SCROLL_MARGIN_CLASS}`}>
      {/* Title row */}
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[rgba(6,28,47,0.15)] text-[13px] font-medium text-[#7D8C99]">
          {index + 1}
        </span>
        <span className="flex-1 text-[16px] font-semibold leading-6 text-[#061C2F]">
          {label}
        </span>
        {hasGap && gapItem ? (
          <SectionStatusBadge
            status={gapItem.status}
            text={deriveChecklistGapLabel(gapItem) ?? "Needs fix"}
          />
        ) : null}
      </div>

      {/* Strikethrough original */}
      {block.current ? (
        <p className="mb-3 text-[14px] leading-5 text-[#8E99A2] line-through">
          {block.current}
        </p>
      ) : (
        <p className="mb-3 text-[14px] italic leading-5 text-[#8E99A2]">
          Not visible on page
        </p>
      )}

      {/* 3-column variant grid */}
      <div className="grid grid-cols-3 gap-2">
        {block.variants.slice(0, 3).map((variant, i) => (
          <VariantCard
            key={i}
            variant={variant}
            isSelected={selected === i}
            onSelect={() => setSelected(i)}
            locked={previewLocked && i >= freemium.maxFreeCopyVariants}
            onRequestProUpgrade={onRequestProUpgrade}
          />
        ))}
      </div>

      {/* Tone/Audience meta — first section only */}
      {context && (context.tone || context.audience) && id === "copy-headline" ? (
        <div className="mt-3 text-[13px] text-[#8E99A2]">
          {context.tone && (
            <>
              Tone:{" "}
              <strong className="font-medium text-[#999]">{context.tone}</strong>
            </>
          )}
          {context.tone && context.audience && (
            <span className="mx-[4px]">·</span>
          )}
          {context.audience && (
            <>
              Audience:{" "}
              <strong className="font-medium text-[#999]">{context.audience}</strong>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function CopyStudio({
  copyVariants,
  context,
  checklist,
  previewLocked = false,
  onRequestProUpgrade,
}: CopyStudioProps) {
  return (
    <section className={`${REPORT_SECTION_SPACING_CLASS} ${REPORT_SECTION_SCROLL_MARGIN_CLASS}`}>
      {/* Floating pill header */}
      <div className="mb-2 flex items-center justify-between gap-4 rounded-full bg-[#EFF3F6] px-5 py-3 md:px-6">
        <div className="flex items-center gap-2 text-[20px] font-semibold leading-7 tracking-[-0.02em] text-[#061C2F]">
          <RiPencilLine size={20} className="text-[#7D8C99]" aria-hidden />
          Copy studio
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[14px] leading-5 text-[#7D8C99]">3 sections</span>
          {previewLocked ? (
            <>
              <span className="h-6 w-px bg-[#D0D5DA]" aria-hidden />
              <span className="text-[14px] leading-5 text-[#7D8C99]">More in</span>
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold text-white [background:linear-gradient(to_top_right,#18181B,#373473,#201F32)]">
                <RiVipCrownFill size={12} aria-hidden />
                PRO
              </span>
            </>
          ) : null}
        </div>
      </div>

      {/* Sections card */}
      <div className={REPORT_SURFACE_CARD_CLASS}>
        {BLOCKS.map(({ key, label, id, linkTo }, index) => {
          const gapItem = checklist?.find((item) => item.link_to === linkTo);
          const isLast = index === BLOCKS.length - 1;
          return (
            <div key={key} className={isLast ? "" : REPORT_ROW_DIVIDER_CLASS}>
              <CopyBlock
                index={index}
                id={id}
                label={label}
                block={copyVariants[key]}
                gapItem={gapItem}
                context={context}
                previewLocked={previewLocked}
                onRequestProUpgrade={onRequestProUpgrade}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
