"use client";

import { RiShieldCheckLine, RiErrorWarningLine } from "@remixicon/react";
import type { ReportMeta } from "@/lib/audit-report";

type Props = {
  meta: ReportMeta;
};

export function ReportTrustMetaPanel({ meta }: Props) {
  const trustGaps = [
    meta.proof_suggestion,
    ...(meta.trust_notes ?? []),
  ].filter(Boolean) as string[];

  return (
    <section className="overflow-hidden rounded-[16px] border border-v2-card-border bg-v2-card shadow-[0_1px_2px_rgba(27,26,23,0.03)]">
      <div className="flex items-center gap-2.5 border-b border-v2-card-divider px-6 py-[18px]">
        <RiShieldCheckLine size={20} className="text-v2-ink" />
        <span className="text-[19px] font-semibold tracking-[-0.01em] text-v2-ink">Trust &amp; meta</span>
        {trustGaps.length > 0 && (
          <span className="font-mono ml-auto text-[11.5px] tracking-[0.04em] text-v2-ink-faint">
            {trustGaps.length} GAP{trustGaps.length !== 1 ? "S" : ""}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 divide-y divide-v2-card-divider sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        {/* Trust gaps */}
        <div className="p-6">
          <p className="mb-3 text-[15px] font-semibold text-v2-ink">
            {trustGaps.length > 0 ? "Trust gaps to address" : "Trust signals"}
          </p>
          {trustGaps.length > 0 ? (
            <div className="flex flex-col gap-2">
              {trustGaps.map((gap, i) => (
                <div key={i} className="flex items-start gap-2.5 py-1.5">
                  <RiErrorWarningLine size={15} className="mt-px shrink-0 text-v2-critical-text" />
                  <span className="text-[14px] leading-[1.45] text-v2-dark-alt">{gap}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[14px] leading-[1.5] text-v2-ink-muted">No trust gaps identified.</p>
          )}
        </div>

        {/* Meta suggestions */}
        <div className="p-6">
          <p className="font-mono mb-1.5 text-[10.5px] tracking-[0.06em] text-v2-ink-hairline">META TITLE</p>
          <p className="mb-4 text-[15px] font-semibold tracking-[-0.01em] text-v2-ink">
            {meta.title_suggestion}
          </p>
          <p className="font-mono mb-1.5 text-[10.5px] tracking-[0.06em] text-v2-ink-hairline">META DESCRIPTION</p>
          <p className="text-[13.5px] leading-[1.5] text-v2-dark-alt">{meta.description_suggestion}</p>
        </div>
      </div>
    </section>
  );
}
