"use client";

import { RiPaletteLine } from "@remixicon/react";
import type { ReportChecklistItem } from "@/lib/audit-report";
import { REPORT_SECTION_SCROLL_MARGIN_CLASS, REPORT_SECTION_SPACING_CLASS } from "@/components/report/reportStyles";

type Props = {
  checklist?: ReportChecklistItem[];
};

function buildVisualFixText(item: ReportChecklistItem): string {
  if (item.id === "subheadline-clarity") {
    return "Increase subheadline to 18px weight 500 — currently reads as a caption, not a value proposition";
  }

  return item.text;
}

export function VisualFixes({ checklist }: Props) {
  const visualGap = checklist?.find(
    (item) => item.link_to === "visual-fixes" && item.status === "weak"
  );

  if (!visualGap) {
    return null;
  }

  return (
    <div
      id="visual-fixes"
      className={[REPORT_SECTION_SPACING_CLASS, REPORT_SECTION_SCROLL_MARGIN_CLASS].join(" ")}
    >
      <div className="overflow-hidden rounded-[16px] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.04),0_4px_20px_rgba(0,0,0,0.07)]">
        <div className="flex items-center justify-between px-5 pb-2.5 pt-3.5">
          <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.07em] text-[#999]">
            <RiPaletteLine size={14} aria-hidden />
            Visual fixes
          </span>
          <span className="rounded-full bg-[#EBF3FC] px-2 py-0.5 text-[11px] font-medium text-[#185FA5]">
            Phase 2
          </span>
        </div>

        <div className="px-5 pb-4">
          <div className="flex items-start gap-2 rounded-[10px] bg-[#F5F5F3] px-[11px] py-[9px]">
            <span className="mt-px shrink-0 text-[13px] text-[#1D9E75]">→</span>
            <span className="text-[12px] leading-[1.65] text-[#555]">
              {buildVisualFixText(visualGap)}
            </span>
          </div>

          <p className="mt-3 text-[12px] leading-[1.5] text-[#999]">
            Contrast and typography tables arrive in Phase 2 with page-specific measurements.
          </p>
        </div>
      </div>
    </div>
  );
}
