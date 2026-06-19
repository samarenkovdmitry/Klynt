import type {
  AudienceType,
  ChecklistLinkTarget,
  PageComputedValues,
  ReportBreakdown,
  ReportChecklistItem,
  ReportCopyVariants,
  ReportMeta,
  ReportVisualFix,
  ReportVisualPass,
  TrafficSource,
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
  "navigation",
  "social_proof",
  "headline_formula",
  "color_contrast",
];

const DIMENSION_LABELS: Record<VisualFixDimension, string> = {
  border_radius: "Corner radius",
  density: "Information density",
  color_tone: "Color tone",
  spacing: "Spacing & rhythm",
  cta_hierarchy: "CTA hierarchy",
  typography: "Typography",
  depth: "Background & depth",
  navigation: "Navigation complexity",
  social_proof: "Social proof",
  headline_formula: "Headline formula",
  color_contrast: "Color contrast",
};

// Maps dimensions to the checklist link targets they correspond to — used for severity scoring.
const DIMENSION_CHECKLIST_LINKS: Partial<Record<VisualFixDimension, ChecklistLinkTarget[]>> = {
  cta_hierarchy: ["copy-cta"],
  typography: ["visual-fixes"],
  navigation: ["structure-nav"],
  social_proof: ["trust"],
  depth: ["trust"],
  headline_formula: ["copy-headline"],
};

export type NormalizedVisualSection = {
  fixes: ReportVisualFix[];
  passes: ReportVisualPass[];
};

export type VisualSectionContext = {
  checklist?: ReportChecklistItem[];
  copyVariants?: ReportCopyVariants;
  meta?: ReportMeta;
  audienceType?: AudienceType;
  trafficSource?: TrafficSource;
  computedValues?: PageComputedValues | null;
};

const MIN_VISUAL_FIXES = 2;

// Explicit priority order for derive-supplement: when multiple derive candidates compete for the
// remaining fix slots, higher-priority dimensions surface first.
const DERIVE_PRIORITY_ORDER: VisualFixDimension[] = [
  "color_contrast",
  "cta_hierarchy",
  "social_proof",
  "navigation",
  "headline_formula",
  "typography",
  "depth",
  "spacing",
  "density",
  "border_radius",
  "color_tone",
];

// Used by the spacing/density concreteness guard in isActionableVisualFix.
const CONCRETE_PAGE_ELEMENT_PATTERN =
  /\b(hero|header|footer|nav|button|cta|card|section|fold|above[- ]?fold|modal|sidebar|feature|pricing|testimonial|form|grid|banner|headline|subhead|logo|badge)\b/i;

const VAGUE_CTA_PATTERN =
  /^(get\s+started|started|learn\s+more|click\s+here|sign\s+up(\s+free)?|submit|continue|explore|discover|try\s+now|try\s+free|try\s+it(\s+free)?|try\s+today|register|join(\s+now)?|join\s+free|start\s+free|start\s+now|get\s+free|get\s+access|access\s+now|begin(\s+now)?|proceed|watch\s+now|see\s+demo|book\s+demo)$/i;

function truncateLabel(label: string, max = 28): string {
  const trimmed = label.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }

  return `${trimmed.slice(0, max - 1)}…`;
}

function isAllCapsCta(label: string): boolean {
  const letters = label.replace(/[^a-zA-Z]/g, "");
  return letters.length >= 4 && letters === letters.toUpperCase();
}

// B2B + warm/mixed traffic: these generic CTAs are acceptable in a known-brand context.
const VAGUE_CTA_SOFTENED_B2B_WARM = /^(get\s+started|started|learn\s+more|start\s+free)$/i;

type CtaContext = Pick<VisualSectionContext, "audienceType" | "trafficSource">;

function isVagueCtaLabel(label: string, ctx?: CtaContext): boolean {
  const normalized = label.replace(/[^\w\s]/g, "").trim();
  if (!VAGUE_CTA_PATTERN.test(normalized)) return false;

  // Relax check for B2B + warm/mixed — established brand context makes generic CTAs acceptable.
  if (
    ctx?.audienceType === "b2b" &&
    ctx?.trafficSource !== "cold" &&
    VAGUE_CTA_SOFTENED_B2B_WARM.test(normalized)
  ) {
    return false;
  }

  return true;
}

function normalizeCtaInput(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

function deriveCtaAuditFix(ctaLabel: string, ctx?: CtaContext): ReportVisualFix | null {
  const label = normalizeCtaInput(ctaLabel);
  if (!label) {
    return null;
  }

  const allCaps = isAllCapsCta(label);
  const vague = isVagueCtaLabel(label, ctx);

  if (!allCaps && !vague) {
    return null;
  }

  const issues: string[] = [];
  if (allCaps) {
    issues.push("all caps");
  }
  if (vague) {
    issues.push("vague — no product or outcome");
  }

  return {
    dimension: "cta_hierarchy",
    observation: `"${truncateLabel(label)}" — ${issues.join(", ")}`,
    recommendation:
      allCaps && vague
        ? "Switch to sentence case and add a specific outcome — mention what happens after click"
        : allCaps
          ? "Switch primary CTA to sentence case — less shouty on hero"
          : "Add specificity and remove friction signal — mention what happens after click",
  };
}

function deriveCtaAuditPass(ctaLabel: string, ctx?: CtaContext): ReportVisualPass | null {
  const label = normalizeCtaInput(ctaLabel);
  if (!label || isAllCapsCta(label) || isVagueCtaLabel(label, ctx)) {
    return null;
  }

  // Single-word CTAs are too ambiguous to mark as aligned
  if (label.split(/\s+/).length < 2) {
    return null;
  }

  return {
    dimension: "cta_hierarchy",
    note: `"${truncateLabel(label, 22)}" — specific verb and outcome on button`,
  };
}

/** Returns true when deriveCtaAuditFix would produce a fix for this label — used to skip CTA in LLM prompt. */
export function willDeriveCtaFix(ctaLabel: string, ctx?: CtaContext): boolean {
  const label = normalizeCtaInput(ctaLabel);
  return !!(label && (isAllCapsCta(label) || isVagueCtaLabel(label, ctx)));
}

function deriveFixFromChecklistGap(
  item: ReportChecklistItem,
  copyVariants?: ReportCopyVariants
): ReportVisualFix | null {
  const gapLabel = item.gap_label?.trim() ?? "";
  const ctaLabel = copyVariants?.cta?.current?.trim() ?? "Primary hero CTA";

  if (item.link_to === "copy-cta" || gapLabel === "Trial unclear") {
    return {
      dimension: "cta_hierarchy",
      observation: `"${truncateLabel(ctaLabel)}" — no trial or risk-free hint on button`,
      recommendation: "Surface trial length in the CTA to reduce friction at click",
    };
  }

  if (item.link_to === "visual-fixes" && item.status === "weak") {
    return {
      dimension: "typography",
      observation: clampWords(item.text, 14, true),
      recommendation: "Darken subhead one step and bump weight for hero scan",
    };
  }

  if (item.category === "trust" && item.status !== "pass") {
    return {
      dimension: "depth",
      observation: "Hero section background flat — no depth cue above fold",
      recommendation: "Add background tint or card shadow to hero section for visual depth",
    };
  }

  if (/cta|hierarchy|competing/i.test(`${gapLabel} ${item.text}`)) {
    return {
      dimension: "cta_hierarchy",
      observation: clampWords(item.text, 14, true),
      recommendation: "Make one hero CTA filled — demote secondary to text link",
    };
  }

  if (item.link_to === "hero-density" || gapLabel === "Spacing issue") {
    return {
      dimension: "density",
      observation: clampWords(item.text, 14, true),
      recommendation: "Trim hero to headline, subhead, and one primary CTA",
    };
  }

  return null;
}

function deriveNavAudit(
  checklist: ReportChecklistItem[],
  computedValues?: PageComputedValues | null
): ReportVisualFix | null {
  if (computedValues != null) {
    const { nav_link_count, nav_link_labels } = computedValues;

    if (nav_link_count > 6) {
      const labelSnippet = nav_link_labels.slice(0, 5).join(", ");
      return {
        dimension: "navigation",
        observation: labelSnippet
          ? `${nav_link_count} nav links — ${labelSnippet}`
          : `${nav_link_count} nav links in header — too many for cold visitor focus`,
        recommendation: "Collapse to 4 core links + sticky CTA button for cold traffic focus",
      };
    }

    // 4–6 links: LLM evaluates with nav_link_labels from PAGE COMPUTED VALUES.
    // ≤ 4 links: acceptable nav, no derive card.
    return null;
  }

  const navGap = checklist.find(
    (item) => item.link_to === "structure-nav" && item.status !== "pass"
  );
  if (!navGap) return null;

  return {
    dimension: "navigation",
    observation: navGap.status === "missing"
      ? "No header nav links above fold — visitors lose orientation on scroll"
      : clampWords(navGap.text, 14, true),
    recommendation: "Add sticky nav with primary CTA button visible at all scroll depths",
  };
}

function deriveSocialProofAudit(
  checklist: ReportChecklistItem[],
  meta?: ReportMeta,
  computedValues?: PageComputedValues | null
): ReportVisualFix | null {
  const recommendation = meta?.proof_suggestion
    ? clampWords(meta.proof_suggestion, 18, true)
    : "Add 3–5 customer logos or a stat (e.g. '10,000+ teams') directly below the hero CTA";

  if (computedValues != null) {
    if (computedValues.social_proof_found && computedValues.social_proof_above_fold) {
      return null; // Proof confirmed above fold — no fix needed
    }
    if (computedValues.social_proof_found && !computedValues.social_proof_above_fold) {
      return {
        dimension: "social_proof",
        observation: "Social proof exists but positioned below fold — cold visitors scroll past before deciding",
        recommendation,
      };
    }
    // social_proof_found === false: selector may have missed elements — fall through to checklist
  }

  const trustGap = checklist.find(
    (item) => item.category === "trust" && item.status !== "pass"
  );
  if (!trustGap) return null;

  return {
    dimension: "social_proof",
    observation: trustGap.status === "missing"
      ? "No logos, stats, or ratings above fold — trust proof absent for cold visitors"
      : "Social proof exists but positioned below fold or too subtle near hero CTA",
    recommendation,
  };
}

type HeadlineFormula = "generic" | "benefit" | "feature" | "audience";

function classifyHeadlineFormula(headline: string): HeadlineFormula {
  const h = headline.toLowerCase();

  if (
    /\b(for|designed for|built for|made for)\b.*\b(team|startup|agency|freelancer|developer|engineer|manager|marketer|founder|cto|ceo|ops)\b/i.test(
      headline
    ) ||
    /\b(your team|your business|your company)\b/i.test(headline)
  ) {
    return "audience";
  }

  if (
    /\b(grow|save|reduce|increase|boost|improve|double|eliminate|automate|ship faster|close more|convert|stop|never again|get more|win more|cut)\b/.test(
      h
    )
  ) {
    return "benefit";
  }

  if (
    /\b(platform|tool|software|app|solution|system|dashboard|service|api|suite)\b/.test(h) &&
    !/\b(grow|save|reduce|increase|boost|double|eliminate|automate|ship|close|convert)\b/.test(h)
  ) {
    return "feature";
  }

  return "generic";
}

function deriveHeadlineAudit(
  checklist: ReportChecklistItem[],
  copyVariants?: ReportCopyVariants
): ReportVisualFix | null {
  const headlineGap = checklist.find(
    (item) => item.link_to === "copy-headline" && item.status !== "pass"
  );
  if (!headlineGap) return null;

  const headline = copyVariants?.headline?.current?.trim() ?? "";

  if (!headline) {
    return {
      dimension: "headline_formula",
      observation: "Headline missing — hero has no product category or audience signal",
      recommendation: "Add an audience qualifier or use case in the first line of the hero headline",
    };
  }

  const formula = classifyHeadlineFormula(headline);
  const truncated = truncateLabel(headline, 22);

  const configs: Record<HeadlineFormula, { obs: string; rec: string }> = {
    generic: {
      obs: `Headline "${truncated}" — no category or audience signal for cold visitors`,
      rec: "Add an audience qualifier or use case in the first line of the hero headline",
    },
    feature: {
      obs: `Headline "${truncated}" — product type named but no audience qualifier above fold`,
      rec: "Add an audience qualifier or use case in the first line of the hero headline",
    },
    benefit: {
      obs: `Headline "${truncated}" — benefit clear but audience qualifier missing above fold`,
      rec: "Add an audience qualifier or use case in the first line of the hero headline",
    },
    audience: {
      obs: `Headline "${truncated}" — audience named but use case not visible in first line`,
      rec: "Add an audience qualifier or use case in the first line of the hero headline",
    },
  };

  const { obs, rec } = configs[formula];
  return { dimension: "headline_formula", observation: obs, recommendation: rec };
}

function derivePassFromChecklistItem(item: ReportChecklistItem): ReportVisualPass | null {
  if (item.status !== "pass") {
    return null;
  }

  const dimension = resolveVisualDimensionFromPass(item);
  if (!dimension) {
    return null;
  }

  const note = clampWords(item.text, 12, true);
  if (!note || isProblemPassText(note)) {
    return null;
  }

  return { dimension, note };
}

function significantWords(text: string): string[] {
  return text.toLowerCase().match(/\b[a-z]{4,}\b/g) ?? [];
}

// Returns the fraction of checklist item words that appear in the fix text — used to detect
// fallback cards that just restate what the user already sees in the checklist.
function checklistTextOverlapScore(fixText: string, gapText: string): number {
  const gapWords = significantWords(gapText);
  if (gapWords.length === 0) return 0;
  const fixWordSet = new Set(significantWords(fixText));
  const matches = gapWords.filter((w) => fixWordSet.has(w)).length;
  return matches / gapWords.length;
}

function computeFixSeverityScore(
  fix: ReportVisualFix,
  checklist: ReportChecklistItem[]
): number {
  const linked = DIMENSION_CHECKLIST_LINKS[fix.dimension];
  if (!linked || !checklist.length) return 1;

  for (const item of checklist) {
    if (item.status === "pass" || !item.link_to) continue;
    if (!linked.includes(item.link_to)) continue;
    return item.status === "missing" ? 3 : 2;
  }
  return 1;
}

function appendDerivedFix(
  fixes: ReportVisualFix[],
  fixDims: Set<VisualFixDimension>,
  fix: ReportVisualFix | null
): void {
  if (!fix || fixDims.has(fix.dimension) || !isActionableVisualFix(fix)) {
    return;
  }

  fixes.push(fix);
  fixDims.add(fix.dimension);
}

function appendDerivedPass(
  passes: ReportVisualPass[],
  passDims: Set<VisualFixDimension>,
  fixDims: Set<VisualFixDimension>,
  pass: ReportVisualPass | null
): void {
  if (
    !pass ||
    fixDims.has(pass.dimension) ||
    passDims.has(pass.dimension) ||
    !isActionableVisualPass(pass)
  ) {
    return;
  }

  passes.push(pass);
  passDims.add(pass.dimension);
}

function deriveSpacingAudit(computedValues?: PageComputedValues | null): ReportVisualFix | null {
  if (computedValues == null) return null;

  const { hero_h1_to_sub_gap, hero_sub_to_cta_gap } = computedValues;

  const ctaTight = hero_sub_to_cta_gap !== null && hero_sub_to_cta_gap < 16;
  const h1Tight = hero_h1_to_sub_gap !== null && hero_h1_to_sub_gap < 8;

  if (ctaTight && h1Tight) {
    return {
      dimension: "spacing",
      observation: `${hero_h1_to_sub_gap}px h1-sub and ${hero_sub_to_cta_gap}px sub-CTA gap — both too tight in hero`,
      recommendation: "Increase headline-to-sub gap to 16px and sub-to-CTA gap to 24px",
    };
  }

  if (ctaTight) {
    return {
      dimension: "spacing",
      observation: `${hero_sub_to_cta_gap}px between subheadline and CTA — increase to 24px minimum`,
      recommendation: "Increase spacing between hero subheadline and primary CTA to 24px",
    };
  }

  if (h1Tight) {
    return {
      dimension: "spacing",
      observation: `${hero_h1_to_sub_gap}px headline-to-subheadline gap above fold — increase to 16px`,
      recommendation: "Increase gap between hero headline and subheadline to 16px minimum",
    };
  }

  return null;
}

export function supplementVisualSection(
  fixes: ReportVisualFix[],
  passes: ReportVisualPass[],
  context: VisualSectionContext = {}
): NormalizedVisualSection {
  const resultFixes = [...fixes];
  const resultPasses = [...passes];
  const fixDims = new Set(resultFixes.map((fix) => fix.dimension));
  const passDims = new Set(resultPasses.map((pass) => pass.dimension));
  const checklist = context.checklist ?? [];
  const ctaCtx: CtaContext = { audienceType: context.audienceType, trafficSource: context.trafficSource };
  const computedValues = context.computedValues ?? null;

  // Collect all derive candidates first, then sort by DERIVE_PRIORITY_ORDER and apply.
  // This ensures that when LLM fills some slots, the most critical derived dimensions
  // occupy the remaining slots rather than whichever derive fn happened to run first.
  const derivedCandidates: ReportVisualFix[] = [];

  // CTA hierarchy — derive from copy_variants or checklist fallback.
  if (!fixDims.has("cta_hierarchy") && !passDims.has("cta_hierarchy")) {
    // Prefer DOM-extracted CTA text (more reliable than LLM-extracted value)
    const ctaLabel = normalizeCtaInput(
      computedValues?.cta_text ?? context.copyVariants?.cta?.current ?? ""
    );

    if (!ctaLabel) {
      const trialGap = checklist.find(
        (item) => item.link_to === "copy-cta" || item.gap_label?.trim() === "Trial unclear"
      );
      if (trialGap) {
        const fix = deriveFixFromChecklistGap(trialGap, context.copyVariants);
        if (fix) derivedCandidates.push(fix);
      }
    } else {
      const ctaFix = deriveCtaAuditFix(ctaLabel, ctaCtx);
      if (ctaFix) {
        derivedCandidates.push(ctaFix);
      } else {
        appendDerivedPass(resultPasses, passDims, fixDims, deriveCtaAuditPass(ctaLabel, ctaCtx));
      }
    }
  }

  // Headline formula — derive from copy-headline gap + headline text.
  if (!fixDims.has("headline_formula") && !passDims.has("headline_formula")) {
    const fix = deriveHeadlineAudit(checklist, context.copyVariants);
    if (fix) derivedCandidates.push(fix);
  }

  // Navigation complexity — LLM takes priority; derive only when LLM did not return the dimension.
  if (!fixDims.has("navigation") && !passDims.has("navigation")) {
    const fix = deriveNavAudit(checklist, computedValues);
    if (fix) derivedCandidates.push(fix);
  }

  // Social proof — skipped when LLM already output a depth fix.
  if (!fixDims.has("social_proof") && !fixDims.has("depth") && !passDims.has("social_proof")) {
    const fix = deriveSocialProofAudit(checklist, context.meta, computedValues);
    if (fix) derivedCandidates.push(fix);
  }

  // Spacing — derive from pixel gaps between hero elements.
  if (!fixDims.has("spacing") && !passDims.has("spacing")) {
    const fix = deriveSpacingAudit(computedValues);
    if (fix) derivedCandidates.push(fix);
  }

  derivedCandidates.sort(
    (a, b) =>
      DERIVE_PRIORITY_ORDER.indexOf(a.dimension) -
      DERIVE_PRIORITY_ORDER.indexOf(b.dimension)
  );

  for (const fix of derivedCandidates) {
    appendDerivedFix(resultFixes, fixDims, fix);
  }

  if (resultFixes.length < MIN_VISUAL_FIXES) {
    for (const item of checklist) {
      if (item.status === "pass") {
        continue;
      }

      const fix = deriveFixFromChecklistGap(item, context.copyVariants);
      if (!fix) continue;

      // Skip fallback cards whose observation mostly restates the checklist text — the user already
      // sees it in "What needs fixing". Threshold 0.75 of checklist words present in the observation.
      if (checklistTextOverlapScore(fix.observation, item.text) > 0.75) continue;

      appendDerivedFix(resultFixes, fixDims, fix);
      if (resultFixes.length >= MIN_VISUAL_FIXES) {
        break;
      }
    }
  }

  if (resultFixes.length + resultPasses.length < MIN_VISUAL_FIXES + 1) {
    for (const item of checklist) {
      appendDerivedPass(
        resultPasses,
        passDims,
        fixDims,
        derivePassFromChecklistItem(item)
      );
      if (resultFixes.length + resultPasses.length >= MIN_VISUAL_FIXES + 1) {
        break;
      }
    }
  }

  return {
    fixes: resultFixes.slice(0, 4),
    passes: resultPasses.slice(0, 4),
  };
}

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
  navigation: "navigation",
  nav: "navigation",
  nav_complexity: "navigation",
  social_proof: "social_proof",
  socialproof: "social_proof",
  trust_proof: "social_proof",
  proof: "social_proof",
  headline_formula: "headline_formula",
  headline: "headline_formula",
  heading_formula: "headline_formula",
  color_contrast: "color_contrast",
  colorcontrast: "color_contrast",
  contrast: "color_contrast",
  aa_contrast: "color_contrast",
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
    case "Navigation complexity":
      return "navigation";
    case "Social proof gap":
      return "social_proof";
    case "Headline formula":
      return "headline_formula";
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
  return /\b(dark|light|black|white|gray|grey|muted|hero|headline|subhead|subheadline|cta|button|pill|card|mockup|nav|logo|fold|accent|primary|secondary|radius|rounded|padding|gap|shadow|gradient|tint|#[0-9a-f]{3,6}|\d+\s*px|\d+\s*rem|download|trial|free|sign up|get started|start for free|proof|stat|badge|rating|testimonial|review|logos|counter)\b/i.test(
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

  if (fix.dimension === "density" && !CONCRETE_PAGE_ELEMENT_PATTERN.test(fix.observation)) {
    return false;
  }

  if (fix.dimension === "spacing") {
    if (!CONCRETE_PAGE_ELEMENT_PATTERN.test(fix.observation)) return false;
    if (!/\d+\s*px/i.test(fix.observation)) return false;
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
  const cl = checklist ?? [];

  // 1. Remove invalid and checklist-overlapping fixes.
  const valid = fixes.filter(
    (fix) => isActionableVisualFix(fix) && !overlapsChecklistGapText(fix, checklist)
  );

  // 2. Score by how closely the dimension maps to a critical checklist gap, then sort.
  //    This ensures critical gaps (missing > weak > no link) surface before cosmetic fixes
  //    when the LLM returns more than 4 candidates.
  const scored = valid.map((fix) => ({ fix, score: computeFixSeverityScore(fix, cl) }));
  scored.sort((a, b) => b.score - a.score);

  // 3. Dedup by dimension (highest-scored fix per dimension wins) and cap at 4.
  const seen = new Set<VisualFixDimension>();
  const filtered: ReportVisualFix[] = [];

  for (const { fix } of scored) {
    if (seen.has(fix.dimension)) continue;
    seen.add(fix.dimension);
    filtered.push(fix);
    if (filtered.length >= 4) break;
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

  if (/navigation|nav\s+link|menu\s+item|sticky\s+cta|header\s+nav/.test(haystack)) {
    return "navigation";
  }

  if (/social\s+proof|trust\s+proof|logo|testimonial|customer\s+quote|proof\s+above/.test(haystack)) {
    return "social_proof";
  }

  if (/headline|hero\s+title|product\s+category|audience\s+signal|heading\s+formula/.test(haystack)) {
    return "headline_formula";
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
  _breakdown?: ReportBreakdown,
  context?: VisualSectionContext
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

  return supplementVisualSection(fixes, passes, {
    checklist: checklistSource,
    copyVariants: context?.copyVariants,
    meta: context?.meta,
  });
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
