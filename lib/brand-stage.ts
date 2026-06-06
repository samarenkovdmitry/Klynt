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

export const HEADLINE_STRATEGY_LABELS: Record<BrandStage, [string, string, string]> = {
  just_launched: ["Category + audience", "Problem + solution", "Outcome + audience"],
  growing: ["Category + niche", "Differentiated outcome", "Problem-led"],
  established: ["Bold / brand-led", "Outcome-led", "Positioning-led"],
};

function isGenericHeadlineOptionLabel(label: string) {
  const trimmed = label.trim();

  if (!trimmed || trimmed === "Option") {
    return true;
  }

  return /^option\s*[a-c]$/i.test(trimmed);
}

export function normalizeHeadlineOptionLabel(
  label: string,
  index: number,
  stage: BrandStage
): string {
  const defaults = HEADLINE_STRATEGY_LABELS[stage];
  const trimmed = label.trim();
  const strippedPrefix = trimmed.replace(/^option\s*[a-c]\s*[—–-]\s*/i, "").trim();
  const candidate = strippedPrefix || trimmed;

  if (!candidate || isGenericHeadlineOptionLabel(candidate)) {
    return defaults[index] ?? `Direction ${index + 1}`;
  }

  return candidate;
}

export function buildBrandStagePromptBlock(stage: BrandStage) {
  const sharedRules = `
headline_directions: REQUIRED object for the visible hero headline (H1 or largest promise line above the fold).
- before: exact visible hero headline text ("" if missing).
- gap: one sentence (max 24 words) on what is weak about the current headline for visitors — not brand-stage context.
- context: 1-2 sentences (max 32 words) explaining why these strategies fit this brand stage.
- options: exactly 3 items. Each MUST use a different sentence structure and strategic angle — never paraphrase the same idea.
- options[].label: MUST be the exact strategy name from the list below — never "Option A", "Option B", or "Option C".
- options[].text: proposed headline (max 16 words).
- Tone for every options[].text: punchy, confident, specific, memorable. NOT fluffy, sentimental, soft, or corporate.
- Prefer short declarative sentences. Ban filler phrases like "actually", "everything you need", "designed to", "platform your team".
- Be bold and sharp while staying credible. Clarity and confidence over warmth.
- Never invent stats, customer counts, or awards. Use only visible proof from the screenshot or write without numbers.
- Every options[].text must work as a standalone H1 — never a trust badge, subhead, or social-proof line.
- NEVER write "Trusted by", "Used by", "Loved by", or "Leading teams" unless specific logos/names are visible in the screenshot.
- Subheadline and CTA copy still go in copy[] as single "after" rewrites (unchanged format).`;

  if (stage === "established") {
    return `BRAND STAGE: Established — most visitors already know the brand. Headlines can be bold; do not over-explain category.
${sharedRules}
Established headline strategies (one per option):
- Option A — Bold / brand-led: confident brand claim or point of view; skip "what we are" explanations. Not sentimental.
- Option B — Outcome-led: concrete user or business outcome in sharp language.
- Option C — Positioning-led: sharp competitive angle, contrarian claim, or "why us" — NOT social proof or "trusted by" language.`;
  }

  if (stage === "growing") {
    return `BRAND STAGE: Growing — some niche awareness, not mainstream. Balance clarity with differentiation.
${sharedRules}
Growing headline strategies (one per option):
- Option A — Category + niche: what it is and who it's for in one crisp line.
- Option B — Differentiated outcome: bold result that sets you apart from alternatives.
- Option C — Problem-led: name a specific pain skeptics feel, then hint at the fix.`;
  }

  return `BRAND STAGE: Just launched — most visitors don't know the product yet. Lead with clarity, but keep lines bold and specific.
${sharedRules}
Just-launched headline strategies (one per option):
- Option A — Category + audience: state what it is and who it's for — direct, not generic.
- Option B — Problem + solution: name the pain, then the fix in one or two beats.
- Option C — Outcome + audience: sharp result for a specific user group.`;
}

export function buildHeadlineDirectionsSchemaSnippet() {
  return `"headline_directions": {
    "before": "exact visible hero headline",
    "gap": "string",
    "context": "string",
    "options": [
      { "label": "strategy name", "text": "proposed headline" },
      { "label": "strategy name", "text": "proposed headline" },
      { "label": "strategy name", "text": "proposed headline" }
    ]
  },`;
}

export function normalizeHeadlineDirections(
  value: unknown,
  stage: BrandStage = DEFAULT_BRAND_STAGE
): HeadlineDirections | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const raw = value as Record<string, unknown>;
  const options = Array.isArray(raw.options) ? raw.options : [];
  const normalizedOptions = options
    .map((option, index) => {
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
        label: normalizeHeadlineOptionLabel(label, index, stage),
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
    gap: String(raw.gap ?? "").trim(),
    context: String(raw.context ?? "").trim(),
    options: normalizedOptions,
  };
}

export function resolveHeadlineBeforeGap(
  directions: HeadlineDirections | undefined,
  copy: { section?: string; why?: string }[]
) {
  const gap = directions?.gap?.trim();
  if (gap) {
    return gap;
  }

  const headlineCopy = copy.find((item) => isHeroHeadlineCopySection(item.section));
  return headlineCopy?.why?.trim();
}
