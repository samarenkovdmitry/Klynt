"use client";

import { RiQuillPenLine, RiArrowRightLine } from "@remixicon/react";
import type { ReportCopyVariants, CopyVariantBlock } from "@/lib/audit-report";

type Props = {
  copyVariants: ReportCopyVariants;
};

type CopyRow = {
  index: number;
  label: string;
  block: CopyVariantBlock;
  badge?: string;
};

function CopyBeforeAfter({ row }: { row: CopyRow }) {
  const after = row.block.variants?.[0];
  if (!row.block.current && !after?.text) return null;

  return (
    <div className="px-6 py-6 md:px-[24px]">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="font-mono text-[12px] text-v2-ink-hairline">
          {String(row.index).padStart(2, "0")}
        </span>
        <span className="text-[16px] font-semibold tracking-[-0.01em] text-v2-ink">{row.label}</span>
        {row.badge && (
          <span className="font-mono ml-auto rounded-full bg-v2-critical-bg px-[11px] py-[5px] text-[10.5px] tracking-[0.05em] text-v2-critical">
            {row.badge}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 items-stretch gap-0 sm:grid-cols-[1fr_40px_1fr] sm:gap-0">
        {/* Before */}
        <div className="rounded-t-[12px] border border-[#E8E5DB] bg-v2-card-inner px-[18px] py-4 sm:rounded-l-[12px] sm:rounded-tr-none">
          <p className="font-mono mb-2 text-[10.5px] tracking-[0.06em] text-v2-ink-hairline">BEFORE</p>
          <p className="text-[15px] leading-[1.4] text-[#9A9588]">{row.block.current}</p>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center border-x-0 border-y border-[#E8E5DB] bg-v2-card-inner py-2 sm:border-x sm:border-y-0 sm:bg-transparent sm:py-0">
          <RiArrowRightLine size={19} className="rotate-90 text-[#CBC6B9] sm:rotate-0" />
        </div>

        {/* After */}
        <div className="rounded-b-[12px] border-[1.5px] border-[#A9D8BC] bg-v2-pass-surface px-[18px] py-4 sm:rounded-r-[12px] sm:rounded-bl-none">
          <p className="font-mono mb-2 text-[10.5px] tracking-[0.06em] text-v2-pass">AFTER</p>
          <p className="text-[15px] font-semibold leading-[1.4] text-[#143322]">{after?.text}</p>
        </div>
      </div>
    </div>
  );
}

export function ReportCopyStudioV2({ copyVariants }: Props) {
  const rows: CopyRow[] = [
    { index: 1, label: "Hero headline", block: copyVariants.headline, badge: "AUDIENCE UNCLEAR" },
    { index: 2, label: "Subheadline", block: copyVariants.subheadline, badge: "LOW CONTRAST · VAGUE" },
    { index: 3, label: "Primary CTA", block: copyVariants.cta, badge: "NO OFFER STATED" },
  ].filter((r) => r.block?.current || r.block?.variants?.[0]?.text);

  if (rows.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-[16px] border border-v2-card-border bg-v2-card shadow-[0_1px_2px_rgba(27,26,23,0.03)]">
      <div className="flex items-center gap-2.5 border-b border-v2-card-divider px-6 py-[18px]">
        <RiQuillPenLine size={20} className="text-v2-ink" />
        <span className="text-[19px] font-semibold tracking-[-0.01em] text-v2-ink">Copy studio</span>
        <span className="font-mono ml-auto text-[11.5px] tracking-[0.04em] text-v2-ink-faint">
          BEFORE → AFTER
        </span>
      </div>

      {rows.map((row, i) => (
        <div key={row.label} className={i > 0 ? "border-t border-v2-card-divider" : ""}>
          <CopyBeforeAfter row={row} />
        </div>
      ))}
    </section>
  );
}
