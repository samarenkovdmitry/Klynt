"use client";

import { RiAlarmWarningLine, RiCloseCircleFill } from "@remixicon/react";
import type { ReportChecklistItem, ReportCopyVariants } from "@/lib/audit-report";
import { ViewportScaleBar } from "./ViewportScaleBar";

type Props = {
  checklist: ReportChecklistItem[];
  copyVariants?: ReportCopyVariants | null;
  /** Width at which the page was captured (px). Used for viewport issue cards. */
  viewportWidth?: number;
};

function getLinkedCopy(
  item: ReportChecklistItem,
  copyVariants: ReportCopyVariants
): { before: string; after: string } | null {
  const map = {
    "copy-headline": copyVariants.headline,
    "copy-subheadline": copyVariants.subheadline,
    "copy-cta": copyVariants.cta,
  } as const;

  if (!item.link_to || !(item.link_to in map)) return null;
  const block = map[item.link_to as keyof typeof map];
  if (!block?.current || !block.variants?.[0]?.text) return null;
  return { before: block.current, after: block.variants[0].text };
}

function isViewportOrPerformanceItem(item: ReportChecklistItem): boolean {
  const id = item.id.toLowerCase();
  const text = item.text.toLowerCase();
  const evidence = item.evidence?.toLowerCase() ?? "";
  return (
    id.includes("viewport") ||
    id.includes("performance") ||
    text.includes("viewport") ||
    evidence.includes("viewport")
  );
}

export function ReportHeroFinding({ checklist, copyVariants, viewportWidth }: Props) {
  const criticalItem = checklist.find((i) => i.status === "missing") ?? checklist.find((i) => i.status === "weak");
  if (!criticalItem) return null;

  const linkedCopy = copyVariants ? getLinkedCopy(criticalItem, copyVariants) : null;

  const isVpIssue = isViewportOrPerformanceItem(criticalItem);
  const hasCopyCta = !!copyVariants?.cta?.variants?.length;
  const isCopyType =
    criticalItem.link_to === "copy-cta" ||
    criticalItem.link_to === "copy-headline" ||
    criticalItem.link_to === "copy-subheadline";

  // Show viewport bar when the finding is performance/viewport AND either
  // there's no CTA copy variant or the issue isn't a copy/CTA type.
  const showViewportBar = isVpIssue && viewportWidth != null && (!hasCopyCta || !isCopyType);

  const bottomSection = showViewportBar ? (
    <div className="border-t border-v2-card-divider bg-v2-card-inner px-6 py-6 md:px-9">
      <ViewportScaleBar viewportWidth={viewportWidth!} />
    </div>
  ) : linkedCopy ? (
    <div className="border-t border-v2-card-divider bg-v2-card-inner px-6 py-6 md:px-9">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="relative rounded-[12px] border border-[#E8E5DB] bg-v2-card px-[22px] py-5">
          <span className="font-mono absolute right-3.5 top-3 rounded-full bg-v2-critical-bg px-[9px] py-1 text-[10.5px] font-semibold text-v2-critical">
            BEFORE
          </span>
          <p className="mt-7 text-[15px] leading-[1.4] text-[#9A9588]">{linkedCopy.before}</p>
        </div>
        <div className="relative rounded-[12px] border-[1.5px] border-[#A9D8BC] bg-v2-pass-surface px-[22px] py-5">
          <span className="font-mono absolute right-3.5 top-3 rounded-full bg-v2-pass-bg px-[9px] py-1 text-[10.5px] font-semibold text-v2-pass">
            AFTER
          </span>
          <p className="mt-7 text-[15px] font-semibold leading-[1.4] text-[#143322]">
            {linkedCopy.after}
          </p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <section className="overflow-hidden rounded-[16px] border border-v2-card-border bg-v2-card shadow-[0_1px_2px_rgba(27,26,23,0.03)]">
      <div className="px-6 pb-[30px] pt-[34px] md:px-9">
        <span className="font-mono mb-6 inline-flex items-center gap-2 rounded-full bg-v2-critical-bg px-[13px] py-[7px] text-[11.5px] tracking-[0.1em] text-v2-critical">
          <RiAlarmWarningLine size={14} />
          MOST CRITICAL ISSUE
        </span>

        <div className="flex flex-wrap items-start gap-6 md:gap-10">
          <div className="shrink-0">
            <div className="inline-flex items-center gap-2 rounded-xl bg-v2-critical-bg px-4 py-3">
              <RiCloseCircleFill size={20} className="text-v2-critical-text" />
              <span className="font-mono text-[12px] font-semibold tracking-[0.06em] text-v2-critical">
                {criticalItem.status === "missing" ? "CRITICAL" : "HIGH"}
              </span>
            </div>
            {criticalItem.category && (
              <p className="font-mono mt-3 text-[10.5px] tracking-[0.05em] text-v2-ink-faint uppercase">
                {criticalItem.category}
              </p>
            )}
          </div>

          <div className="min-w-[260px] flex-1">
            <h2 className="mb-3.5 text-[22px] font-semibold leading-[1.2] tracking-[-0.02em] text-v2-ink md:text-[27px]">
              {criticalItem.text}
            </h2>
            {criticalItem.evidence && (
              <p className="text-[15px] leading-[1.55] text-v2-ink-secondary md:text-[16.5px]">
                {criticalItem.evidence}
              </p>
            )}
          </div>
        </div>
      </div>

      {bottomSection}
    </section>
  );
}
