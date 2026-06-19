"use client";

import { useState } from "react";
import {
  RiAlignVertically,
  RiArrowDownSLine,
  RiArrowRightLine,
  RiCursorLine,
  RiGroupLine,
  RiH1,
  RiLayoutGridLine,
  RiNavigationLine,
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
import {
  REPORT_ROW_DIVIDER_CLASS,
  REPORT_SECTION_SCROLL_MARGIN_CLASS,
  REPORT_SECTION_SPACING_CLASS,
} from "@/components/report/reportStyles";
import { SectionHeader } from "@/components/report/ReportSectionHeader";

type Props = {
  visualFixes?: ReportVisualFix[];
  visualPasses?: ReportVisualPass[];
  /** @deprecated Visual fixes are fully unlocked for now */
  previewLocked?: boolean;
  isDemo?: boolean;
  /** @deprecated Visual fixes are fully unlocked for now */
  onRequestProUpgrade?: () => void;
};

const DIMENSION_ICONS: Record<VisualFixDimension, typeof RiPaletteLine> = {
  border_radius: RiRoundedCorner,
  density: RiLayoutGridLine,
  color_tone: RiPaletteLine,
  spacing: RiAlignVertically,
  cta_hierarchy: RiCursorLine,
  typography: RiText,
  depth: RiStackLine,
  navigation: RiNavigationLine,
  social_proof: RiGroupLine,
  headline_formula: RiH1,
};

function VisualFixCard({ fix }: { fix: ReportVisualFix }) {
  const Icon = DIMENSION_ICONS[fix.dimension];
  const label = getVisualFixDimensionLabel(fix.dimension);

  return (
    <div className="rounded-[16px] bg-white p-5 shadow-[0_0_0_1px_rgba(6,28,47,0.08)]">
      <div className="mb-2.5 flex items-center gap-2">
        <Icon size={16} className="shrink-0 text-[#7D8C99]" aria-hidden />
        <span className="text-[15px] font-semibold text-[#061C2F]">{label}</span>
      </div>
      <p className="mb-3 text-[14px] leading-5 text-[#8E99A2]">{fix.observation}</p>
      <div className="rounded-[10px] bg-[#EFF3F6] px-[14px] py-3">
        <p className="flex items-start gap-2 text-[14px] leading-5 text-[#061C2F]">
          <RiArrowRightLine
            size={15}
            className="mt-0.5 shrink-0 text-status-good"
            aria-hidden
          />
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
      <span className="shrink-0 rounded-full bg-status-good/10 px-2.5 py-1 text-[13px] font-medium text-status-good">
        Aligned
      </span>
    </div>
  );
}

export function VisualFixes({
  visualFixes,
  visualPasses,
}: Props) {
  const fixes = visualFixes ?? [];
  const passes = visualPasses ?? [];
  const [passVisible, setPassVisible] = useState(fixes.length < 2);

  if (fixes.length === 0 && passes.length === 0) return null;

  const insightCount = fixes.length;
  const checkCount = passes.length;

  return (
    <section
      id="visual-fixes"
      className={`${REPORT_SECTION_SPACING_CLASS} ${REPORT_SECTION_SCROLL_MARGIN_CLASS}`}
    >
      <SectionHeader
        icon={RiPaletteLine}
        title="Visual fixes"
        trailing={
          <div className="flex items-center gap-2.5">
            <span className="text-[14px] leading-5 text-[#8E99A2]">
              {insightCount} fix{insightCount !== 1 ? "es" : ""}
              {checkCount > 0
                ? ` · ${checkCount} aligned check${checkCount !== 1 ? "s" : ""}`
                : ""}
            </span>
          </div>
        }
      />

      {/* Cards grid */}
      {fixes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {fixes.map((fix) => (
            <VisualFixCard key={fix.dimension} fix={fix} />
          ))}
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
            className="overflow-hidden pb-0.5 transition-[max-height] duration-300 ease-out"
            style={{
              maxHeight: passVisible ? `${passes.length * 120 + 24}px` : "0px",
            }}
          >
            <div className="mt-3 rounded-[16px] bg-white shadow-[0_0_0_1px_rgba(6,28,47,0.08)]">
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
