"use client";

import {
  RiPaletteLine,
  RiCheckboxCircleFill,
  RiGroupLine,
  RiStackLine,
  RiCursorLine,
  RiContrastLine,
  RiArrowRightLine,
  RiText,
} from "@remixicon/react";
import type { ReportVisualFix, ReportVisualPass, VisualFixDimension } from "@/lib/audit-report";

type Props = {
  fixes: ReportVisualFix[];
  passes: ReportVisualPass[];
};

const DIMENSION_LABELS: Record<VisualFixDimension, string> = {
  border_radius:    "Corner radius",
  density:          "Density",
  color_tone:       "Color tone",
  spacing:          "Spacing",
  cta_hierarchy:    "CTA hierarchy",
  typography:       "Typography",
  depth:            "Background & depth",
  navigation:       "Navigation",
  social_proof:     "Social proof",
  headline_formula: "Headline formula",
  color_contrast:   "Contrast",
};

function DimensionIcon({ dimension }: { dimension: VisualFixDimension }) {
  const cls = "shrink-0 text-v2-ink-secondary";
  switch (dimension) {
    case "social_proof":     return <RiGroupLine size={18} className={cls} />;
    case "depth":            return <RiStackLine size={18} className={cls} />;
    case "cta_hierarchy":    return <RiCursorLine size={18} className={cls} />;
    case "color_contrast":   return <RiContrastLine size={18} className={cls} />;
    case "typography":       return <RiText size={18} className={cls} />;
    default:                 return <RiPaletteLine size={18} className={cls} />;
  }
}

function FixCell({ fix, bordered }: { fix: ReportVisualFix; bordered?: boolean }) {
  const label = DIMENSION_LABELS[fix.dimension] ?? fix.dimension;
  return (
    <div className={`p-6 ${bordered ? "border-t border-v2-card-divider" : ""}`}>
      <div className="mb-2.5 flex items-center gap-2.5">
        <DimensionIcon dimension={fix.dimension} />
        <span className="text-[16px] font-semibold tracking-[-0.01em] text-v2-ink">{label}</span>
      </div>
      <p className="mb-3.5 text-[14px] leading-[1.5] text-v2-ink-muted">{fix.observation}</p>
      <div className="flex items-start gap-2.5 rounded-[12px] bg-v2-card-inner px-3.5 py-3">
        <RiArrowRightLine size={16} className="mt-px shrink-0 text-v2-accent" />
        <span className="text-[14px] font-medium leading-[1.45] text-v2-dark-alt">
          {fix.recommendation}
        </span>
      </div>
    </div>
  );
}

export function ReportVisualFixesGrid({ fixes, passes }: Props) {
  if (fixes.length === 0 && passes.length === 0) return null;

  const topFixes = fixes.slice(0, 4);

  return (
    <section className="overflow-hidden rounded-[16px] border border-v2-card-border bg-v2-card shadow-[0_1px_2px_rgba(27,26,23,0.03)]">
      <div className="flex items-center gap-2.5 border-b border-v2-card-divider px-6 py-[18px]">
        <RiPaletteLine size={20} className="text-v2-ink" />
        <span className="text-[19px] font-semibold tracking-[-0.01em] text-v2-ink">Visual fixes</span>
        {fixes.length > 0 && (
          <span className="font-mono ml-auto text-[11.5px] tracking-[0.04em] text-v2-ink-faint">
            {fixes.length} INSIGHT{fixes.length !== 1 ? "S" : ""}
          </span>
        )}
      </div>

      {topFixes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {topFixes.map((fix, i) => (
            <div
              key={fix.dimension}
              className={[
                i % 2 === 0 && i < topFixes.length - 1 ? "sm:border-r sm:border-v2-card-divider" : "",
                i >= 2 ? "border-t border-v2-card-divider" : "",
                i > 0 && i < 2 ? "border-t sm:border-t-0 border-v2-card-divider" : "",
              ].join(" ")}
            >
              <FixCell fix={fix} />
            </div>
          ))}
        </div>
      )}

      {passes.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-v2-card-divider bg-v2-card-faint px-6 py-3.5">
          <span className="font-mono text-[10.5px] tracking-[0.06em] text-v2-ink-hairline">
            ALIGNED CHECKS
          </span>
          {passes.map((p) => (
            <span key={p.dimension} className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-v2-ink-secondary">
              <RiCheckboxCircleFill size={15} className="text-v2-pass" />
              {DIMENSION_LABELS[p.dimension] ?? p.dimension}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
