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

const CATEGORIES = [
  {
    icon: RiMessage2Line,
    label: "Messaging clarity",
    signals: 9,
    tags: "AUDIENCE, VALUE",
  },
  {
    icon: RiShieldCheckLine,
    label: "Trust signals",
    signals: 8,
    tags: "PROOF, LOGOS",
  },
  {
    icon: RiLayout2Line,
    label: "Visual hierarchy",
    signals: 7,
    tags: "FOCUS, CONTRAST",
  },
  {
    icon: RiFlashlightLine,
    label: "Conversion friction",
    signals: 8,
    tags: "CTA, FORMS",
  },
  {
    icon: RiQuillPenLine,
    label: "Copy specificity",
    signals: 8,
    tags: "CONCRETENESS",
  },
  {
    icon: RiCodeSSlashLine,
    label: "Technical & meta",
    signals: 7,
    tags: "TITLES, A11Y",
  },
] as const;

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
          <b className="font-semibold text-[#F5F2EA]">47 signals across 6 categories</b>. No
          opinions, no AI guessing — measurable checks against conversion and accessibility
          benchmarks. Each finding is scored on{" "}
          <b className="font-semibold text-[#F5F2EA]">one cross-category Impact scale</b>, so
          priorities compare directly.
        </p>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-1 border-t border-[rgba(245,242,234,0.08)] sm:grid-cols-3">
        {CATEGORIES.map((cat, i) => {
          const Icon = cat.icon;
          const isLeftCol = i % 3 === 0;
          const isMidCol = i % 3 === 1;
          const isSecondRow = i >= 3;
          return (
            <div
              key={cat.label}
              className={[
                "px-6 py-6",
                isSecondRow ? "border-t border-[rgba(245,242,234,0.08)]" : "",
                (isLeftCol || isMidCol) ? "sm:border-r sm:border-[rgba(245,242,234,0.08)]" : "",
                !isSecondRow && i > 0 ? "border-t border-[rgba(245,242,234,0.08)] sm:border-t-0" : "",
              ].filter(Boolean).join(" ")}
            >
              <div className="mb-2 flex items-center gap-2.5">
                <Icon size={18} className="shrink-0 text-[rgba(245,242,234,0.5)]" />
                <span className="text-[15px] font-bold text-[#F5F2EA]">{cat.label}</span>
              </div>
              <p className="font-mono text-[11px] tracking-[0.06em] text-[rgba(245,242,234,0.35)]">
                {cat.signals} SIGNALS · {cat.tags}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
