"use client";

import {
  RiAlignVertically,
  RiCursorLine,
  RiLayoutGridLine,
  RiPaletteLine,
  RiRoundedCorner,
  RiStackLine,
  RiText,
} from "@remixicon/react";
import type { ReportChecklistItem, ReportVisualFix, VisualFixDimension } from "@/lib/audit-report";
import {
  getVisualFixDimensionLabel,
  normalizeReportVisualFixes,
} from "@/lib/report-visual-fixes";
import { REPORT_SECTION_SCROLL_MARGIN_CLASS, REPORT_SECTION_SPACING_CLASS } from "@/components/report/reportStyles";

type Props = {
  checklist?: ReportChecklistItem[];
  visualFixes?: ReportVisualFix[];
};

const DIMENSION_ICONS: Record<VisualFixDimension, typeof RiPaletteLine> = {
  border_radius: RiRoundedCorner,
  density: RiLayoutGridLine,
  color_tone: RiPaletteLine,
  spacing: RiAlignVertically,
  cta_hierarchy: RiCursorLine,
  typography: RiText,
  depth: RiStackLine,
};

function VisualFixCard({ fix }: { fix: ReportVisualFix }) {
  const Icon = DIMENSION_ICONS[fix.dimension];
  const label = getVisualFixDimensionLabel(fix.dimension);

  return (
    <div className="rounded-[10px] border border-[rgba(0,0,0,0.06)] bg-[#FAFAF8] px-[11px] py-[10px]">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Icon size={13} className="shrink-0 text-[#8E99A2]" aria-hidden />
        <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#999]">
          {label}
        </span>
      </div>
      <p className="text-[12px] leading-[1.55] text-[#555]">{fix.observation}</p>
      <div className="mt-2 flex items-start gap-2 rounded-[8px] bg-white px-2.5 py-2">
        <span className="mt-px shrink-0 text-[12px] text-[#1D9E75]">→</span>
        <p className="text-[12px] leading-[1.6] text-[#333]">{fix.recommendation}</p>
      </div>
    </div>
  );
}

export function VisualFixes({ checklist, visualFixes }: Props) {
  const fixes = normalizeReportVisualFixes(visualFixes, checklist);

  if (fixes.length === 0) {
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
          <span className="text-[12px] text-[#C0C0BC]">
            {fixes.length} insight{fixes.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="grid gap-2.5 px-5 pb-4 sm:grid-cols-2">
          {fixes.map((fix) => (
            <VisualFixCard key={fix.dimension} fix={fix} />
          ))}
        </div>
      </div>
    </div>
  );
}
