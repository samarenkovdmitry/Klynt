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

  if (!value) {
    return false;
  }

  if (
    value.includes("subheadline") ||
    value.includes("subhead") ||
    value.includes("subtext") ||
    value.includes("supporting")
  ) {
    return false;
  }

  return (
    value.includes("hero headline") ||
    value === "headline" ||
    value.includes("hero h1") ||
    (value.includes("headline") && !value.includes("sub"))
  );
}

export const HEADLINE_STRATEGY_LABELS: Record<BrandStage, [string, string, string]> = {
  just_launched: ["Category + audience", "Problem + solution", "Outcome + audience"],
  growing: ["Category + niche", "Differentiated outcome", "Problem-led"],
  established: ["Bold / brand-led", "Outcome-led", "Positioning-led"],
};

export const CTA_STRATEGY_LABELS = [
  "Trial explicit",
  "Risk-free",
  "Direct action",
] as const;

export const CTA_PATH_STRATEGY_LABELS = [
  "Path clarity",
  "Audience split",
  "Primary action",
] as const;

export const NON_TRIAL_CTA_VARIANTS: readonly { label: (typeof CTA_PATH_STRATEGY_LABELS)[number]; text: string }[] = [
  { label: "Path clarity", text: "Explore launches" },
  { label: "Audience split", text: "Browse startups" },
  { label: "Primary action", text: "See how it works" },
] as const;

const TRIAL_CTA_SIGNAL =
  /\b(free trial|try free|start free|sign up|signup|get started free|start free trial|try it free|no credit card|14-day|14 day)\b/i;

const GENERIC_TRIAL_CTA_VARIANT =
  /\b(free trial|try it free|get started free|start free trial|unlock|claim instantly)\b/i;

export const SUBHEADLINE_STRATEGY_LABELS = [
  "Value proposition",
  "Specificity",
  "Outcome",
] as const;

export const COPY_VARIANT_WORD_LIMITS = {
  headline: 14,
  cta: 5,
  subheadline: 14,
} as const;

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

function normalizeStrategyLabel(
  label: string,
  index: number,
  defaults: readonly string[]
): string {
  const trimmed = label.trim();
  const strippedPrefix = trimmed.replace(/^option\s*[a-c]\s*[—–-]\s*/i, "").trim();
  const candidate = strippedPrefix || trimmed;

  if (!candidate || isGenericHeadlineOptionLabel(candidate)) {
    return defaults[index] ?? `Direction ${index + 1}`;
  }

  const match = defaults.find(
    (defaultLabel) => defaultLabel.toLowerCase() === candidate.toLowerCase()
  );

  return match ?? defaults[index] ?? candidate;
}

export function normalizeCtaOptionLabel(
  label: string,
  index: number,
  useTrialStrategies = true
): string {
  const defaults = useTrialStrategies ? CTA_STRATEGY_LABELS : CTA_PATH_STRATEGY_LABELS;
  return normalizeStrategyLabel(label, index, defaults);
}

export function isTrialStyleCta(current?: string, pageContext?: string): boolean {
  const combined = `${current ?? ""} ${pageContext ?? ""}`.trim();

  if (!combined) {
    return false;
  }

  return TRIAL_CTA_SIGNAL.test(combined);
}

export function isGenericTrialCtaVariant(text?: string): boolean {
  const trimmed = text?.trim() ?? "";
  return trimmed.length > 0 && GENERIC_TRIAL_CTA_VARIANT.test(trimmed);
}

export function normalizeSubheadlineOptionLabel(label: string, index: number): string {
  return normalizeStrategyLabel(label, index, SUBHEADLINE_STRATEGY_LABELS);
}

export function buildCopyStudioPromptBlock() {
  const trialCtaLabels = CTA_STRATEGY_LABELS.join('", "');
  const pathCtaLabels = CTA_PATH_STRATEGY_LABELS.join('", "');
  const subheadLabels = SUBHEADLINE_STRATEGY_LABELS.join('", "');

  return `COPY STUDIO (copy_variants) — paste-ready hero copy, not marketing essays.

Shared rules:
- current: exact visible text only ("" if not readable).
- subheadline.current: include the visible hero subhead AND any adjacent usage stat or social-proof line above the fold (space-separated if separate lines).
- 3 variants per element. Each variant uses a different strategic angle — never paraphrase the same idea.
- Ban generic SaaS filler: "intuitive", "seamless", "boost productivity", "unlock", "claim instantly", "everything you need", "designed to", "proven strategies".
- If trial/pricing clarity is the gap, put duration or terms in subheadline — NOT in the CTA button.

Headline variants:
- variants[].label: MUST use exact strategy names from the BRAND STAGE block.
- variants[].text: max ${COPY_VARIANT_WORD_LIMITS.headline} words. Sharp H1 — declarative, specific, memorable.

CTA variants (primary button label ONLY — use the PRIMARY hero button text as current):
- If current CTA OR visible hero copy mentions free trial, sign up, or get started free → use labels: "${trialCtaLabels}".
  Trial explicit / Risk-free / Direct action — max ${COPY_VARIANT_WORD_LIMITS.cta} words each.
- Otherwise (Discover, Explore, Launch, Create, Browse, Join, etc.) → use labels: "${pathCtaLabels}".
  Path clarity: sharpen what the button does (e.g. "Explore startups").
  Audience split: name the user path (e.g. "Launch on Pond", "Create bounties").
  Primary action: strongest single verb + object from the page (e.g. "Discover startups").
  NEVER suggest "Start free trial" or "Try it free" when the page has no trial/signup language.
- max ${COPY_VARIANT_WORD_LIMITS.cta} words. Button register: no "your", no "now", no "instantly".

Subheadline variants:
- variants[].label: MUST be exactly one of: "${subheadLabels}" (one per variant).
- variants[].text: max ${COPY_VARIANT_WORD_LIMITS.subheadline} words. One supporting sentence under the headline.`;
}

export function buildBrandStagePromptBlock(stage: BrandStage) {
  const sharedRules = `
headline_directions: REQUIRED object for the visible hero headline (H1 or largest promise line above the fold).
- before: exact visible hero headline text ("" if missing).
- gap: one sentence (max 24 words) on what is weak about the current headline for visitors — not brand-stage context.
- context: 1-2 sentences (max 32 words) explaining why these strategies fit this brand stage.
- options: exactly 3 items. Each MUST use a different sentence structure and strategic angle — never paraphrase the same idea.
- options[].label: MUST be the exact strategy name from the list below — never "Option A", "Option B", or "Option C".
- options[].text: proposed headline (max ${COPY_VARIANT_WORD_LIMITS.headline} words).
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
