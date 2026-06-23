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
    case "social_proof":     return <RiGroupLine size={20} className={cls} />;
    case "depth":            return <RiStackLine size={20} className={cls} />;
    case "cta_hierarchy":    return <RiCursorLine size={20} className={cls} />;
    case "color_contrast":   return <RiContrastLine size={20} className={cls} />;
    case "typography":       return <RiText size={20} className={cls} />;
    default:                 return <RiPaletteLine size={20} className={cls} />;
  }
}

function parseHex(text: string): { displayText: string; hexColor: string | null } {
  const match = text.match(/#[0-9A-Fa-f]{6}\b/);
  if (!match) return { displayText: text, hexColor: null };
  return {
    displayText: text.replace(match[0], "").replace(/\s{2,}/g, " ").trim(),
    hexColor: match[0],
  };
}

function FixCell({ fix }: { fix: ReportVisualFix }) {
  const label = DIMENSION_LABELS[fix.dimension] ?? fix.dimension;
  const { displayText, hexColor } = parseHex(fix.recommendation);

  return (
    <div className="p-6">
      <div className="mb-3 flex items-center gap-2.5">
        <DimensionIcon dimension={fix.dimension} />
        <span className="text-[16px] font-semibold tracking-[-0.01em] text-v2-ink">{label}</span>
      </div>
      <p className="mb-4 text-[15px] leading-[1.5] text-v2-ink-muted">{fix.observation}</p>
      <div className="flex items-center gap-3 rounded-[14px] bg-v2-card-inner px-4 py-3.5">
        <RiArrowRightLine size={16} className="shrink-0 text-v2-accent" />
        <span className="flex-1 text-[15px] font-medium leading-[1.45] text-v2-dark-alt">
          {displayText}
        </span>
        {hexColor && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-[8px] border border-[#E3E0D6] bg-white px-2.5 py-1">
            <span
              className="h-3.5 w-3.5 rounded-[3px] border border-[rgba(0,0,0,0.08)]"
              style={{ backgroundColor: hexColor }}
            />
            <span className="font-mono text-[11.5px] tracking-[0.02em] text-v2-ink-secondary">
              {hexColor}
            </span>
          </span>
        )}
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
                // right border on left-column cells — always, as long as layout is ≥2 cols
                i % 2 === 0 && topFixes.length > 1 ? "sm:border-r sm:border-v2-card-divider" : "",
                // top border for second-row cells
                i >= 2 ? "border-t border-v2-card-divider" : "",
                // mobile stacking border for second item
                i === 1 ? "border-t border-v2-card-divider sm:border-t-0" : "",
                // bottom border on top-right cell when the row below it is incomplete (odd count)
                i === 1 && topFixes.length % 2 === 1 ? "sm:border-b sm:border-v2-card-divider" : "",
              ].filter(Boolean).join(" ")}
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
