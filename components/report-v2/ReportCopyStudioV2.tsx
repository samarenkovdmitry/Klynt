"use client";

import { RiQuillPenLine, RiArrowRightLine } from "@remixicon/react";
import type { ReportCopyVariants, CopyVariantBlock } from "@/lib/audit-report";

type Props = {
  copyVariants: ReportCopyVariants;
  lockedAfter?: number;
};

type CopyRow = {
  index: number;
  label: string;
  block: CopyVariantBlock;
  badge?: string;
  isCTA?: boolean;
  textSize?: string;
};

function CopyBeforeAfter({ row }: { row: CopyRow }) {
  const after = row.block.variants?.[0];
  if (!row.block.current && !after?.text) return null;

  return (
    <div className="px-6 pb-6 pt-0 md:px-6">
      <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-[1fr_36px_1fr] sm:gap-0">
        {/* Before */}
        <div className="rounded-[12px] border border-[#E8E5DB] bg-[#F5F3EF] px-5 py-5">
          <p className="font-mono mb-3 text-[11px] tracking-[0.06em] text-[#B0ABA0]">BEFORE</p>
          {row.isCTA ? (
            <div className="inline-flex items-center rounded-[8px] bg-[#7E7970] px-4 py-2.5">
              <span className="text-[15px] font-semibold text-white">{row.block.current}</span>
            </div>
          ) : (
            <p className={`${row.textSize ?? "text-[16px]"} leading-[1.55] text-[#9A9588]`}>{row.block.current}</p>
          )}
        </div>

        {/* Arrow */}
        <div className="hidden items-center justify-center sm:flex">
          <RiArrowRightLine size={18} className="text-[#CBC6B9]" />
        </div>

        {/* After */}
        <div className="rounded-[12px] border-[1.5px] border-[#A9D8BC] bg-v2-pass-surface px-5 py-5">
          <p className="font-mono mb-3 text-[11px] tracking-[0.06em] text-v2-pass">AFTER</p>
          {row.isCTA ? (
            <div className="inline-flex items-center rounded-[8px] bg-v2-pass px-4 py-2.5">
              <span className="text-[15px] font-semibold text-white">{after?.text}</span>
            </div>
          ) : (
            <p className={`${row.textSize ?? "text-[16px]"} font-bold leading-[1.55] text-[#143322]`}>{after?.text}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReportCopyStudioV2({ copyVariants, lockedAfter }: Props) {
  const rows: CopyRow[] = [
    { index: 1, label: "Hero headline", block: copyVariants.headline, badge: "AUDIENCE UNCLEAR", textSize: "text-[18px]" },
    { index: 2, label: "Subheadline", block: copyVariants.subheadline, badge: "LOW CONTRAST · VAGUE", textSize: "text-[16px]" },
    { index: 3, label: "Primary CTA", block: copyVariants.cta, badge: "NO OFFER STATED", isCTA: true },
  ].filter((r) => r.block?.current || r.block?.variants?.[0]?.text);

  if (rows.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-[16px] border border-v2-card-border bg-v2-card shadow-[0_1px_2px_rgba(27,26,23,0.03)]">
      {/* Section header */}
      <div className="flex items-center gap-2.5 border-b border-v2-card-divider px-6 py-[18px]">
        <RiQuillPenLine size={20} className="text-v2-ink" />
        <span className="text-[19px] font-semibold tracking-[-0.01em] text-v2-ink">Copy studio</span>
        <span className="font-mono ml-auto text-[11.5px] tracking-[0.04em] text-v2-ink-faint">
          BEFORE → AFTER
        </span>
      </div>

      {rows.map((row, i) => (
        <div
          key={row.label}
          className={[
            i > 0 ? "border-t border-v2-card-divider" : "",
            lockedAfter !== undefined && i >= lockedAfter ? "opacity-30 blur-sm pointer-events-none select-none" : "",
          ].filter(Boolean).join(" ")}
        >
          {/* Row header */}
          <div className="flex items-center gap-2.5 px-6 pb-4 pt-5">
            <span className="font-mono text-[12px] text-v2-ink-hairline">
              {String(row.index).padStart(2, "0")}
            </span>
            <span className="text-[16px] font-bold tracking-[-0.01em] text-v2-ink">{row.label}</span>
            {row.badge && (
              <span className="font-mono ml-auto shrink-0 rounded-full bg-v2-critical-bg px-[11px] py-[5px] text-[10.5px] tracking-[0.05em] text-v2-critical">
                {row.badge}
              </span>
            )}
          </div>

          <CopyBeforeAfter row={row} />
        </div>
      ))}

      {/* Footer stat */}
      <div className="border-t border-v2-card-divider px-6 py-4">
        <p className="text-[13px] leading-[1.5] text-v2-ink-muted">
          Specific CTAs convert{" "}
          <b className="font-semibold text-v2-ink-secondary">202% better</b>{" "}
          than generic ones —{" "}
          <a
            href="https://blog.hubspot.com/marketing/personalized-calls-to-action-convert-better-data"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted underline-offset-2 hover:text-v2-ink-secondary transition-colors"
          >
            HubSpot, 330k CTAs analysed
          </a>
          .
        </p>
      </div>
    </section>
  );
}
