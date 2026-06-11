"use client";

import { useState } from "react";
import {
  RiAlignVertically,
  RiCheckboxCircleFill,
  RiCursorLine,
  RiEyeLine,
  RiEyeOffLine,
  RiLayoutGridLine,
  RiPaletteLine,
  RiRoundedCorner,
  RiStackLine,
  RiText,
} from "@remixicon/react";
import type {
  ReportChecklistItem,
  ReportVisualFix,
  ReportVisualPass,
  VisualFixDimension,
} from "@/lib/audit-report";
import {
  getVisualFixDimensionLabel,
  normalizeVisualSection,
} from "@/lib/report-visual-fixes";
import { REPORT_SECTION_SCROLL_MARGIN_CLASS, REPORT_SECTION_SPACING_CLASS } from "@/components/report/reportStyles";

type Props = {
  checklist?: ReportChecklistItem[];
  visualFixes?: ReportVisualFix[];
  visualPasses?: ReportVisualPass[];
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

function VisualPassRow({
  pass,
  isLast,
}: {
  pass: ReportVisualPass;
  isLast: boolean;
}) {
  const Icon = DIMENSION_ICONS[pass.dimension];
  const label = getVisualFixDimensionLabel(pass.dimension);

  return (
    <div
      className={[
        "flex items-start gap-2 py-[9px]",
        !isLast ? "border-b border-[rgba(0,0,0,0.07)]" : "",
      ].join(" ")}
    >
      <Icon size={13} className="mt-0.5 shrink-0 text-[#8E99A2]" aria-hidden />
      <div className="min-w-0 flex-1">
        <span className="text-[12px] font-medium text-[#111]">{label}</span>
        <span className="text-[12px] text-[#999]"> · {pass.note}</span>
      </div>
      <span className="shrink-0 rounded-full bg-[#E8F7F2] px-2 py-0.5 text-[11px] font-medium text-[#0F6E56]">
        Aligned
      </span>
    </div>
  );
}

export function VisualFixes({ checklist, visualFixes, visualPasses }: Props) {
  const [passVisible, setPassVisible] = useState(false);
  const { fixes, passes } = normalizeVisualSection(visualFixes, visualPasses, checklist);

  if (fixes.length === 0 && passes.length === 0) {
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
            {fixes.length > 0 ? (
              <>
                <span className="font-medium text-[#111]">
                  {fixes.length} insight{fixes.length !== 1 ? "s" : ""}
                </span>
                {passes.length > 0 ? (
                  <>
                    {" · "}
                    <span className="font-medium text-[#1D9E75]">
                      {passes.length} aligned
                    </span>
                  </>
                ) : null}
              </>
            ) : (
              <span className="font-medium text-[#1D9E75]">{passes.length} aligned</span>
            )}
          </span>
        </div>

        {fixes.length > 0 ? (
          <div className="grid gap-2.5 px-5 pb-4 sm:grid-cols-2">
            {fixes.map((fix) => (
              <VisualFixCard key={fix.dimension} fix={fix} />
            ))}
          </div>
        ) : (
          <div className="px-5 pb-3">
            <div className="flex items-start gap-2 rounded-[10px] bg-[#F5F5F3] px-[11px] py-[9px]">
              <RiCheckboxCircleFill size={14} className="mt-0.5 shrink-0 text-[#1D9E75]" aria-hidden />
              <p className="text-[12px] leading-[1.6] text-[#555]">
                Visual language aligns with this product&apos;s context — expand aligned checks below.
              </p>
            </div>
          </div>
        )}

        {passes.length > 0 ? (
          <>
            <button
              type="button"
              onClick={() => setPassVisible((value) => !value)}
              className="flex w-full items-center gap-1.5 border-t border-[rgba(0,0,0,0.07)] px-5 pb-[14px] pt-[10px] text-[12px] text-[#999] transition-colors hover:text-[#111]"
            >
              {passVisible ? (
                <RiEyeOffLine size={14} aria-hidden />
              ) : (
                <RiEyeLine size={14} aria-hidden />
              )}
              <span>
                {passVisible
                  ? "Hide aligned visual checks"
                  : `Show ${passes.length} aligned visual check${passes.length !== 1 ? "s" : ""}`}
              </span>
            </button>

            <div
              style={{
                maxHeight: passVisible ? `${passes.length * 44 + 8}px` : "0",
                overflow: "hidden",
                transition: "max-height 0.25s ease",
              }}
            >
              <div className="border-t border-[rgba(0,0,0,0.07)] px-5 pb-2">
                {passes.map((pass, index) => (
                  <VisualPassRow
                    key={pass.dimension}
                    pass={pass}
                    isLast={index === passes.length - 1}
                  />
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
