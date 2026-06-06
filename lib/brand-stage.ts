import type { BrandStage, HeadlineDirections } from "@/lib/audit-report";

export const BRAND_STAGE_STORAGE_KEY = "klynt-brand-stage";

export type { BrandStage };

export const DEFAULT_BRAND_STAGE: BrandStage = "just_launched";

export const BRAND_STAGE_OPTIONS: {
  id: BrandStage;
  label: string;
  shortLabel: string;
}[] = [
  {
    id: "just_launched",
    label: "Just launched",
    shortLabel: "New — most visitors don't know us yet",
  },
  {
    id: "growing",
    label: "Growing",
    shortLabel: "Some awareness in our niche",
  },
  {
    id: "established",
    label: "Established",
    shortLabel: "Most visitors already know the brand",
  },
];

export function isBrandStage(value: unknown): value is BrandStage {
  return (
    value === "just_launched" ||
    value === "growing" ||
    value === "established"
  );
}

export function parseBrandStage(value: unknown): BrandStage {
  const raw = String(value ?? "").trim();
  return isBrandStage(raw) ? raw : DEFAULT_BRAND_STAGE;
}

export function getBrandStageLabel(stage: BrandStage) {
  return BRAND_STAGE_OPTIONS.find((option) => option.id === stage)?.label ?? stage;
}

export function readStoredBrandStage(): BrandStage {
  if (typeof window === "undefined") {
    return DEFAULT_BRAND_STAGE;
  }

  try {
    const stored = localStorage.getItem(BRAND_STAGE_STORAGE_KEY);
    return parseBrandStage(stored);
  } catch {
    return DEFAULT_BRAND_STAGE;
  }
}

export function writeStoredBrandStage(stage: BrandStage) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(BRAND_STAGE_STORAGE_KEY, stage);
  } catch {
    // ignore quota errors
  }
}

export function isHeroHeadlineCopySection(section?: string) {
  const value = String(section ?? "").trim().toLowerCase();
  return value.includes("headline") || value.includes("hero h1");
}

export function buildBrandStagePromptBlock(stage: BrandStage) {
  const sharedRules = `
headline_directions: REQUIRED object for the visible hero headline (H1 or largest promise line above the fold).
- before: exact visible hero headline text ("" if missing).
- context: 1-2 sentences (max 32 words) explaining why these strategies fit this brand stage.
- options: exactly 3 items. Each MUST use a different sentence structure and strategic angle — never paraphrase the same idea.
- options[].label: short strategy name (e.g. "Category + audience").
- options[].text: proposed headline (max 18 words).
- Never invent stats, customer counts, or awards. Use only visible proof from the screenshot or write without numbers.
- Subheadline and CTA copy still go in copy[] as single "after" rewrites (unchanged format).`;

  if (stage === "established") {
    return `BRAND STAGE: Established — most visitors already know the brand. Headlines can be bolder; do not over-explain category.
${sharedRules}
Established headline strategies (one per option):
- Option A — Emotional / brand-led: bold emotional promise; skip "what we are" explanations.
- Option B — Outcome-led: concrete user or business outcome.
- Option C — Authority-led: credibility or social proof angle (no invented numbers).`;
  }

  if (stage === "growing") {
    return `BRAND STAGE: Growing — some niche awareness, not mainstream. Balance clarity with differentiation.
${sharedRules}
Growing headline strategies (one per option):
- Option A — Category + niche audience: what it is and who it's for in one line.
- Option B — Differentiated outcome: key result that sets you apart from alternatives.
- Option C — Problem-led: name a specific pain skeptics feel, then hint at the fix.`;
  }

  return `BRAND STAGE: Just launched — most visitors don't know the product yet. Prioritize clarity over emotion.
${sharedRules}
Just-launched headline strategies (one per option):
- Option A — Category + audience: state what it is and who it's for.
- Option B — Problem + solution: name the pain, then the fix in one or two beats.
- Option C — Outcome + audience: result for a specific user group.`;
}

export function buildHeadlineDirectionsSchemaSnippet() {
  return `"headline_directions": {
    "before": "exact visible hero headline",
    "context": "string",
    "options": [
      { "label": "strategy name", "text": "proposed headline" },
      { "label": "strategy name", "text": "proposed headline" },
      { "label": "strategy name", "text": "proposed headline" }
    ]
  },`;
}

export function normalizeHeadlineDirections(
  value: unknown
): HeadlineDirections | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const raw = value as Record<string, unknown>;
  const options = Array.isArray(raw.options) ? raw.options : [];
  const normalizedOptions = options
    .map((option) => {
      if (!option || typeof option !== "object") {
        return null;
      }

      const item = option as Record<string, unknown>;
      const text = String(item.text ?? "").trim();
      const label = String(item.label ?? "").trim();

      if (!text) {
        return null;
      }

      return {
        label: label || "Option",
        text,
      };
    })
    .filter((option): option is HeadlineDirections["options"][number] => Boolean(option))
    .slice(0, 3);

  if (normalizedOptions.length === 0) {
    return undefined;
  }

  return {
    before: String(raw.before ?? "").trim(),
    context: String(raw.context ?? "").trim(),
    options: normalizedOptions,
  };
}
