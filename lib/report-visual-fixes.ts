import type {
  ReportChecklistItem,
  ReportVisualFix,
  ReportVisualPass,
  VisualFixDimension,
} from "@/lib/audit-report";
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

export type NormalizedVisualSection = {
  fixes: ReportVisualFix[];
  passes: ReportVisualPass[];
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

function parseVisualPassItem(raw: unknown): ReportVisualPass | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const item = raw as Record<string, unknown>;
  const dimension = String(item.dimension ?? "").trim() as VisualFixDimension;

  if (!VISUAL_FIX_DIMENSIONS.includes(dimension)) {
    return null;
  }

  const note = sanitizeLlmVisibleText(String(item.note ?? "")).trim();

  if (!note) {
    return null;
  }

  return {
    dimension,
    note: clampWords(note, 12, true),
  };
}

function fallbackFixesFromChecklist(checklist?: ReportChecklistItem[]): ReportVisualFix[] {
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

const DEFAULT_SUB7_VISUAL_FIX: ReportVisualFix = {
  dimension: "typography",
  observation: "Hero typography may slow scan for cold visitors",
  recommendation: "Increase subheadline weight and size for faster value-prop scan",
};

export function normalizeReportVisualFixes(
  raw: unknown,
  checklist?: ReportChecklistItem[]
): ReportVisualFix[] {
  return normalizeVisualSection(raw, undefined, checklist).fixes;
}

export function normalizeReportVisualPasses(
  raw: unknown,
  fixes: ReportVisualFix[]
): ReportVisualPass[] {
  return normalizeVisualSection(undefined, raw, undefined, fixes).passes;
}

export function normalizeVisualSection(
  fixesRaw?: unknown,
  passesRaw?: unknown,
  checklist?: ReportChecklistItem[],
  existingFixes?: ReportVisualFix[],
  score?: number
): NormalizedVisualSection {
  const parsedFixes = Array.isArray(fixesRaw)
    ? fixesRaw
        .map(parseVisualFixItem)
        .filter((item): item is ReportVisualFix => item !== null)
    : (existingFixes ?? []);

  const dedupedFixes: ReportVisualFix[] = [];
  const fixDimensions = new Set<VisualFixDimension>();

  for (const item of parsedFixes) {
    if (fixDimensions.has(item.dimension)) {
      continue;
    }

    fixDimensions.add(item.dimension);
    dedupedFixes.push(item);

    if (dedupedFixes.length >= 4) {
      break;
    }
  }

  let fixes = dedupedFixes;

  if (fixes.length >= 2) {
    fixes = dedupedFixes;
  } else {
    const fallback = fallbackFixesFromChecklist(checklist);

    if (fixes.length === 0) {
      fixes = fallback;
    } else if (fixes.length === 1 && fallback.length > 0 && fixes[0].dimension !== "typography") {
      fixes = [...fixes, ...fallback].slice(0, 4);
    }
  }

  fixDimensions.clear();
  for (const fix of fixes) {
    fixDimensions.add(fix.dimension);
  }

  const parsedPasses = Array.isArray(passesRaw)
    ? passesRaw
        .map(parseVisualPassItem)
        .filter((item): item is ReportVisualPass => item !== null)
    : [];

  const passes: ReportVisualPass[] = [];
  const seenPass = new Set<VisualFixDimension>();

  for (const item of parsedPasses) {
    if (fixDimensions.has(item.dimension) || seenPass.has(item.dimension)) {
      continue;
    }

    seenPass.add(item.dimension);
    passes.push(item);

    if (passes.length >= 3) {
      break;
    }
  }

  const numericScore = Number(score);
  if (
    fixes.length === 0 &&
    passes.length === 0 &&
    Number.isFinite(numericScore) &&
    numericScore < 7
  ) {
    const checklistFallback = fallbackFixesFromChecklist(checklist);
    fixes = checklistFallback.length > 0 ? checklistFallback : [DEFAULT_SUB7_VISUAL_FIX];
  }

  return { fixes, passes };
}

export function buildVisualFixesMarkdown(fixes: ReportVisualFix[]): string {
  return fixes
    .map((fix) => {
      const label = getVisualFixDimensionLabel(fix.dimension);
      return `- **${label}:** ${fix.recommendation}`;
    })
    .join("\n");
}

export function buildVisualPassesMarkdown(passes: ReportVisualPass[]): string {
  return passes
    .map((pass) => {
      const label = getVisualFixDimensionLabel(pass.dimension);
      return `- **${label}:** ${pass.note}`;
    })
    .join("\n");
}
