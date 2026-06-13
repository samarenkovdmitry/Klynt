import type {
  ReportBreakdown,
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

export const SERVER_FALLBACK_VISUAL_GAP_TEXT =
  "Subheadline typography too light to scan quickly";

const BANNED_GENERIC_VISUAL_PATTERNS = [
  /^subheadline weight feels too light/i,
  /^increase subheadline weight for better readability/i,
  /^subheadline color blends into the background/i,
  /^increase contrast on subheadline/i,
  /^increase contrast on weight for better legibility/i,
  /^hero section has cramped elements/i,
  /^elements feel cramped in the hero section/i,
  /^add more vertical spacing between headline and subheadline/i,
  /^increase vertical spacing between headline and subheadline/i,
  /hero blocks feel stacked without enough vertical breathing room/i,
  /subheadline weight slows scan of the value proposition/i,
  /hero typography may slow scan/i,
  /subheadline typography too light to scan quickly/i,
  /increase subheadline to 18px \/ weight 500/i,
  /for faster value-prop scan/i,
  /reduce cramped feel/i,
  /reads as a caption, not a value proposition/i,
  /tighten corner radius to 6–8px for a more credible product tone/i,
  /shift accent palette toward restrained trust tones/i,
  /add 80–120px vertical rhythm between hero sections/i,
  /make primary cta 2–3× more prominent — demote secondary actions visually/i,
  /add a subtle background tint or gradient to separate hero from page body/i,
  /strip hero to headline, subhead, and one cta for cold traffic/i,
  /corner radius reads louder than this product category expects/i,
  /accent palette may undersell trust for cold-traffic visitors/i,
  /primary and secondary actions compete above the fold/i,
  /flat hero background blurs separation from the rest of the page/i,
];

const DIMENSION_ALIASES: Record<string, VisualFixDimension> = {
  border_radius: "border_radius",
  borderradius: "border_radius",
  corner_radius: "border_radius",
  radius: "border_radius",
  density: "density",
  information_density: "density",
  color_tone: "color_tone",
  colortone: "color_tone",
  color: "color_tone",
  spacing: "spacing",
  spacing_rhythm: "spacing",
  cta_hierarchy: "cta_hierarchy",
  ctahierarchy: "cta_hierarchy",
  cta: "cta_hierarchy",
  typography: "typography",
  type: "typography",
  depth: "depth",
  background_depth: "depth",
};

export function normalizeVisualDimension(raw: string | undefined | null): VisualFixDimension | null {
  if (!raw) {
    return null;
  }

  const normalized = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");

  if (VISUAL_FIX_DIMENSIONS.includes(normalized as VisualFixDimension)) {
    return normalized as VisualFixDimension;
  }

  return DIMENSION_ALIASES[normalized] ?? null;
}

function resolveVisualDimensionFromGapLabel(gapLabel: string): VisualFixDimension | null {
  switch (gapLabel.trim()) {
    case "Weak typography":
      return "typography";
    case "Spacing issue":
      return "spacing";
    case "Color tone mismatch":
      return "color_tone";
    case "CTA hierarchy":
      return "cta_hierarchy";
    default:
      return null;
  }
}

function resolveVisualDimensionFromChecklistItem(
  item: ReportChecklistItem
): VisualFixDimension | null {
  const gapLabel = item.gap_label?.trim();

  if (gapLabel) {
    const fromLabel = resolveVisualDimensionFromGapLabel(gapLabel);

    if (fromLabel) {
      return fromLabel;
    }
  }

  if (item.link_to === "visual-fixes") {
    return "typography";
  }

  return resolveVisualDimensionFromPass(item);
}

function parseVisualFixItem(raw: unknown): ReportVisualFix | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const item = raw as Record<string, unknown>;
  const dimension = normalizeVisualDimension(String(item.dimension ?? ""));

  if (!dimension) {
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
  const dimension = normalizeVisualDimension(String(item.dimension ?? ""));

  if (!dimension) {
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

export function isBannedGenericVisualText(text: string): boolean {
  const normalized = text.trim();

  if (!normalized) {
    return true;
  }

  return BANNED_GENERIC_VISUAL_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function hasVisibleVisualEvidence(text: string): boolean {
  return /\b(dark|light|black|white|gray|grey|muted|hero|headline|subhead|subheadline|cta|button|pill|card|mockup|nav|logo|fold|accent|primary|secondary|radius|rounded|padding|gap|shadow|gradient|tint|#[0-9a-f]{3,6}|\d+\s*px|\d+\s*rem|download|trial|free|sign up|get started|start for free)\b/i.test(
    text
  );
}

export function isActionableVisualFix(fix: ReportVisualFix): boolean {
  if (
    isBannedGenericVisualText(fix.observation) ||
    isBannedGenericVisualText(fix.recommendation)
  ) {
    return false;
  }

  if (
    fix.dimension === "spacing" &&
    isHeroDensityProblemText(`${fix.observation} ${fix.recommendation}`)
  ) {
    return false;
  }

  if (!hasVisibleVisualEvidence(fix.observation)) {
    return false;
  }

  if (fix.observation.trim().toLowerCase() === fix.recommendation.trim().toLowerCase()) {
    return false;
  }

  return true;
}

export function isActionableVisualPass(pass: ReportVisualPass): boolean {
  if (isBannedGenericVisualText(pass.note)) {
    return false;
  }

  return hasVisibleVisualEvidence(pass.note);
}

export function isProblemPassText(text: string): boolean {
  return /\b(lacks?|lack|missing|unclear|too light|too thin|too playful|too cramped|cramped|reduce[sd]?|reducing|without|not visible|feels too|inadequate|similar in size|undermines|mismatch|weight is too|font weight is too|lengthy|too long|overwhelm|wall of text|multi-paragraph|essay|buries|cold visitors|may overwhelm)\b/i.test(
    text
  );
}

export function isHeroDensityProblemText(text: string): boolean {
  return /\b(lengthy|too long|overwhelm|wall of text|multi-paragraph|essay|paragraph subhead|long subhead|subhead.*(long|lengthy)|cold visitors|bur(y|ies) the cta)\b/i.test(
    text
  );
}

function overlapsChecklistGapText(
  fix: ReportVisualFix,
  checklist?: ReportChecklistItem[]
): boolean {
  if (!checklist?.length) {
    return false;
  }

  const observation = fix.observation.toLowerCase();

  for (const item of checklist) {
    if (item.status === "pass") {
      continue;
    }

    const text = item.text.toLowerCase();

    if (isHeroDensityProblemText(text) && isHeroDensityProblemText(observation)) {
      return true;
    }

    if (text.length >= 16 && observation.includes(text.slice(0, Math.min(24, text.length)))) {
      return true;
    }
  }

  return false;
}

export function isServerFallbackVisualGap(item: ReportChecklistItem): boolean {
  return (
    item.link_to === "visual-fixes" &&
    item.status === "weak" &&
    item.text.trim() === SERVER_FALLBACK_VISUAL_GAP_TEXT
  );
}

export function filterActionableVisualFixes(
  fixes: ReportVisualFix[],
  checklist?: ReportChecklistItem[]
): ReportVisualFix[] {
  const seen = new Set<VisualFixDimension>();
  const filtered: ReportVisualFix[] = [];

  for (const fix of fixes) {
    if (
      seen.has(fix.dimension) ||
      !isActionableVisualFix(fix) ||
      overlapsChecklistGapText(fix, checklist)
    ) {
      continue;
    }

    seen.add(fix.dimension);
    filtered.push(fix);

    if (filtered.length >= 4) {
      break;
    }
  }

  return filtered;
}

export function filterActionableVisualPasses(
  passes: ReportVisualPass[],
  blockedDimensions: Set<VisualFixDimension>
): ReportVisualPass[] {
  const seen = new Set<VisualFixDimension>();
  const filtered: ReportVisualPass[] = [];

  for (const pass of passes) {
    if (
      blockedDimensions.has(pass.dimension) ||
      seen.has(pass.dimension) ||
      !isActionableVisualPass(pass)
    ) {
      continue;
    }

    seen.add(pass.dimension);
    filtered.push(pass);

    if (filtered.length >= 4) {
      break;
    }
  }

  return filtered;
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

  const gapLabel = item.gap_label?.trim();

  if (gapLabel && VISUAL_PROBLEM_GAP_LABELS.has(gapLabel)) {
    return true;
  }

  if (!isProblemPassText(item.text)) {
    return false;
  }

  if (item.category === "visual" || item.id === "visual-fixes") {
    return true;
  }

  return (
    resolveVisualDimensionFromChecklistItem(item) !== null &&
    item.category !== "copy" &&
    item.category !== "trust"
  );
}

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
  _score?: number,
  _rawChecklist?: ReportChecklistItem[],
  _breakdown?: ReportBreakdown
): NormalizedVisualSection {
  const checklistSource = _rawChecklist ?? checklist;

  const parsedFixes = Array.isArray(fixesRaw)
    ? fixesRaw
        .map(parseVisualFixItem)
        .filter((item): item is ReportVisualFix => item !== null)
    : (existingFixes ?? []);

  const fixes = filterActionableVisualFixes(parsedFixes, checklistSource);
  const fixDimensions = new Set(fixes.map((fix) => fix.dimension));

  const parsedPasses = Array.isArray(passesRaw)
    ? passesRaw
        .map(parseVisualPassItem)
        .filter((item): item is ReportVisualPass => item !== null)
    : [];

  const passes = filterActionableVisualPasses(parsedPasses, fixDimensions);

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
