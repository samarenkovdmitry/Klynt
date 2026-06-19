"use client";

import { useState } from "react";
import {
  RiAlignVertically,
  RiArrowDownSLine,
  RiArrowRightLine,
  RiContrastLine,
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
  REPORT_SECTION_SCROLL_MARGIN_CLASS,
  REPORT_SECTION_SPACING_CLASS,
} from "@/components/report/reportStyles";

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
  color_contrast: RiContrastLine,
};

function highlightVisualText(text: string): React.ReactNode {
  const PATTERN = /(#[0-9a-fA-F]{3,6}\b|\b\d+(?:\.\d+)?(?:px|rem|em|%)\b)/gi;
  const parts = text.split(PATTERN);
  if (parts.length === 1) return text;

  return (
    <>
      {parts.map((part, i) => {
        if (/^#[0-9a-fA-F]{3,6}$/i.test(part)) {
          return (
            <span key={i} className="inline-flex items-center gap-1">
              <span
                className="inline-block h-3 w-3 shrink-0 rounded-full border border-black/10 align-middle"
                style={{ backgroundColor: part }}
                aria-hidden
              />
              <span className="font-mono text-[12px]">{part}</span>
            </span>
          );
        }
        if (/^\d+(?:\.\d+)?(?:px|rem|em|%)$/i.test(part)) {
          return (
            <code key={i} className="rounded bg-[#ECF0F6] px-[5px] py-px font-mono text-[12px] text-[#4a5568]">
              {part}
            </code>
          );
        }
        return part || null;
      })}
    </>
  );
}

function VisualFixColumn({
  fix,
  hasBorderRight,
  hasBorderTop,
}: {
  fix: ReportVisualFix;
  hasBorderRight: boolean;
  hasBorderTop: boolean;
}) {
  const Icon = DIMENSION_ICONS[fix.dimension];
  const label = getVisualFixDimensionLabel(fix.dimension);

  return (
    <div
      className={[
        "p-6",
        hasBorderRight ? "border-r border-[#eef1f5]" : "",
        hasBorderTop ? "border-t border-[#eef1f5]" : "",
      ].filter(Boolean).join(" ")}
    >
      <div className="mb-2.5 flex items-center gap-2">
        <Icon size={16} className="shrink-0 text-[#7D8C99]" aria-hidden />
        <span className="text-[15px] font-semibold text-[#061C2F]">{label}</span>
      </div>
      <p className="mb-3 text-[14px] leading-5 text-[#8E99A2]">{highlightVisualText(fix.observation)}</p>
      <div className="rounded-[10px] bg-[#EFF3F6] px-[14px] py-3">
        <p className="flex items-start gap-2 text-[14px] leading-5 text-[#061C2F]">
          <RiArrowRightLine
            size={15}
            className="mt-0.5 shrink-0 text-status-good"
            aria-hidden
          />
          {highlightVisualText(fix.recommendation)}
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
        "flex items-center gap-3 px-6 py-4",
        isLast ? "" : "border-b border-[#eef1f5]",
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
      {/* Outer card */}
      {fixes.length > 0 ? (
        <div className="overflow-hidden rounded-[14px] border border-[#e6e9ef] bg-white">
          {/* Header band */}
          <div className="flex items-center gap-2 border-b border-[#eef1f5] bg-[#fafbfc] px-6 py-[18px]">
            <div
              className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-[#eef1f6]"
              aria-hidden
            >
              <RiPaletteLine size={18} className="text-[#5B6378]" />
            </div>
            <span className="text-[20px] font-semibold leading-7 tracking-[-0.02em] text-[#061C2F]">
              Visual fixes
            </span>
            <span className="ml-auto text-[14px] leading-5 text-[#8E99A2]">
              {insightCount} insight{insightCount !== 1 ? "s" : ""}
            </span>
          </div>
          {/* 2-column content grid */}
          <div className="grid grid-cols-2">
            {fixes.map((fix, index) => (
              <VisualFixColumn
                key={fix.dimension}
                fix={fix}
                hasBorderRight={index % 2 === 0}
                hasBorderTop={index >= 2}
              />
            ))}
          </div>

          {passes.length > 0 ? (
            <>
              <button
                type="button"
                onClick={() => setPassVisible((value) => !value)}
                className="flex w-full items-center gap-1.5 border-t border-[#eef1f5] px-6 pb-6 pt-[22px] text-[13px] text-[#8E99A2] transition-colors hover:text-[#061C2F]"
              >
                <RiArrowDownSLine
                  size={16}
                  aria-hidden
                  className={`transition-transform duration-300 ${passVisible ? "rotate-180" : ""}`}
                />
                {passVisible
                  ? "Hide aligned visual checks"
                  : `Show ${passes.length} aligned visual check${passes.length !== 1 ? "s" : ""}`}
              </button>

              <div
                className="overflow-hidden transition-[max-height] duration-300 ease-out"
                style={{
                  maxHeight: passVisible ? `${passes.length * 80 + 32}px` : "0px",
                }}
              >
                {passes.map((pass, index) => (
                  <VisualPassRow
                    key={pass.dimension}
                    pass={pass}
                    isLast={index === passes.length - 1}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
