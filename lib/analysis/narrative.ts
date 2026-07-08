import { callLLM } from "../models/client";
import type { ExtractionResult } from "./extraction";

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
  headline: string;
  subheadline: string;
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
  quickWins: { text: string; delta: number }[];
  copy_variants: CopyVariant[];
  visual_fixes: VisualFix[];
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
- "quickWins": top 3 most impactful fixes, each with:
  - "text": imperative sentence under 15 words, specific action
  - "delta": score improvement estimate 0.1–1.5, one decimal
  - Order by delta descending
- Score 0–100: -22 per critical severity issue, -15 per high, -7 medium, -3 low.
- scorePotential = score + lift, cap at 94.

PAGE CONTEXT (may or may not be provided below):
- If brand_stage / traffic_source / audience_type are given, use them ONLY to calibrate emphasis and language inside "body", "why_it_matters_here", and copy variant "rationale" — e.g. cold traffic sharpens trust-signal framing, b2b sharpens ROI/authority framing, just_launched brand_stage softens claims that assume an established track record.
- Do NOT use page context to change the length, structure, or format of "title", "summary", "subheadline", or "evidence" — the FORMAT & LENGTH RULES below are a fixed contract regardless of context.
- If page context is not provided, write generic, context-neutral phrasing exactly as you would without it.

FORMAT & LENGTH RULES (fixed contract — do not vary by page context, style preference, or content richness above):
- "title" (used as the report's verdict): max 8 words, noun phrase, no subject+verb structure, must NOT start with a verb, sentence case (only first word and proper nouns capitalized).
  Bad: "Fix your CTA" / "The CTA fails to convert visitors" / "CTA Is Too Generic to Drive Sign-Ups"
  Good: "CTA is too generic to convert"
- "summary": max 30 words, 1-2 sentences, third person ("A visitor...", "First-time visitors..."), from the first-time visitor's perspective — what they feel and fail to understand in the first 3 seconds.
- "subheadline" (used as the report's key observation): max 12 words, one phrase, must share zero words with "headline", must reveal something non-obvious — never restate "title", "summary", or the top issue.

Hero format routing (pick ONE by top issue type):
- clarity → D_textual | cta → B_before_after | trust → C_count_trust | friction → A_numeric | performance → A_numeric

Copy variants rules:
- Generate 2-4 copy_variants for the most impactful copy changes
- "before_text" must be the EXACT text from the page (quote from extraction)
- "after_text" must be specific, concrete, outcome-focused — not generic
- section "headline" and "cta" are mandatory if they have issues
- "label" format: "[SECTION] OPPORTUNITY" e.g. "HEADLINE OPPORTUNITY"
- "strategy": one of "outcome_led" | "audience_led" | "urgency_led" — classify the persuasion angle "after_text" actually uses.
- "recommended": boolean. Within each group of variants sharing the same "section", exactly ONE must be true — the single strongest replacement. All others in that group must be false.

Visual fixes rules:
- Generate 2-4 visual_fixes for layout/design issues visible in extraction data
- Focus on: missing social proof placement, CTA visibility, mobile viewport issues
- Always generate 2-4 visual_fixes. If no obvious visual issues exist, find the weakest visual elements and recommend improvements.
- "observation" is factual, "fix" is imperative

Output ONLY valid JSON. No markdown, no commentary.`;

const FORMAT_MAP: Record<string, NarrativeResult["hero"]["format"]> = {
  clarity: "D_textual",
  cta: "B_before_after",
  trust: "C_count_trust",
  friction: "A_numeric",
  performance: "A_numeric",
};

export async function generateNarrative(
  extraction: ExtractionResult,
  url: string,
  pageContext?: PageContextInput
) {
  const pageContextBlock = pageContext
    ? `\n\nPAGE CONTEXT:\n${JSON.stringify(pageContext, null, 2)}`
    : "";

  const { text, usage } = await callLLM({
    role: "narrative",
    systemPrompt: NARRATIVE_SYSTEM,
    userPrompt: `Landing page: ${url}\n\nEXTRACTION:\n${JSON.stringify(extraction, null, 2)}${pageContextBlock}\n\nGenerate NarrativeResult JSON: { "hero": { "format": string, "headline": string, "subheadline": string, "score": number, "scorePotential": number, "lift": number, "topIssue": Finding }, "findings": Finding[], "summary": string, "quickWins": { text: string, delta: number }[], "copy_variants": CopyVariant[], "visual_fixes": VisualFix[] }\n\nWhere Finding = { "type": "clarity"|"cta"|"trust"|"friction"|"performance", "severity": "critical"|"high"|"medium"|"low", "element": string, "title": string, "body": string, "fix": string, "evidence": string, "why_it_matters_here": string, "reasoning_chain": { "sees": string, "infers": string, "decides": string }, "drag_score": number }\nWhere CopyVariant = { "section": string, "label": string, "before_text": string, "after_text": string, "rationale": string, "strategy": "outcome_led"|"audience_led"|"urgency_led", "recommended": boolean }\nWhere VisualFix = { "category": string, "element": string, "observation": string, "fix": string, "impact": string }`,
    maxTokens: 4000,
    cacheSystem: true,
  });

  let result: NarrativeResult;
  try {
    result = JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    throw new Error(`Narrative parse failed: ${text.slice(0, 300)}`);
  }

  // Enforce format routing (don't trust LLM's choice)
  const topType = result.hero.topIssue?.type;
  if (topType && FORMAT_MAP[topType]) result.hero.format = FORMAT_MAP[topType];

  // Clamp scores
  result.hero.score = Math.max(0, Math.min(100, result.hero.score));
  result.hero.scorePotential = Math.max(0, Math.min(94, result.hero.scorePotential));
  result.hero.lift = result.hero.scorePotential - result.hero.score;

  return { result, usage };
}
