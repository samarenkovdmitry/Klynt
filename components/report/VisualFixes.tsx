"use client";

import { useState } from "react";
import {
  RiAlignVertically,
  RiArrowDownSLine,
  RiArrowRightLine,
  RiCursorLine,
  RiLayoutGridLine,
  RiLock2Line,
  RiPaletteLine,
  RiRoundedCorner,
  RiStackLine,
  RiText,
  RiVipCrownFill,
} from "@remixicon/react";
import type {
  ReportVisualFix,
  ReportVisualPass,
  VisualFixDimension,
} from "@/lib/audit-report";
import { getVisualFixDimensionLabel } from "@/lib/report-visual-fixes";
import {
  REPORT_ROW_DIVIDER_CLASS,
  REPORT_SECTION_SCROLL_MARGIN_CLASS,
  REPORT_SECTION_SPACING_CLASS,
} from "@/components/report/reportStyles";
import type { RequestProUpgrade } from "@/lib/freemium";

type Props = {
  visualFixes?: ReportVisualFix[];
  visualPasses?: ReportVisualPass[];
  previewLocked?: boolean;
  onRequestProUpgrade?: RequestProUpgrade;
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
    <div className="rounded-[16px] border border-[#E5E5E5] bg-white p-5">
      <div className="mb-2.5 flex items-center gap-2">
        <Icon size={16} className="shrink-0 text-[#7D8C99]" aria-hidden />
        <span className="text-[15px] font-semibold text-[#061C2F]">{label}</span>
      </div>
      <p className="mb-3 text-[14px] leading-5 text-[#8E99A2]">{fix.observation}</p>
      <div className="rounded-[10px] bg-[#EFF3F6] px-[14px] py-3">
        <p className="flex items-start gap-2 text-[14px] leading-5 text-[#061C2F]">
          <RiArrowRightLine
            size={15}
            className="mt-0.5 shrink-0 text-[#1D9E75]"
            aria-hidden
          />
          {fix.recommendation}
        </p>
      </div>
    </div>
  );
}

function LockedFixCard({
  fix,
  onRequestProUpgrade,
}: {
  fix: ReportVisualFix;
  onRequestProUpgrade?: RequestProUpgrade;
}) {
  const Icon = DIMENSION_ICONS[fix.dimension];
  const label = getVisualFixDimensionLabel(fix.dimension);

  return (
    <div
      className="cursor-pointer rounded-[16px] border border-[#E5E5E5] bg-white p-5"
      onClick={() => onRequestProUpgrade?.()}
    >
      <div className="mb-3 flex items-center gap-2">
        <Icon size={16} className="shrink-0 text-[#7D8C99]" aria-hidden />
        <span className="text-[15px] font-semibold text-[#061C2F]">{label}</span>
      </div>
      <div className="space-y-2">
        <div className="h-2.5 w-full rounded-full bg-[#DDE5ED]" />
        <div className="h-2.5 w-4/5 rounded-full bg-[#DDE5ED]" />
      </div>
      <div className="my-4 flex justify-center">
        <RiLock2Line size={18} className="text-[#8F99A2]" aria-hidden />
      </div>
      <div className="space-y-2">
        <div className="h-2.5 w-3/4 rounded-full bg-[#DDE5ED]" />
        <div className="h-2.5 w-1/2 rounded-full bg-[#DDE5ED]" />
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
        "flex items-center gap-3 px-5 py-4",
        isLast ? "" : REPORT_ROW_DIVIDER_CLASS,
      ].join(" ")}
    >
      <Icon size={16} className="shrink-0 text-[#7D8C99]" aria-hidden />
      <div className="min-w-0 flex-1">
        <span className="text-[15px] font-medium text-[#061C2F]">{label}</span>
        <span className="mx-2 text-[#7D8C99]">·</span>
        <span className="text-[15px] text-[#7D8C99]">{pass.note}</span>
      </div>
      <span className="shrink-0 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[13px] font-medium text-[#059669]">
        Aligned
      </span>
    </div>
  );
}

export function VisualFixes({
  visualFixes,
  visualPasses,
  previewLocked = false,
  onRequestProUpgrade,
}: Props) {
  const fixes = visualFixes ?? [];
  const passes = visualPasses ?? [];
  const [passVisible, setPassVisible] = useState(false);

  if (fixes.length === 0 && passes.length === 0) return null;

  const insightCount = fixes.length;

  return (
    <section
      id="visual-fixes"
      className={`${REPORT_SECTION_SPACING_CLASS} ${REPORT_SECTION_SCROLL_MARGIN_CLASS}`}
    >
      {/* Floating pill header */}
      <div className="mb-2 flex items-center justify-between gap-4 rounded-full bg-[#EFF3F6] px-5 py-3 md:px-6">
        <div className="flex items-center gap-2 text-[20px] font-semibold leading-7 tracking-[-0.02em] text-[#061C2F]">
          <RiPaletteLine size={20} className="text-[#7D8C99]" aria-hidden />
          Visual fixes
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[14px] leading-5 text-[#7D8C99]">
            {insightCount} insight{insightCount !== 1 ? "s" : ""}
          </span>
          {previewLocked || fixes.length > 1 ? (
            <>
              <span className="h-6 w-px bg-[#D0D5DA]" aria-hidden />
              <span className="text-[14px] leading-5 text-[#7D8C99]">Unlock all in</span>
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold text-white [background:linear-gradient(to_top_right,#18181B,#373473,#201F32)]">
                <RiVipCrownFill size={12} aria-hidden />
                PRO
              </span>
            </>
          ) : null}
        </div>
      </div>

      {/* Cards grid */}
      {fixes.length > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {fixes.map((fix, i) =>
            (previewLocked || fixes.length > 1) && i > 0 ? (
              <LockedFixCard
                key={fix.dimension}
                fix={fix}
                onRequestProUpgrade={onRequestProUpgrade}
              />
            ) : (
              <VisualFixCard key={fix.dimension} fix={fix} />
            )
          )}
        </div>
      ) : null}

      {/* Passes toggle */}
      {passes.length > 0 ? (
        <>
          {!passVisible ? (
            <button
              type="button"
              onClick={() => setPassVisible(true)}
              className="mt-3 flex items-center gap-1.5 text-[13px] text-[#8E99A2] transition-colors hover:text-[#061C2F]"
            >
              <RiArrowDownSLine size={16} aria-hidden />
              {`Show ${passes.length} aligned visual check${passes.length !== 1 ? "s" : ""}`}
            </button>
          ) : null}

          <div
            className="overflow-hidden transition-[max-height] duration-300 ease-out"
            style={{
              maxHeight: passVisible ? `${passes.length * 64 + 8}px` : "0px",
            }}
          >
            <div className="mt-3 overflow-hidden rounded-[16px] border border-[#E5E5E5] bg-white">
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
    </section>
  );
}
