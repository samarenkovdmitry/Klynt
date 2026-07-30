"use client";

import {
  RiFocus3Line,
  RiMessage2Line,
  RiShieldCheckLine,
  RiLayout2Line,
  RiFlashlightLine,
  RiQuillPenLine,
  RiCodeSSlashLine,
} from "@remixicon/react";

import {
  getMethodologyStats,
  METHODOLOGY_CATEGORY_LABELS,
  type SignalMethodologyCategory,
} from "@/lib/signals";

const CATEGORY_ICONS: Record<
  SignalMethodologyCategory,
  typeof RiMessage2Line
> = {
  messaging_clarity: RiMessage2Line,
  trust_signals: RiShieldCheckLine,
  visual_hierarchy: RiLayout2Line,
  conversion_friction: RiFlashlightLine,
  copy_specificity: RiQuillPenLine,
  technical_meta: RiCodeSSlashLine,
};

const CATEGORY_ORDER: SignalMethodologyCategory[] = [
  "messaging_clarity",
  "trust_signals",
  "visual_hierarchy",
  "conversion_friction",
  "copy_specificity",
  "technical_meta",
];

const stats = getMethodologyStats();

export function ReportMethodologyPanel() {
  return (
    <section className="overflow-hidden rounded-[16px] bg-v2-dark">
      {/* Header */}
      <div className="px-8 pb-7 pt-8">
        <div className="mb-5 flex items-center gap-2">
          <RiFocus3Line size={15} className="text-[rgba(245,242,234,0.4)]" />
          <span className="font-mono text-[11px] tracking-[0.1em] text-[rgba(245,242,234,0.4)]">
            METHODOLOGY
          </span>
        </div>
        <h2 className="mb-4 text-[28px] font-bold leading-[1.15] tracking-[-0.02em] text-[#F5F2EA]">
          How Klynt analyses a page
        </h2>
        <p className="max-w-[560px] text-[16px] leading-[1.65] text-[rgba(245,242,234,0.6)]">
          Every report runs the same{" "}
          <b className="font-semibold text-[#F5F2EA]">
            {stats.totalSignals} signals across {CATEGORY_ORDER.length} categories
          </b>
          . Deterministic checks against conversion and accessibility benchmarks — contrast
          ratios from computed CSS, meta tags from the DOM, and structured copy patterns.
          Each finding is scored on{" "}
          <b className="font-semibold text-[#F5F2EA]">one cross-category Impact scale</b>, so
          priorities compare directly.
        </p>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-1 border-t border-[rgba(245,242,234,0.08)] sm:grid-cols-3">
        {CATEGORY_ORDER.map((categoryId, i) => {
          const meta = METHODOLOGY_CATEGORY_LABELS[categoryId];
          const Icon = CATEGORY_ICONS[categoryId];
          const signalCount = stats.byCategory[categoryId];
          const isLeftCol = i % 3 === 0;
          const isMidCol = i % 3 === 1;
          const isSecondRow = i >= 3;
          return (
            <div
              key={categoryId}
              className={[
                "px-6 py-6",
                isSecondRow ? "border-t border-[rgba(245,242,234,0.08)]" : "",
                (isLeftCol || isMidCol) ? "sm:border-r sm:border-[rgba(245,242,234,0.08)]" : "",
                !isSecondRow && i > 0 ? "border-t border-[rgba(245,242,234,0.08)] sm:border-t-0" : "",
              ].filter(Boolean).join(" ")}
            >
              <div className="mb-2 flex items-center gap-2.5">
                <Icon size={18} className="shrink-0 text-[rgba(245,242,234,0.5)]" />
                <span className="text-[15px] font-bold text-[#F5F2EA]">{meta.label}</span>
              </div>
              <p className="font-mono text-[11px] tracking-[0.06em] text-[rgba(245,242,234,0.35)]">
                {signalCount} SIGNALS · {meta.tags}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
