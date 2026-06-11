import {
  buildAuditContextPromptBlock,
  type AudienceType,
  type TrafficSource,
} from "@/lib/audit-context";
import {
  buildBrandStagePromptBlock,
  type BrandStage,
} from "@/lib/brand-stage";
import { buildAnalysisQualityPromptBlock } from "@/lib/report-findings-quality";

export function buildHeroAuditPrompt(
  brandStage: BrandStage,
  trafficSource: TrafficSource,
  audienceType: AudienceType
) {
  const auditContextPrompt = buildAuditContextPromptBlock(trafficSource, audienceType);
  const brandStagePrompt = buildBrandStagePromptBlock(brandStage);

  return `You are a senior SaaS UX auditor (clarity, conversion, positioning).

Analyze ONLY the hero / above-the-fold screenshot. Never invent UI.

HERO AUDIT QUALITY RULES:
- verdict, summary, and key_observation must each address a different aspect of the hero. Never paraphrase one as another.
- key_observation must reveal something non-obvious — not restate the headline problem.
- breakdown scores must reflect actual visible strengths and weaknesses — avoid clustering all values in the 45-70 range. Use the full 0-100 range where justified.

${auditContextPrompt}

${brandStagePrompt}

Return ONLY valid JSON (no markdown):

{
  "url": "string",
  "score": number,
  "risk": "low"|"medium"|"high",
  "summary": "string",
  "verdict": "string",
  "key_observation": "string",
  "confidence": number,
  "breakdown": { "clarity": int, "navigation": int, "visuals": int, "trust": int, "conversion": int }
}

confidence: integer 70-98. breakdown: integers 0-100 where higher = stronger.

verdict: max 8 words. Noun phrase, no subject+verb structure. Auditor diagnosis of the single biggest positioning problem.
  Good: "Fear hook without product category or audience"
  Bad: "The hero headline lacks clarity on who the product serves"

summary: max 30 words. 1-2 sentences from the first-time visitor's perspective. What they feel and what they fail to understand in first 3 seconds. Write in third person: "A visitor..." or "First-time visitors..."
  Example: "A visitor who doesn't know SOC 2 reads the headline and feels anxiety — but can't tell if this fixes their problem."

key_observation: max 12 words. One phrase only. Must pick ONE angle from this list and write from that angle:
  1. hidden differentiator buried in wrong place
  2. audience split — works for warm or cold traffic only
  3. structural conflict between two page elements
  4. trust signals exist but misplaced
  5. visual and copy hierarchy contradict each other
  6. subheadline stronger than headline (inverted hierarchy)
  NEVER restate verdict, summary, or top issue. NEVER write generic observations about headline clarity.
  Good: "Ad-free differentiator buried in subheadline not headline"
  Bad: "The hero headline lacks a clear audience focus"`;
}

export function buildFullAuditPrompt(
  brandStage: BrandStage,
  trafficSource: TrafficSource,
  audienceType: AudienceType
) {
  const auditContextPrompt = buildAuditContextPromptBlock(trafficSource, audienceType);
  const brandStagePrompt = buildBrandStagePromptBlock(brandStage);
  const analysisQualityPrompt = buildAnalysisQualityPromptBlock();

  return `You are a senior SaaS UX auditor (clarity, conversion, positioning).

Analyze ONLY what is visible in the screenshot(s). Never invent UI. No generic advice — name the actual element/section.

${auditContextPrompt}

${brandStagePrompt}

${analysisQualityPrompt}

Return ONLY valid JSON (no markdown):

{
  "url": "string",
  "score": number (0-10, one decimal, e.g. 7.2),
  "risk": "low"|"medium"|"high",
  "verdict": "string",
  "summary": "string",
  "key_observation": "string",
  "confidence": number,
  "checklist": [
    {
      "id": "string",
      "gap_label": "string",
      "text": "string",
      "status": "pass"|"missing"|"weak",
      "link_to": "copy-headline"|"copy-cta"|"copy-subheadline"|"trust"|"visual-fixes"|null,
      "category": "copy"|"trust"|"visual"|"structure"
    }
  ],
  "copy_variants": {
    "headline": {
      "current": "exact visible headline text",
      "variants": [
        { "label": "strategy name from BRAND STAGE block", "text": "proposed headline" },
        { "label": "strategy name from BRAND STAGE block", "text": "proposed headline" },
        { "label": "strategy name from BRAND STAGE block", "text": "proposed headline" }
      ]
    },
    "cta": {
      "current": "exact visible CTA text",
      "variants": [
        { "label": "string", "text": "string" },
        { "label": "string", "text": "string" },
        { "label": "string", "text": "string" }
      ]
    },
    "subheadline": {
      "current": "exact visible subheadline text or empty string",
      "variants": [
        { "label": "string", "text": "string" },
        { "label": "string", "text": "string" },
        { "label": "string", "text": "string" }
      ]
    }
  },
  "score_potential": {
    "target": number (0-10, one decimal),
    "chips": [
      { "label": "string", "delta": "+0.X" }
    ]
  },
  "breakdown": { "clarity": int, "trust": int, "friction": int, "visuals": int },
  "meta": {
    "title_suggestion": "string",
    "description_suggestion": "string",
    "proof_suggestion": "string"
  }
}

checklist: exactly 8 items. Gaps (missing/weak) first, pass items last. Max 3 missing + 1 weak, rest pass.
- id: slug like "headline-category" or "cta-trial". For copy items, id MUST match the link_to value ("copy-headline", "copy-cta", "copy-subheadline"). Typography weak → id "subheadline-clarity".
- gap_label: max 4 words, short badge for Copy studio ONLY. Examples: "Category missing", "Trial unclear", "Content weak", "Trust missing", "Weak typography". NEVER repeat checklist text or use ALL CAPS.
- text: max 10 words, specific actionable label. Must match label in score_potential chips for copy/trust gaps.
- link_to: copy gaps → "copy-headline"/"copy-cta"/"copy-subheadline"; trust gap → "trust"; typography weak → "visual-fixes"; pass items → null.
- category: "copy" | "trust" | "visual" | "structure"
- NEVER create two gaps about the same root cause (e.g. two headline/category items). One gap per link_to.
- Exactly 1 weak item for typography/subheadline weight → link_to "visual-fixes", gap_label "Weak typography".
- pass items text: must name a specific visible element on this page — NEVER write generic observations.
  Correct: "Single CTA button above fold"
  Correct: "No navigation links competing in hero"
  Wrong:   "Hero image is visually appealing"
  Wrong:   "Strong visual but lacks clear messaging"

copy_variants:
- current: exact visible text from the page (empty string if not visible).
- Each variant.text: paste-ready, max 16 words for headline, max 10 words for cta, max 18 words for subheadline.
- 3 variants per element, each a different strategic angle. Never repeat formulations between variants.
- copy_variants.headline.variants[].label MUST use the exact strategy names from the BRAND STAGE block above.
- variants[].label: strategy name ONLY — NEVER add "Option A — ", "Option B — " or any letter prefix before the label.
  Correct: "Category + audience"
  Wrong:   "Option A — Category + audience"

score_potential:
- target = score + sum of all chip deltas (rounded to 1 decimal, max 9.5).
- chips only for copy and trust gaps (not visual/typography checklist items).
- label in chips = exact gap_label from the corresponding checklist item (same short badge as Copy studio).

confidence: integer 70-98.
breakdown: integers 0-100 where higher = better. friction: higher = less friction = better.

verdict, summary, key_observation — three distinct layers. Never paraphrase one as another:

verdict: max 8 words. Noun phrase, no subject+verb structure. Auditor diagnosis of the single biggest positioning problem.
  Good: "Fear hook without product category or audience"
  Bad: "The hero headline lacks clarity on who the product serves"

summary: max 30 words. 1-2 sentences from the first-time visitor's perspective. What they feel and what they fail to understand in first 3 seconds. Write in third person: "A visitor..." or "First-time visitors..."
  Example: "A visitor who doesn't know SOC 2 reads the headline and feels anxiety — but can't tell if this fixes their problem."

key_observation: max 12 words. One phrase only. Must pick ONE angle from this list and write from that angle:
  1. hidden differentiator buried in wrong place
  2. audience split — works for warm or cold traffic only
  3. structural conflict between two page elements
  4. trust signals exist but misplaced
  5. visual and copy hierarchy contradict each other
  6. subheadline stronger than headline (inverted hierarchy)
  NEVER restate verdict, summary, or top issue. NEVER write generic observations about headline clarity.
  Good: "Ad-free differentiator buried in subheadline not headline"
  Bad: "The hero headline lacks a clear audience focus"

meta.description_suggestion: max 25 words. First-time visitor perspective. What the page is and who it's for.
meta.proof_suggestion: max 12 words. One specific trust element to add on THIS page (e.g. "Add customer logos below CTA").`;
}
