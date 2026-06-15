"use client";

import { useState } from "react";
import {
  RiPencilLine,
  RiErrorWarningLine,
  RiAlertLine,
  RiFileCopyLine,
  RiCheckLine,
  RiLock2Line,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiCheckboxCircleFill,
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
  REPORT_PANEL_HEADER_CLASS,
  REPORT_PANEL_META_CLASS,
  REPORT_PANEL_TITLE_CLASS,
  REPORT_ROW_DIVIDER_CLASS,
  REPORT_SECTION_SCROLL_MARGIN_CLASS,
  REPORT_SURFACE_CARD_CLASS,
} from "@/components/report/reportStyles";
import { FreemiumProBadge } from "@/components/report/FreemiumProBadge";
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
  { key: "cta", label: "Primary CTA", id: "copy-cta", linkTo: "copy-cta" },
  { key: "subheadline", label: "Subheadline", id: "copy-subheadline", linkTo: "copy-subheadline" },
];

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

  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-start justify-between gap-2.5 rounded-[10px] px-3 py-[11px] cursor-pointer border transition-all duration-[120ms] ${
        isSelected
          ? "bg-[#E8F7F2] border-[rgba(29,158,117,0.25)]"
          : "bg-[#F5F5F3] border-transparent hover:border-[rgba(0,0,0,0.1)]"
      }`}
    >
      <div className={`flex-1 min-w-0 ${locked ? "select-none" : ""}`}>
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
        title={locked ? "Upgrade to Pro to copy" : "Copy text"}
        className={`flex-shrink-0 pt-0.5 transition-all duration-[120ms] ${
          locked
            ? "text-[#999] opacity-100"
            : isSelected
              ? "text-[#1D9E75] opacity-100"
              : "text-[#C0C0BC] opacity-0 group-hover:opacity-100 group-hover:text-[#1D9E75]"
        }`}
      >
        {copied ? (
          <RiCheckLine className="w-[15px] h-[15px]" />
        ) : locked ? (
          <RiLock2Line className="w-[15px] h-[15px]" />
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
  previewLocked = false,
  onRequestProUpgrade,
}: {
  id: string;
  label: string;
  block: CopyVariantBlock;
  gapItem?: ReportChecklistItem;
  context?: { tone?: string; audience?: string };
  previewLocked?: boolean;
  onRequestProUpgrade?: RequestProUpgrade;
}) {
  const hasGap = Boolean(gapItem && gapItem.status !== "pass");
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(hasGap);

  const previewText = block.current || "Not visible on page";

  if (!expanded) {
    return (
      <div id={id} className={`${REPORT_ROW_DIVIDER_CLASS} ${REPORT_SECTION_SCROLL_MARGIN_CLASS}`}>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[#FAFAF8]"
        >
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#999]">
                {label}
              </span>
              {gapItem?.status === "pass" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F7F2] px-2 py-0.5 text-[11px] font-medium text-[#0F6E56]">
                  <RiCheckboxCircleFill className="h-3 w-3 shrink-0" aria-hidden />
                  Pass
                </span>
              ) : null}
            </div>
            <p className="truncate text-[13px] text-[#777]">{previewText}</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-0.5 text-[12px] text-[#999]">
            Show variants
            <RiArrowDownSLine size={16} aria-hidden />
          </span>
        </button>
      </div>
    );
  }

  return (
    <div id={id} className={`${REPORT_ROW_DIVIDER_CLASS} ${REPORT_SECTION_SCROLL_MARGIN_CLASS}`}>
      <div className="px-5 py-4">
        <div className="mb-[7px] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-[#999]">
            {label}
            {gapItem && gapItem.status !== "pass" && (
              <GapBadge
                status={gapItem.status}
                text={deriveChecklistGapLabel(gapItem) ?? "Needs fix"}
              />
            )}
            {gapItem?.status === "pass" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F7F2] px-2 py-0.5 text-[11px] font-medium normal-case tracking-normal text-[#0F6E56]">
                <RiCheckboxCircleFill className="h-3 w-3 shrink-0" aria-hidden />
                Pass
              </span>
            ) : null}
          </div>
          {!hasGap ? (
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="inline-flex shrink-0 items-center gap-0.5 text-[12px] text-[#999] transition-colors hover:text-[#111]"
            >
              Hide
              <RiArrowUpSLine size={16} aria-hidden />
            </button>
          ) : null}
        </div>

        {block.current ? (
          <div className="mb-[11px] text-[13px] leading-[1.5] text-[#C0C0BC] line-through">
            {block.current}
          </div>
        ) : (
          <div className="mb-[11px] text-[13px] leading-[1.5] text-[#C0C0BC] italic">
            Not visible on page
          </div>
        )}

        <div className="flex flex-col gap-[7px]">
          {block.variants.slice(0, 3).map((variant, i) => (
            <VariantItem
              key={i}
              variant={variant}
              isSelected={selected === i}
              onSelect={() => setSelected(i)}
              locked={previewLocked && i >= freemium.maxFreeCopyVariants}
              onRequestProUpgrade={onRequestProUpgrade}
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

export default function CopyStudio({
  copyVariants,
  context,
  checklist,
  previewLocked = false,
  onRequestProUpgrade,
}: CopyStudioProps) {
  return (
    <section className={`mt-12 scroll-mt-24 ${REPORT_SECTION_SCROLL_MARGIN_CLASS}`}>
      <div className={REPORT_SURFACE_CARD_CLASS}>
        <div className={REPORT_PANEL_HEADER_CLASS}>
          <div className={REPORT_PANEL_TITLE_CLASS}>
            <RiPencilLine size={20} className="text-[#7D8C99]" aria-hidden />
            Copy studio
            {previewLocked ? <FreemiumProBadge /> : null}
          </div>
          <span className={REPORT_PANEL_META_CLASS}>
            {previewLocked ? (
              <>
                More in <span className="font-semibold text-[#061C2F]">PRO</span>
              </>
            ) : (
              "3 sections"
            )}
          </span>
        </div>

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
              previewLocked={previewLocked}
              onRequestProUpgrade={onRequestProUpgrade}
            />
          );
        })}
      </div>
    </section>
  );
}
