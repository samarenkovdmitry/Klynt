import { callLLM } from "../models/client";
import type { ExtractionResult } from "./extraction";

export interface Finding {
  type: "clarity" | "cta" | "trust" | "friction" | "performance";
  severity: "high" | "medium" | "low";
  element: string;
  title: string;
  body: string;
  fix: string;
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

export interface NarrativeResult {
  hero: HeroSlot;
  findings: Finding[];
  summary: string;
  quickWins: string[];
}

const NARRATIVE_SYSTEM = `You are a conversion rate expert writing landing page audit reports.
Write like a senior CRO consultant: direct, specific, no fluff.

Rules:
- "body" must reference the specific element from extraction (quote it if short).
- "title" must NOT start with a verb. Bad: "Fix your CTA". Good: "CTA is too generic to convert".
- "subheadline" must share zero words with "headline".
- "fix" is one imperative sentence. Be concrete.
- "quickWins" under 15 words each, start with a verb.
- Score 0–100: -15 per high severity issue, -7 medium, -3 low.
- scorePotential = score + lift, cap at 94.

Hero format routing (pick ONE by top issue type):
- clarity → D_textual | cta → B_before_after | trust → C_count_trust | friction → A_numeric | performance → A_numeric

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
    userPrompt: `Landing page: ${url}\n\nEXTRACTION:\n${JSON.stringify(extraction, null, 2)}\n\nGenerate NarrativeResult JSON: { "hero": { "format": string, "headline": string, "subheadline": string, "score": number, "scorePotential": number, "lift": number, "topIssue": Finding }, "findings": Finding[], "summary": string, "quickWins": string[] }`,
    maxTokens: 1800,
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
