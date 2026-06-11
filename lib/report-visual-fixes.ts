import type { ReportChecklistItem, ReportVisualFix, VisualFixDimension } from "@/lib/audit-report";
import { clampWords } from "@/lib/report-copy-limits";
import { sanitizeLlmVisibleText } from "@/lib/llm-placeholder-text";

export const VISUAL_FIX_DIMENSIONS: VisualFixDimension[] = [
  "border_radius",
  "density",
  "color_tone",
  "spacing",
  "cta_hierarchy",
  "typography",
  "depth",
];

const DIMENSION_LABELS: Record<VisualFixDimension, string> = {
  border_radius: "Corner radius",
  density: "Information density",
  color_tone: "Color tone",
  spacing: "Spacing & rhythm",
  cta_hierarchy: "CTA hierarchy",
  typography: "Typography",
  depth: "Background & depth",
};

export function getVisualFixDimensionLabel(dimension: VisualFixDimension): string {
  return DIMENSION_LABELS[dimension];
}

function parseVisualFixItem(raw: unknown): ReportVisualFix | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const item = raw as Record<string, unknown>;
  const dimension = String(item.dimension ?? "").trim() as VisualFixDimension;

  if (!VISUAL_FIX_DIMENSIONS.includes(dimension)) {
    return null;
  }

  const observation = sanitizeLlmVisibleText(String(item.observation ?? "")).trim();
  const recommendation = sanitizeLlmVisibleText(String(item.recommendation ?? "")).trim();

  if (!observation || !recommendation) {
    return null;
  }

  return {
    dimension,
    observation: clampWords(observation, 14, true),
    recommendation: clampWords(recommendation, 18, true),
  };
}

function fallbackFromChecklist(checklist?: ReportChecklistItem[]): ReportVisualFix[] {
  const visualGap = checklist?.find(
    (item) => item.link_to === "visual-fixes" && item.status === "weak"
  );

  if (!visualGap) {
    return [];
  }

  return [
    {
      dimension: "typography",
      observation: clampWords(visualGap.text, 14, true),
      recommendation:
        "Increase subheadline to 18px / weight 500 — currently reads as a caption, not a value proposition",
    },
  ];
}

export function normalizeReportVisualFixes(
  raw: unknown,
  checklist?: ReportChecklistItem[]
): ReportVisualFix[] {
  const parsed = Array.isArray(raw)
    ? raw
        .map(parseVisualFixItem)
        .filter((item): item is ReportVisualFix => item !== null)
    : [];

  const deduped: ReportVisualFix[] = [];
  const seen = new Set<VisualFixDimension>();

  for (const item of parsed) {
    if (seen.has(item.dimension)) {
      continue;
    }

    seen.add(item.dimension);
    deduped.push(item);

    if (deduped.length >= 4) {
      break;
    }
  }

  if (deduped.length >= 2) {
    return deduped;
  }

  const fallback = fallbackFromChecklist(checklist);

  if (deduped.length === 0) {
    return fallback;
  }

  if (deduped.length === 1 && fallback.length > 0 && deduped[0].dimension !== "typography") {
    return [...deduped, ...fallback].slice(0, 4);
  }

  return deduped;
}

export function buildVisualFixesMarkdown(fixes: ReportVisualFix[]): string {
  return fixes
    .map((fix) => {
      const label = getVisualFixDimensionLabel(fix.dimension);
      return `- **${label}:** ${fix.recommendation}`;
    })
    .join("\n");
}
