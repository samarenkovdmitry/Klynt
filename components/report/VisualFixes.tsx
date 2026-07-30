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
  REPORT_NEW_SECTION_BODY_GAP_CLASS,
  ReportNewSectionHeader,
} from "@/components/report/ReportNewSectionHeader";
import {
  REPORT_SECTION_SCROLL_MARGIN_CLASS,
  REPORT_SECTION_SPACING_CLASS,
  REPORT_SURFACE_SHADOW_CLASS,
  REPORT_SURFACE_BORDER_CLASS,
  REPORT_HERO_RADIUS_CLASS,
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

const IMPACT_LABEL: Record<NonNullable<ReportVisualFix["impact"]>, string> = {
  high: "high",
  medium: "medium",
  low: "low",
};

const IMPACT_BADGE_CLASS: Record<NonNullable<ReportVisualFix["impact"]>, string> = {
  high: "bg-[#FDEAEA] text-[#FF5A4F]",
  medium: "bg-[#FFF5DC] text-[#D08700]",
  low: "bg-[#EEF1F5] text-[#8B95A7]",
};

const FIX_CARD_CLASS = [
  "overflow-hidden bg-white",
  REPORT_HERO_RADIUS_CLASS,
  REPORT_SURFACE_BORDER_CLASS,
  REPORT_SURFACE_SHADOW_CLASS,
].join(" ");

const ALIGNED_PANEL_CLASS = [
  "overflow-hidden bg-white rounded-[14px]",
  REPORT_SURFACE_BORDER_CLASS,
  REPORT_SURFACE_SHADOW_CLASS,
].join(" ");

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

const INLINE_VALUE_CHIP_CLASS =
  "inline-flex items-center rounded-md border border-[#E8EBF0] bg-white px-1.5 py-px font-mono text-[13.5px] leading-[19px] text-[#34405A] align-middle";

function highlightVisualText(text: string): React.ReactNode {
  const PATTERN =
    /(#[0-9a-fA-F]{3,6}\b|\b\d+(?:\.\d+)?(?:[–-]\d+(?:\.\d+)?)?(?:px|rem|em|%)\b)/gi;
  const parts = text.split(PATTERN);
  if (parts.length === 1) return text;

  return (
    <>
      {parts.map((part, i) => {
        if (/^#[0-9a-fA-F]{3,6}$/i.test(part) || /^\d+(?:\.\d+)?(?:[–-]\d+(?:\.\d+)?)?(?:px|rem|em|%)$/i.test(part)) {
          return (
            <span key={i} className={INLINE_VALUE_CHIP_CLASS}>
              {part}
            </span>
          );
        }
        return part || null;
      })}
    </>
  );
}

function VisualFixCard({ fix }: { fix: ReportVisualFix }) {
  const Icon = DIMENSION_ICONS[fix.dimension];
  const label = fix.title ?? getVisualFixDimensionLabel(fix.dimension);

  return (
    <article className={FIX_CARD_CLASS}>
      <div className="px-[25px] pb-[25px] pt-[23px]">
        <div className="mb-2 flex items-center gap-2">
          <Icon size={18} className="shrink-0 text-[#5B6378]" aria-hidden />
          <span className="text-[15px] font-bold leading-[21px] text-[#061C2F]">{label}</span>
          {fix.impact ? (
            <span
              className={`ml-auto inline-flex h-[27px] shrink-0 items-center rounded-full px-3 text-[13px] font-bold ${IMPACT_BADGE_CLASS[fix.impact]}`}
            >
              {IMPACT_LABEL[fix.impact]}
            </span>
          ) : null}
        </div>

        {fix.element ? (
          <p className="mb-2 text-[13.5px] leading-[17px] text-[#8B95A7]">on: {fix.element}</p>
        ) : null}

        <p className="mb-4 text-[15px] leading-[22.5px] text-[#6B7488]">
          {highlightVisualText(fix.observation)}
        </p>

        <div className="rounded-[10px] bg-[#EFF2F6] px-[15px] py-3">
          <div className="flex items-start gap-2">
            <RiArrowRightLine
              size={17}
              className="mt-0.5 shrink-0 text-[#1D9E75]"
              aria-hidden
            />
            <p className="min-w-0 flex-1 text-[14.5px] leading-[21px] text-[#061C2F]">
              {highlightVisualText(fix.recommendation)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function formatPassText(pass: ReportVisualPass): string {
  const note = pass.note.trim();
  if (/^[A-Z]/.test(note)) {
    return note;
  }
  const label = getVisualFixDimensionLabel(pass.dimension);
  const shortLabel = label.split(/\s*[&·]\s*/)[0]?.trim() || label;
  return `${shortLabel} ${note}`;
}

function VisualPassRow({
  pass,
  isLast,
}: {
  pass: ReportVisualPass;
  isLast: boolean;
}) {
  const displayText = formatPassText(pass);

  return (
    <div
      className={[
        "flex items-center gap-3 px-[25px] py-3.5",
        isLast ? "" : "border-b border-[rgba(6,28,47,0.06)]",
      ].join(" ")}
    >
      <span className="inline-flex h-[25px] shrink-0 items-center rounded-full bg-[#EEF1F5] px-[11px] text-[13px] font-bold text-[#8B95A7]">
        aligned
      </span>
      <p className="min-w-0 flex-1 text-[15px] leading-[19px] text-[#061C2F]">{displayText}</p>
    </div>
  );
}

export function VisualFixes({ visualFixes, visualPasses }: Props) {
  const fixes = visualFixes ?? [];
  const passes = visualPasses ?? [];
  const [passVisible, setPassVisible] = useState(false);

  if (fixes.length === 0 && passes.length === 0) return null;

  return (
    <section
      id="visual-fixes"
      className={`${REPORT_SECTION_SPACING_CLASS} ${REPORT_SECTION_SCROLL_MARGIN_CLASS}`}
    >
      {fixes.length > 0 ? (
        <>
          <ReportNewSectionHeader
            icon={<RiPaletteLine size={22} />}
            title="Visual fixes"
            suffix={String(fixes.length)}
          />

          <div className={`${REPORT_NEW_SECTION_BODY_GAP_CLASS} space-y-4`}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {fixes.map((fix, index) => (
                <VisualFixCard key={`${fix.dimension}-${index}`} fix={fix} />
              ))}
            </div>

            {passes.length > 0 ? (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setPassVisible((value) => !value)}
                  className="flex items-center gap-2 px-1 text-[14.5px] text-[#8B95A7] transition-colors hover:text-[#061C2F]"
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
                  className={[
                    "overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-out",
                    passVisible ? "mt-3 opacity-100" : "max-h-0 opacity-0",
                  ].join(" ")}
                  style={
                    passVisible
                      ? { maxHeight: `${passes.length * 56 + 16}px` }
                      : undefined
                  }
                >
                  <div className={ALIGNED_PANEL_CLASS}>
                    {passes.map((pass, index) => (
                      <VisualPassRow
                        key={pass.dimension}
                        pass={pass}
                        isLast={index === passes.length - 1}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </section>
  );
}
