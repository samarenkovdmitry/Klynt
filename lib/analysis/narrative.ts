import { callLLM } from "../models/client";
import type { ExtractionResult } from "./extraction";

export interface Finding {
  type: "clarity" | "cta" | "trust" | "friction" | "performance";
  severity: "high" | "medium" | "low";
  element: string;
  title: string;
  body: string;
  fix: string;
  evidence: string; // one short fact, max 50 chars, e.g. "33,000 users, no logos or names"
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
- "title" must NOT start with a verb. Bad: "Fix your CTA". Good: "CTA is too generic to convert".
- "subheadline" must share zero words with "headline".
- "fix" is one imperative sentence. Be concrete.
- "evidence" is one short fact from the page, max 50 chars, no verbs. Examples:
  "\"Get started\" — no outcome stated"
  "33,000 users, no logos or names"
  "1280px viewport detected"
- "quickWins": top 3 most impactful fixes, each with:
  - "text": imperative sentence under 15 words, specific action
  - "delta": score improvement estimate 0.1–1.5, one decimal
  - Order by delta descending
- Score 0–100: -15 per high severity issue, -7 medium, -3 low.
- scorePotential = score + lift, cap at 94.

Hero format routing (pick ONE by top issue type):
- clarity → D_textual | cta → B_before_after | trust → C_count_trust | friction → A_numeric | performance → A_numeric

Copy variants rules:
- Generate 2-4 copy_variants for the most impactful copy changes
- "before_text" must be the EXACT text from the page (quote from extraction)
- "after_text" must be specific, concrete, outcome-focused — not generic
- section "headline" and "cta" are mandatory if they have issues
- "label" format: "[SECTION] OPPORTUNITY" e.g. "HEADLINE OPPORTUNITY"

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

export async function generateNarrative(extraction: ExtractionResult, url: string) {
  const { text, usage } = await callLLM({
    role: "narrative",
    systemPrompt: NARRATIVE_SYSTEM,
    userPrompt: `Landing page: ${url}\n\nEXTRACTION:\n${JSON.stringify(extraction, null, 2)}\n\nGenerate NarrativeResult JSON: { "hero": { "format": string, "headline": string, "subheadline": string, "score": number, "scorePotential": number, "lift": number, "topIssue": Finding }, "findings": Finding[], "summary": string, "quickWins": { text: string, delta: number }[], "copy_variants": CopyVariant[], "visual_fixes": VisualFix[] }\n\nWhere Finding = { "type": "clarity"|"cta"|"trust"|"friction"|"performance", "severity": "high"|"medium"|"low", "element": string, "title": string, "body": string, "fix": string, "evidence": string }\nWhere CopyVariant = { "section": string, "label": string, "before_text": string, "after_text": string, "rationale": string }\nWhere VisualFix = { "category": string, "element": string, "observation": string, "fix": string, "impact": string }`,
    maxTokens: 3000,
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
