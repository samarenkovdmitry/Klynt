import { callLLM, type LLMResult } from "../models/client";
import type { ExtractionResult, PageMetaSnapshot } from "./extraction";
import type { PageComputedValues } from "@/lib/audit-report";
import { extractJsonFromLlmText } from "./parse-llm-json";

export interface Finding {
  type: "clarity" | "cta" | "trust" | "friction" | "performance";
  severity: "critical" | "high" | "medium" | "low";
  element: string;
  title: string;
  body: string;
  fix: string;
  evidence: string;
  why_it_matters_here: string;
  reasoning_chain: {
    sees: string;
    infers: string;
    decides: string;
  };
  drag_score: number;
}

export interface PageContextInput {
  brand_stage?: "just_launched" | "growing" | "established";
  traffic_source?: "cold" | "warm" | "mixed";
  audience_type?: "b2b" | "b2c" | "both";
}

export interface HeroSlot {
  format: "A_numeric" | "B_before_after" | "C_count_trust" | "D_textual";
  title: string;
  headline: string;
  score: number;
  scorePotential: number;
  lift: number;
  topIssue: Finding;
}

export interface CopyVariant {
  section: "headline" | "subheadline" | "cta" | "social_proof";
  label: string;
  before_text: string;
  after_text: string;
  rationale: string;
  strategy: "outcome_led" | "audience_led" | "urgency_led";
  recommended: boolean;
}

export interface VisualFix {
  category: "depth" | "typography" | "spacing" | "contrast" | "color_tone"
           | "cta_hierarchy" | "social_proof" | "navigation" | "density"
           | "headline_formula" | "color_contrast" | "border_radius";
  element: string;
  observation: string;
  fix: string;
  impact: "high" | "medium" | "low";
}

export interface NarrativeResult {
  hero: HeroSlot;
  findings: Finding[];
  summary: string;
  copy_variants: CopyVariant[];
  visual_fixes: VisualFix[];
  meta: {
    title_suggestion: string;
    description_suggestion: string;
    proof_suggestion: string;
  };
}

const SHARED_RULES = `Write like a senior CRO consultant: direct, specific, no fluff.
- "title" (findings + hero.title): max 8 words, noun phrase, sentence case, name the concrete element.
- "evidence": one short fact, max 50 chars.
- "body": one sentence referencing the page element.
- "fix": one imperative sentence.
- "why_it_matters_here": max 20 words, third person.
- Score 0–100: -22 critical, -15 high, -7 medium, -3 low. scorePotential = score + lift, cap 94.
- Do NOT report empty meta if PAGE META shows title/description.
- Do NOT treat capture viewport width as a mobile bug.
- Do NOT report missing load time when loadTimeMs is 0.
Output ONLY valid JSON. No markdown fences.`;

const CORE_SYSTEM = `You are a conversion rate expert writing the CORE section of a landing page audit.
${SHARED_RULES}

Return JSON: { "hero": { "format": string, "title": string, "headline": string, "score": number, "scorePotential": number, "lift": number, "topIssue": Finding }, "findings": Finding[], "summary": string }

Finding = { "type": "clarity"|"cta"|"trust"|"friction"|"performance", "severity": "critical"|"high"|"medium"|"low", "element": string, "title": string, "body": string, "fix": string, "evidence": string, "why_it_matters_here": string, "drag_score": number }

Hero routing: clarity→D_textual, cta→B_before_after, trust→C_count_trust, friction→A_numeric, performance→A_numeric.
- findings: max 3 (highest severity)
- summary: 50-65 words, third person, one paragraph
- hero.title must differ in angle from topIssue.title`;

const SUPPLEMENT_SYSTEM = `You are a conversion copywriter writing the SUPPLEMENT section of a landing page audit.
${SHARED_RULES}

Return JSON: { "copy_variants": CopyVariant[], "visual_fixes": VisualFix[], "meta": { "title_suggestion": string, "description_suggestion": string, "proof_suggestion": string } }

CopyVariant = { "section": "headline"|"subheadline"|"cta", "label": string, "before_text": string, "after_text": string, "rationale": string, "strategy": "outcome_led"|"audience_led"|"urgency_led", "recommended": true }
VisualFix = { "category": "depth"|"typography"|"spacing"|"contrast"|"color_tone"|"cta_hierarchy"|"social_proof"|"navigation"|"density"|"headline_formula"|"color_contrast"|"border_radius", "element": string, "observation": string, "fix": string, "impact": "high"|"medium"|"low" }

Rules:
- copy_variants: exactly 1 per section present in extraction (headline, subheadline if non-empty, cta). before_text = exact page copy.
- visual_fixes: 0-2 items only (server adds DOM-derived fixes). Use allowed category values only.
- meta.title_suggestion ~60 chars; meta.description_suggestion ~155 chars; meta.proof_suggestion max 10 words.`;

const FORMAT_MAP: Record<string, NarrativeResult["hero"]["format"]> = {
  clarity: "D_textual",
  cta: "B_before_after",
  trust: "C_count_trust",
  friction: "A_numeric",
  performance: "A_numeric",
};

type NarrativeEnrichments = {
  computedValues?: PageComputedValues | null;
  pageMeta?: PageMetaSnapshot;
};

function slimComputedValuesForNarrative(
  computedValues: PageComputedValues
): Record<string, unknown> {
  return {
    hero_h1_to_sub_gap: computedValues.hero_h1_to_sub_gap,
    hero_sub_to_cta_gap: computedValues.hero_sub_to_cta_gap,
    h1_text: computedValues.h1_text,
    sub_text: computedValues.sub_text,
    sub_font_weight: computedValues.sub_font_weight,
    cta_text: computedValues.cta_text,
    nav_link_count: computedValues.nav_link_count,
    social_proof_found: computedValues.social_proof_found,
    social_proof_above_fold: computedValues.social_proof_above_fold,
  };
}

function buildContextBlocks(
  pageContext: PageContextInput | undefined,
  enrichments: NarrativeEnrichments | undefined
) {
  const pageContextBlock = pageContext
    ? `\n\nPAGE CONTEXT:\n${JSON.stringify(pageContext, null, 2)}`
    : "";

  const pageMetaBlock = enrichments?.pageMeta
    ? `\n\nPAGE META (from DOM):\n${JSON.stringify(enrichments.pageMeta, null, 2)}`
    : "";

  const computedValuesBlock = enrichments?.computedValues
    ? `\n\nPAGE COMPUTED VALUES:\n${JSON.stringify(slimComputedValuesForNarrative(enrichments.computedValues), null, 2)}`
    : "";

  return { pageContextBlock, pageMetaBlock, computedValuesBlock };
}

function normalizeFinding(raw: Partial<Finding> & { type: Finding["type"]; title: string }): Finding {
  const evidence = raw.evidence?.trim() || raw.title;
  const body = raw.body?.trim() || raw.title;

  return {
    type: raw.type,
    severity: raw.severity ?? "medium",
    element: raw.element?.trim() || "Hero section",
    title: raw.title,
    body,
    fix: raw.fix?.trim() || "Improve this element above the fold.",
    evidence,
    why_it_matters_here:
      raw.why_it_matters_here?.trim() || "First-time visitors need clearer signals before they convert.",
    reasoning_chain: raw.reasoning_chain ?? {
      sees: evidence,
      infers: body.slice(0, 80),
      decides: "Hesitates before starting a trial",
    },
    drag_score: typeof raw.drag_score === "number" ? raw.drag_score : 55,
  };
}

function normalizeNarrativeResult(raw: NarrativeResult): NarrativeResult {
  const topType = raw.hero.topIssue?.type;
  if (topType && FORMAT_MAP[topType]) {
    raw.hero.format = FORMAT_MAP[topType];
  }

  raw.hero.topIssue = normalizeFinding(raw.hero.topIssue);
  raw.findings = (raw.findings ?? []).map((finding) => normalizeFinding(finding));
  raw.copy_variants = raw.copy_variants ?? [];
  raw.visual_fixes = raw.visual_fixes ?? [];

  raw.hero.score = Math.max(0, Math.min(100, raw.hero.score));
  raw.hero.scorePotential = Math.max(0, Math.min(94, raw.hero.scorePotential));
  raw.hero.lift = raw.hero.scorePotential - raw.hero.score;

  return raw;
}

function mergeUsage(a: LLMResult["usage"], b: LLMResult["usage"]): LLMResult["usage"] {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    cacheReadTokens: a.cacheReadTokens + b.cacheReadTokens,
    cacheWriteTokens: a.cacheWriteTokens + b.cacheWriteTokens,
    estimatedCostUsd: a.estimatedCostUsd + b.estimatedCostUsd,
  };
}

async function requestNarrativeCore(
  extraction: ExtractionResult,
  url: string,
  pageContext: PageContextInput | undefined,
  enrichments: NarrativeEnrichments | undefined
) {
  const { pageContextBlock, pageMetaBlock, computedValuesBlock } = buildContextBlocks(
    pageContext,
    enrichments
  );

  const { text, usage } = await callLLM({
    role: "narrative",
    systemPrompt: CORE_SYSTEM,
    userPrompt: `Landing page: ${url}\n\nEXTRACTION:\n${JSON.stringify(extraction, null, 2)}${pageMetaBlock}${computedValuesBlock}${pageContextBlock}`,
    maxTokens: 4096,
    cacheSystem: true,
  });

  const parsed = extractJsonFromLlmText(text) as {
    hero?: HeroSlot;
    findings?: Partial<Finding>[];
    summary?: string;
  };

  if (!parsed.hero || !Array.isArray(parsed.findings) || !parsed.summary?.trim()) {
    throw new Error(`Narrative core incomplete (${text.length} chars): ${text.slice(0, 280)}`);
  }

  const result: NarrativeResult = {
    hero: parsed.hero,
    findings: parsed.findings as Finding[],
    summary: parsed.summary,
    copy_variants: [],
    visual_fixes: [],
    meta: {
      title_suggestion: "",
      description_suggestion: "",
      proof_suggestion: "",
    },
  };

  return { result: normalizeNarrativeResult(result), usage };
}

async function requestNarrativeSupplement(
  extraction: ExtractionResult,
  url: string,
  core: NarrativeResult,
  pageContext: PageContextInput | undefined,
  enrichments: NarrativeEnrichments | undefined
) {
  const { pageContextBlock, pageMetaBlock, computedValuesBlock } = buildContextBlocks(
    pageContext,
    enrichments
  );

  const coreContext = {
    hero_title: core.hero.title,
    score: core.hero.score,
    finding_titles: core.findings.map((f) => f.title),
    summary: core.summary,
  };

  const { text, usage } = await callLLM({
    role: "narrative",
    systemPrompt: SUPPLEMENT_SYSTEM,
    userPrompt: `Landing page: ${url}\n\nEXTRACTION:\n${JSON.stringify(extraction, null, 2)}\n\nCORE REPORT:\n${JSON.stringify(coreContext, null, 2)}${pageMetaBlock}${computedValuesBlock}${pageContextBlock}`,
    maxTokens: 3072,
    cacheSystem: true,
  });

  const parsed = extractJsonFromLlmText(text) as {
    copy_variants?: CopyVariant[];
    visual_fixes?: VisualFix[];
    meta?: NarrativeResult["meta"];
  };

  if (!parsed.meta?.title_suggestion?.trim() || !parsed.meta.description_suggestion?.trim()) {
    throw new Error(`Narrative supplement incomplete (${text.length} chars): ${text.slice(0, 280)}`);
  }

  return {
    result: {
      copy_variants: parsed.copy_variants ?? [],
      visual_fixes: parsed.visual_fixes ?? [],
      meta: parsed.meta,
    },
    usage,
  };
}

export async function generateNarrative(
  extraction: ExtractionResult,
  url: string,
  pageContext?: PageContextInput,
  enrichments?: NarrativeEnrichments
) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const core = await requestNarrativeCore(extraction, url, pageContext, enrichments);
      const supplement = await requestNarrativeSupplement(
        extraction,
        url,
        core.result,
        pageContext,
        enrichments
      );

      const merged: NarrativeResult = {
        ...core.result,
        copy_variants: supplement.result.copy_variants,
        visual_fixes: supplement.result.visual_fixes,
        meta: supplement.result.meta,
      };

      return {
        result: normalizeNarrativeResult(merged),
        usage: mergeUsage(core.usage, supplement.usage),
      };
    } catch (error) {
      lastError = error;

      if (attempt === 0) {
        console.warn("[narrative] split generation failed; retrying", error);
        await new Promise((resolve) => setTimeout(resolve, 900));
      }
    }
  }

  throw lastError;
}
