"use client";

import { useState } from "react";
import {
  RiPencilLine,
  RiErrorWarningLine,
  RiAlertLine,
  RiFileCopyLine,
  RiCheckLine,
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
import { REPORT_SECTION_SCROLL_MARGIN_CLASS } from "@/components/report/reportStyles";

// ---------------------------------------------------------------------------
// Design tokens (docs/report-mvp-v4.html)
// --green:#1D9E75  --gl:#E8F7F2  --gd:#0F6E56
// --amber:#BA7517  --al:#FDF3E3  --ad:#7A4A0A
// --bs:#F5F5F3  --b1:rgba(0,0,0,.07)  --t1:#111  --t3:#999  --tm:#C0C0BC
// ---------------------------------------------------------------------------

interface CopyStudioProps {
  copyVariants: ReportCopyVariants;
  context?: { tone?: string; audience?: string };
  checklist?: ReportChecklistItem[];
}

const BLOCKS: {
  key: keyof ReportCopyVariants;
  label: string;
  id: string;
  linkTo: ChecklistLinkTarget;
}[] = [
  { key: "headline", label: "Hero headline", id: "copy-headline", linkTo: "copy-headline" },
  { key: "cta", label: "Primary CTA", id: "copy-cta", linkTo: "copy-cta" },
  { key: "subheadline", label: "Subheadline", id: "copy-subheadline", linkTo: "copy-subheadline" },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function GapBadge({ status, text }: { status: ChecklistItemStatus; text: string }) {
  if (status === "pass") return null;

  const isMissing = status === "missing";

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
        isMissing ? "bg-[#FDF3E3] text-[#7A4A0A]" : "bg-[#F5F0FB] text-[#5B3F9A]"
      }`}
    >
      {isMissing ? (
        <RiErrorWarningLine className="w-3 h-3 flex-shrink-0" />
      ) : (
        <RiAlertLine className="w-3 h-3 flex-shrink-0" />
      )}
      {text}
    </span>
  );
}

function VariantItem({
  variant,
  isSelected,
  onSelect,
}: {
  variant: CopyVariant;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(variant.text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      onClick={onSelect}
      className={`group flex items-start justify-between gap-2.5 rounded-[10px] px-3 py-[11px] cursor-pointer border transition-all duration-[120ms] ${
        isSelected
          ? "bg-[#E8F7F2] border-[rgba(29,158,117,0.25)]"
          : "bg-[#F5F5F3] border-transparent hover:border-[rgba(0,0,0,0.1)]"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div
          className={`text-[11px] mb-[3px] transition-colors duration-[120ms] ${
            isSelected ? "text-[#0F6E56]" : "text-[#999]"
          }`}
        >
          {variant.label}
        </div>
        <div
          className={`text-[13px] font-medium leading-[1.5] transition-colors duration-[120ms] ${
            isSelected ? "text-[#0F6E56]" : "text-[#111]"
          }`}
        >
          {variant.text}
        </div>
      </div>

      <button
        onClick={handleCopy}
        title="Copy text"
        className={`flex-shrink-0 pt-0.5 transition-all duration-[120ms] ${
          isSelected
            ? "text-[#1D9E75] opacity-100"
            : "text-[#C0C0BC] opacity-0 group-hover:opacity-100 group-hover:text-[#1D9E75]"
        }`}
      >
        {copied ? (
          <RiCheckLine className="w-[15px] h-[15px]" />
        ) : (
          <RiFileCopyLine className="w-[15px] h-[15px]" />
        )}
      </button>
    </div>
  );
}

function CopyBlock({
  id,
  label,
  block,
  gapItem,
  context,
}: {
  id: string;
  label: string;
  block: CopyVariantBlock;
  gapItem?: ReportChecklistItem;
  context?: { tone?: string; audience?: string };
}) {
  const [selected, setSelected] = useState(0);

  return (
    <div id={id} className={`border-t border-[rgba(0,0,0,0.07)] ${REPORT_SECTION_SCROLL_MARGIN_CLASS}`}>
      <div className="px-5 py-4">
        {/* Label + gap badge */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#999] uppercase tracking-[0.05em] mb-[7px]">
          {label}
          {gapItem && gapItem.status !== "pass" && (
            <GapBadge
              status={gapItem.status}
              text={deriveChecklistGapLabel(gapItem) ?? "Needs fix"}
            />
          )}
        </div>

        {/* Current text — strikethrough */}
        {block.current ? (
          <div className="mb-[11px] text-[13px] leading-[1.5] text-[#C0C0BC] line-through">
            {block.current}
          </div>
        ) : (
          <div className="mb-[11px] text-[13px] leading-[1.5] text-[#C0C0BC] italic">
            Not visible on page
          </div>
        )}

        {/* Variants */}
        <div className="flex flex-col gap-[7px]">
          {block.variants.slice(0, 3).map((variant, i) => (
            <VariantItem
              key={i}
              variant={variant}
              isSelected={selected === i}
              onSelect={() => setSelected(i)}
            />
          ))}
        </div>

        {context && (context.tone || context.audience) && id === "copy-headline" ? (
          <div className="mt-[11px] text-[12px] text-[#C0C0BC]">
            {context.tone && (
              <>
                Tone:{" "}
                <strong className="font-medium text-[#999]">{context.tone}</strong>
              </>
            )}
            {context.tone && context.audience && " · "}
            {context.audience && (
              <>
                Audience:{" "}
                <strong className="font-medium text-[#999]">{context.audience}</strong>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function CopyStudio({ copyVariants, context, checklist }: CopyStudioProps) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_1px_rgba(0,0,0,0.04),0_4px_20px_rgba(0,0,0,0.07)] overflow-hidden mb-2.5">
      {/* Section header */}
      <div className="flex items-center justify-between px-5 pt-[14px] pb-[10px]">
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#999] uppercase tracking-[0.07em]">
          <RiPencilLine className="w-4 h-4" />
          Copy studio
        </span>
        <span className="text-[12px] text-[#C0C0BC]">
          3 sections · select and copy · more variants soon
        </span>
      </div>

      {/* Blocks */}
      {BLOCKS.map(({ key, label, id, linkTo }) => {
        const gapItem = checklist?.find((item) => item.link_to === linkTo);
        return (
          <CopyBlock
            key={key}
            id={id}
            label={label}
            block={copyVariants[key]}
            gapItem={gapItem}
            context={context}
          />
        );
      })}
    </div>
  );
}
