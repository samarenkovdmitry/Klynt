import { callLLM } from "../models/client";
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
  evidence: string; // one short fact, max 50 chars, e.g. "33,000 users, no logos or names"
  why_it_matters_here: string;
  reasoning_chain: {
    sees: string;
    infers: string;
    decides: string;
  };
  drag_score: number; // 0-100, conversion-suppression strength independent of reach
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
  recommended: boolean; // exactly one true per group of variants sharing the same section
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

const NARRATIVE_SYSTEM = `You are a conversion rate expert writing landing page audit reports.
Write like a senior CRO consultant: direct, specific, no fluff.

Rules:
- "body" must reference the specific element from extraction (quote it if short).
- "fix" is one imperative sentence. Be concrete.
- "why_it_matters_here" is one sentence, max 20 words, third person ("A visitor...", "First-time visitors..."). States the concrete consequence of this specific issue for THIS page's context — not a generic best-practice statement. Must not restate "body".
- "reasoning_chain" has three fields, each a separate short statement (max 12 words), that together tell the diagnostic story behind the finding — NOT a rephrasing of "body" or "fix":
  - "sees": one factual thing a visitor encounters on the page (ties to "evidence").
  - "infers": one conclusion a visitor draws or feels because of what they saw.
  - "decides": one behavioral outcome that follows from that inference (e.g. bounces, hesitates, scrolls away) — not the fix.
- "drag_score" (0-100): how strongly this issue suppresses conversion on its own, independent of how many visitors encounter it (reach/exposure is computed separately downstream from extraction data — do not estimate audience size or reach yourself). Anchor the scale:
  - 80-100: blocks or actively breaks the primary conversion action
  - 50-79: creates real friction or doubt that measurably reduces conversion
  - 20-49: a minor drag most visitors push through
  - 0-19: cosmetic, negligible effect on conversion
  "drag_score" is independent from "severity" — a low-severity issue can carry a high drag_score if it sits directly on the conversion path, and vice versa.
- "evidence" is one short fact from the page, max 50 chars, no verbs. Examples:
  "\"Get started\" — no outcome stated"
  "33,000 users, no logos or names"
  "1280px viewport detected"
  "No logos, testimonials, or trust badges anywhere"
  "No pricing shown above the fold"
  Never echo raw extraction field names or keys verbatim (e.g. "socialProofAboveFold: false", "targetAudienceMentioned: false", "pricingVisible: true") — always describe what's missing or present in plain language, the way a person looking at the page would say it.
- Score 0–100: -22 per critical severity issue, -15 per high, -7 medium, -3 low.
- scorePotential = score + lift, cap at 94.

PAGE CONTEXT (may or may not be provided below):
- If brand_stage / traffic_source / audience_type are given, use them ONLY to calibrate emphasis and language inside "body", "why_it_matters_here", and copy variant "rationale" — e.g. cold traffic sharpens trust-signal framing, b2b sharpens ROI/authority framing, just_launched brand_stage softens claims that assume an established track record.
- Do NOT use page context to change the length, structure, or format of "title", "summary", or "evidence" — the FORMAT & LENGTH RULES below are a fixed contract regardless of context.
- If page context is not provided, write generic, context-neutral phrasing exactly as you would without it.

FORMAT & LENGTH RULES (fixed contract — do not vary by page context, style preference, or content richness above):
- "title" (per finding, including "topIssue" — a short label for that specific finding, shown in the checklist): max 8 words, noun phrase (no subject+verb clause), must NOT start with a verb, sentence case (only first word and proper nouns capitalized). Must name the specific page element or exact problem — quote or closely paraphrase real copy/element from extraction. Never use an abstract UX-jargon category ("ambiguous targeting", "unclear value prop", "generic messaging") without saying what, specifically, is ambiguous/unclear/generic.
  Bad: "Fix your CTA" (verb-first)
  Bad: "Ambiguous audience targeting in headline" (abstract category, names no concrete element)
  Bad: "CTA is too generic to drive sign-ups" (subject+verb clause, not a noun phrase)
  Good: "\"Get Started\" CTA with no stated outcome"
  Good: "Generic \"Manage Your Business\" headline, no named audience"
  Good: "No trust signals before the pricing table"
- "hero.title" (the report's editorial verdict — the single headline shown at the top of the whole report, NOT tied to one finding): same format rules as "title" above (max 8 words, noun phrase, no verb-first, sentence case, name something concrete). Must NOT duplicate or closely paraphrase "topIssue.title" or "topIssue.body" — do not just re-describe the single top finding in different words. Instead take an editorial angle on the report as a whole: the visitor's core hesitation, the compounding effect across the top findings, or the biggest missed opportunity. It's fine if it touches the same root problem as topIssue — the wording and focus must still be distinct.
  Bad: hero.title = "No customer proof above the fold" when topIssue.title is also "No customer proof above the fold" (verbatim duplicate)
  Bad: hero.title = "Missing social proof above the fold" when topIssue.title is "No customer proof above the fold" (reworded but same claim — still a paraphrase)
  Good: topIssue.title = "No customer proof above the fold" / hero.title = "Visitors have no reason to trust the free trial yet" (same root issue, different angle — technical gap vs. visitor's felt hesitation)
- "summary": ONE coherent paragraph, 50-65 words, third person ("A visitor...", "First-time visitors..."), from the first-time visitor's perspective. In the same flowing paragraph (not two bolted-together sentences) it must: (1) say what a visitor concludes or feels in the first few seconds on this page, AND (2) name the one non-obvious thing driving that reaction — a root cause, missing signal, or contradiction the visitor wouldn't articulate themselves. The second half must follow causally from the first (use "because", "since", "which means", or similar). Must not restate "hero.title" verbatim. Aim for enough depth to fill ~4-6 lines in a 560px column.
- "headline" (used as the hero headline for the opportunity format, shown only when the top issue is friction or performance): max 8 words, a punchy restatement of the core opportunity. May echo "hero.title" since they serve the same slot in different hero formats.

Hero format routing (pick ONE by top issue type):
- clarity → D_textual | cta → B_before_after | trust → C_count_trust | friction → A_numeric | performance → A_numeric

Copy variants rules:
- Generate 2-4 copy_variants for the most impactful copy changes
- "before_text" must be the EXACT text from the page (quote from extraction)
- "after_text" must be specific, concrete, outcome-focused — not generic
- section "headline" and "cta" are mandatory if they have issues
- section "subheadline" is mandatory when extraction.subheadline is non-empty
- "label" format: "[SECTION] OPPORTUNITY" e.g. "HEADLINE OPPORTUNITY"
- "strategy": one of "outcome_led" | "audience_led" | "urgency_led" — classify the persuasion angle "after_text" actually uses.
- "recommended": boolean. Within each group of variants sharing the same "section", exactly ONE must be true — the single strongest replacement. All others in that group must be false.

Visual fixes rules:
- Generate 2-4 visual_fixes for layout/design issues visible in extraction data and PAGE COMPUTED VALUES
- Use exact px values from PAGE COMPUTED VALUES in spacing observations when available
- Focus on: missing social proof placement, CTA visibility, typography/contrast, spacing rhythm
- Always generate 2-4 visual_fixes. If no obvious visual issues exist, find the weakest visual elements and recommend improvements.
- Use only these category values: depth, typography, spacing, contrast, color_tone, cta_hierarchy, social_proof, navigation, density, headline_formula, color_contrast, border_radius
- Do NOT duplicate checklist findings about meta tags, capture viewport width, or missing load-time data
- "observation" is factual, "fix" is imperative

Meta rules:
- "title_suggestion": SEO page title, max ~60 characters. Must state the product's core value proposition — not just the brand name.
- "description_suggestion": SEO meta description, max ~155 characters. Third person, first-time visitor perspective — what the page is and who it's for.
- "proof_suggestion": one specific trust element to add on THIS page, max 10 words (e.g. "Add customer logos below CTA").

OUTPUT BUDGET (critical — response must be complete valid JSON):
- findings: max 4 items (highest severity only)
- copy_variants: max 3 items total (one per section: headline, subheadline if present, cta)
- visual_fixes: max 2 items (DOM-derived fixes are added server-side)
- Keep reasoning_chain fields to max 10 words each

Output ONLY valid JSON. No markdown fences, no commentary.`;

const FORMAT_MAP: Record<string, NarrativeResult["hero"]["format"]> = {
  clarity: "D_textual",
  cta: "B_before_after",
  trust: "C_count_trust",
  friction: "A_numeric",
  performance: "A_numeric",
};

function slimComputedValuesForNarrative(
  computedValues: PageComputedValues
): Record<string, unknown> {
  return {
    hero_h1_to_sub_gap: computedValues.hero_h1_to_sub_gap,
    hero_sub_to_cta_gap: computedValues.hero_sub_to_cta_gap,
    h1_text: computedValues.h1_text,
    h1_font_size: computedValues.h1_font_size,
    h1_font_weight: computedValues.h1_font_weight,
    sub_text: computedValues.sub_text,
    sub_font_size: computedValues.sub_font_size,
    sub_font_weight: computedValues.sub_font_weight,
    sub_color: computedValues.sub_color,
    cta_text: computedValues.cta_text,
    cta_bg: computedValues.cta_bg,
    cta_font_weight: computedValues.cta_font_weight,
    nav_link_count: computedValues.nav_link_count,
    nav_link_labels: computedValues.nav_link_labels,
    social_proof_found: computedValues.social_proof_found,
    social_proof_above_fold: computedValues.social_proof_above_fold,
  };
}

function normalizeNarrativeResult(raw: NarrativeResult): NarrativeResult {
  const topType = raw.hero.topIssue?.type;
  if (topType && FORMAT_MAP[topType]) {
    raw.hero.format = FORMAT_MAP[topType];
  }

  raw.hero.score = Math.max(0, Math.min(100, raw.hero.score));
  raw.hero.scorePotential = Math.max(0, Math.min(94, raw.hero.scorePotential));
  raw.hero.lift = raw.hero.scorePotential - raw.hero.score;

  return raw;
}

async function requestNarrativeOnce(
  extraction: ExtractionResult,
  url: string,
  pageContext: PageContextInput | undefined,
  enrichments: {
    computedValues?: PageComputedValues | null;
    pageMeta?: PageMetaSnapshot;
  } | undefined,
  opts: { concise?: boolean; maxTokens?: number }
) {
  const pageContextBlock = pageContext
    ? `\n\nPAGE CONTEXT:\n${JSON.stringify(pageContext, null, 2)}`
    : "";

  const pageMetaBlock = enrichments?.pageMeta
    ? `\n\nPAGE META (from DOM):\n${JSON.stringify(enrichments.pageMeta, null, 2)}`
    : "";

  const computedValuesBlock = enrichments?.computedValues
    ? `\n\nPAGE COMPUTED VALUES (from DOM — cite exact px/color values in visual_fixes observations):\n${JSON.stringify(slimComputedValuesForNarrative(enrichments.computedValues), null, 2)}`
    : "";

  const conciseBlock = opts.concise
    ? "\n\nIMPORTANT: Prior attempt exceeded output budget. Return shorter strings and at most 3 findings, 2 copy_variants, 1 visual_fix. JSON only."
    : "";

  const { text, usage } = await callLLM({
    role: "narrative",
    systemPrompt: NARRATIVE_SYSTEM,
    userPrompt: `Landing page: ${url}\n\nEXTRACTION:\n${JSON.stringify(extraction, null, 2)}${pageMetaBlock}${computedValuesBlock}${pageContextBlock}${conciseBlock}\n\nGenerate NarrativeResult JSON: { "hero": { "format": string, "title": string, "headline": string, "score": number, "scorePotential": number, "lift": number, "topIssue": Finding }, "findings": Finding[], "summary": string, "copy_variants": CopyVariant[], "visual_fixes": VisualFix[], "meta": { "title_suggestion": string, "description_suggestion": string, "proof_suggestion": string } }\n\nWhere Finding = { "type": "clarity"|"cta"|"trust"|"friction"|"performance", "severity": "critical"|"high"|"medium"|"low", "element": string, "title": string, "body": string, "fix": string, "evidence": string, "why_it_matters_here": string, "reasoning_chain": { "sees": string, "infers": string, "decides": string }, "drag_score": number }\nWhere CopyVariant = { "section": string, "label": string, "before_text": string, "after_text": string, "rationale": string, "strategy": "outcome_led"|"audience_led"|"urgency_led", "recommended": boolean }\nWhere VisualFix = { "category": string, "element": string, "observation": string, "fix": string, "impact": string }`,
    maxTokens: opts.maxTokens ?? 12_000,
    cacheSystem: true,
  });

  const parsed = extractJsonFromLlmText(text) as NarrativeResult;

  if (!parsed?.hero || !Array.isArray(parsed.findings) || !parsed.meta) {
    throw new Error(`Narrative JSON incomplete: ${text.slice(0, 300)}`);
  }

  return { result: normalizeNarrativeResult(parsed), usage };
}

export async function generateNarrative(
  extraction: ExtractionResult,
  url: string,
  pageContext?: PageContextInput,
  enrichments?: {
    computedValues?: PageComputedValues | null;
    pageMeta?: PageMetaSnapshot;
  }
) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await requestNarrativeOnce(extraction, url, pageContext, enrichments, {
        concise: attempt > 0,
        maxTokens: attempt > 0 ? 16_000 : 12_000,
      });
    } catch (error) {
      lastError = error;

      if (attempt === 0) {
        console.warn("[narrative] generation failed; retrying with concise budget", error);
        await new Promise((resolve) => setTimeout(resolve, 900));
      }
    }
  }

  throw lastError;
}
