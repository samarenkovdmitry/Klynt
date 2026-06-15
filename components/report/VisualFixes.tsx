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
  ReportVisualFix,
  ReportVisualPass,
  VisualFixDimension,
} from "@/lib/audit-report";
import { getVisualFixDimensionLabel } from "@/lib/report-visual-fixes";
import { ReportSectionShell } from "@/components/report/ReportSectionShell";
import {
  REPORT_PANEL_HEADER_CLASS,
  REPORT_PANEL_META_CLASS,
  REPORT_PANEL_TITLE_CLASS,
  REPORT_ROW_DIVIDER_CLASS,
  REPORT_SURFACE_CARD_CLASS,
} from "@/components/report/reportStyles";

type Props = {
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
    <div className="rounded-[16px] border border-[rgba(6,28,47,0.06)] bg-[#FAFBFC] p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon size={16} className="shrink-0 text-[#7D8C99]" aria-hidden />
        <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#7D8C99]">
          {label}
        </span>
      </div>
      <p className="text-[14px] leading-6 text-[rgba(6,28,47,0.72)]">{fix.observation}</p>
      <div className="mt-3 rounded-[12px] border border-[rgba(6,28,47,0.06)] bg-white px-3 py-2.5">
        <p className="text-[14px] leading-6 text-[#061C2F]">
          <span className="font-medium text-[#10B981]">→ </span>
          {fix.recommendation}
        </p>
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
        "flex items-start gap-3 px-5 py-4 md:px-6",
        isLast ? "" : REPORT_ROW_DIVIDER_CLASS,
      ].join(" ")}
    >
      <Icon size={16} className="mt-0.5 shrink-0 text-[#7D8C99]" aria-hidden />
      <div className="min-w-0 flex-1">
        <span className="text-[15px] font-medium text-[#061C2F]">{label}</span>
        <span className="text-[15px] text-[#7D8C99]"> · {pass.note}</span>
      </div>
      <span className="shrink-0 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[13px] font-semibold text-[#059669]">
        Aligned
      </span>
    </div>
  );
}

export function VisualFixes({ visualFixes, visualPasses }: Props) {
  const fixes = visualFixes ?? [];
  const passes = visualPasses ?? [];
  const [passVisible, setPassVisible] = useState(fixes.length === 0 && passes.length > 0);

  if (fixes.length === 0 && passes.length === 0) {
    return null;
  }

  const meta =
    fixes.length > 0
      ? `${fixes.length} insight${fixes.length !== 1 ? "s" : ""}${
          passes.length > 0 ? ` · ${passes.length} aligned` : ""
        }`
      : `${passes.length} aligned`;

  return (
    <section id="visual-fixes" className="mt-12 scroll-mt-24">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-[20px] font-semibold leading-7 tracking-[-0.02em] text-[#061C2F]">
          <RiPaletteLine size={20} className="text-[#7D8C99]" aria-hidden />
          Visual fixes
        </h2>
        <span className="text-[14px] text-[#7D8C99]">{meta}</span>
      </div>

      <div className={REPORT_SURFACE_CARD_CLASS}>
        <div className={REPORT_PANEL_HEADER_CLASS}>
          <div className={REPORT_PANEL_TITLE_CLASS}>
            <RiPaletteLine size={20} className="text-[#7D8C99]" aria-hidden />
            Design recommendations
          </div>
          <span className={REPORT_PANEL_META_CLASS}>from screenshot</span>
        </div>

        {fixes.length > 0 ? (
          <div className="grid gap-4 p-5 md:grid-cols-2 md:p-6">
            {fixes.map((fix) => (
              <VisualFixCard key={fix.dimension} fix={fix} />
            ))}
          </div>
        ) : (
          <div className="px-5 py-4 md:px-6">
            <div className="flex items-start gap-2 rounded-[16px] bg-[#FAFBFC] px-4 py-3">
              <RiCheckboxCircleFill size={16} className="mt-0.5 shrink-0 text-[#10B981]" aria-hidden />
              <p className="text-[14px] leading-6 text-[rgba(6,28,47,0.72)]">
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
              className="flex w-full items-center justify-center gap-1.5 border-t border-[#EBEFF3] px-5 py-3.5 text-[14px] text-[#7D8C99] transition-colors hover:text-[#061C2F]"
            >
              {passVisible ? <RiEyeOffLine size={16} aria-hidden /> : <RiEyeLine size={16} aria-hidden />}
              {passVisible
                ? "Hide aligned visual checks"
                : `Show ${passes.length} aligned visual check${passes.length !== 1 ? "s" : ""}`}
            </button>
            {passVisible
              ? passes.map((pass, index) => (
                  <VisualPassRow
                    key={pass.dimension}
                    pass={pass}
                    isLast={index === passes.length - 1}
                  />
                ))
              : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
