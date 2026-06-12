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

const VISUAL_PROBLEM_GAP_LABELS = new Set([
  "Weak typography",
  "Spacing issue",
  "Color tone mismatch",
  "CTA hierarchy",
]);

const DEFAULT_DIMENSION_RECOMMENDATIONS: Record<VisualFixDimension, string> = {
  border_radius: "Tighten corner radius to 6–8px for a more credible product tone",
  density: "Strip hero to headline, subhead, and one CTA for cold traffic",
  color_tone: "Shift accent palette toward restrained trust tones for cold-traffic credibility",
  spacing: "Add 80–120px vertical rhythm between hero sections to reduce cramped feel",
  cta_hierarchy: "Make primary CTA 2–3× more prominent — demote secondary actions visually",
  typography: "Increase subheadline to 18px / weight 500 for faster value-prop scan",
  depth: "Add a subtle background tint or gradient to separate hero from page body",
};

export function isProblemPassText(text: string): boolean {
  return /\b(lacks?|lack|missing|unclear|too light|too thin|too playful|too cramped|cramped|reduce[sd]?|reducing|without|not visible|feels too|inadequate|similar in size|undermines|mismatch|weight is too|font weight is too)\b/i.test(
    text
  );
}

function resolveVisualDimensionFromPass(item: ReportChecklistItem): VisualFixDimension | null {
  const label = (item.gap_label ?? "").toLowerCase();
  const text = item.text.toLowerCase();
  const haystack = `${label} ${text}`;

  if (/color|playful|palette|tone|mismatch/.test(haystack)) {
    return "color_tone";
  }

  if (/spacing|cramped|breathing|rhythm/.test(haystack)) {
    return "spacing";
  }

  if (/cta hierarchy|multiple cta|similar in size|competing cta/.test(haystack)) {
    return "cta_hierarchy";
  }

  if (/typography|font weight|too light|legibility|subheadline font/.test(haystack)) {
    return "typography";
  }

  if (/radius|corner|rounded/.test(haystack)) {
    return "border_radius";
  }

  if (/density|overloaded|clutter|crowded/.test(haystack)) {
    return "density";
  }

  if (/depth|flat|background|gradient/.test(haystack)) {
    return "depth";
  }

  return null;
}

export function isMisclassifiedVisualPassItem(item: ReportChecklistItem): boolean {
  if (item.status !== "pass") {
    return false;
  }

  if (!isProblemPassText(item.text)) {
    return false;
  }

  if (item.category === "visual" || item.id === "visual-fixes") {
    return true;
  }

  const gapLabel = item.gap_label?.trim();
  if (gapLabel && VISUAL_PROBLEM_GAP_LABELS.has(gapLabel)) {
    return true;
  }

  return resolveVisualDimensionFromPass(item) !== null && item.category !== "copy" && item.category !== "trust";
}

export function extractVisualFixesFromMisclassifiedPasses(
  items: ReportChecklistItem[] | undefined,
  options?: {
    skipDimensions?: Set<VisualFixDimension>;
  }
): ReportVisualFix[] {
  if (!items?.length) {
    return [];
  }

  const skipDimensions = options?.skipDimensions ?? new Set<VisualFixDimension>();
  const fixes: ReportVisualFix[] = [];
  const seen = new Set<VisualFixDimension>();

  for (const item of items) {
    if (!isMisclassifiedVisualPassItem(item)) {
      continue;
    }

    const dimension = resolveVisualDimensionFromPass(item);

    if (!dimension || seen.has(dimension) || skipDimensions.has(dimension)) {
      continue;
    }

    seen.add(dimension);
    fixes.push({
      dimension,
      observation: clampWords(item.text, 14, true),
      recommendation: DEFAULT_DIMENSION_RECOMMENDATIONS[dimension],
    });

    if (fixes.length >= 4) {
      break;
    }
  }

  return fixes;
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
  score?: number,
  rawChecklist?: ReportChecklistItem[]
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

  const hasTypographyWeakGap = checklist?.some(
    (item) => item.link_to === "visual-fixes" && item.status === "weak"
  );
  const skipExtractDimensions = new Set<VisualFixDimension>(fixDimensions);

  if (hasTypographyWeakGap || fixDimensions.has("typography")) {
    skipExtractDimensions.add("typography");
  }

  for (const item of extractVisualFixesFromMisclassifiedPasses(rawChecklist ?? checklist, {
    skipDimensions: skipExtractDimensions,
  })) {
    if (fixDimensions.has(item.dimension) || dedupedFixes.length >= 4) {
      continue;
    }

    fixDimensions.add(item.dimension);
    dedupedFixes.push(item);
  }

  let fixes = dedupedFixes;
  const checklistFallback = fallbackFixesFromChecklist(checklist);

  if (fixes.length === 0) {
    fixes = checklistFallback;
  } else if (checklistFallback.length > 0 && !fixDimensions.has("typography")) {
    fixes = [...checklistFallback, ...fixes].slice(0, 4);
    fixDimensions.add("typography");
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
