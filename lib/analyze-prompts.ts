import {
  buildAuditContextPromptBlock,
  type AudienceType,
  type TrafficSource,
} from "@/lib/audit-context";
import {
  buildBrandStagePromptBlock,
  buildHeadlineDirectionsSchemaSnippet,
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
- metric_observations: each field must name a specific visible element, not describe the metric category in general terms.

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
  "metric_observations": {
    "trust": "string",
    "clarity": "string",
    "friction": "string",
    "overall": "string"
  },
  "breakdown": { "clarity": int, "navigation": int, "visuals": int, "trust": int, "conversion": int }
}

Lengths: summary 14-22 words; verdict 6-10 words; key_observation max 14 words.

Hero copy — three distinct layers. Never paraphrase one layer as another:
- verdict: auditor diagnosis in 6-10 words.
- summary: visitor first-impression in 14-22 words.
- key_observation: one non-obvious insight in max 14 words.

confidence: integer 70-98. breakdown: integers 0-100 where higher = stronger.
metric_observations: expert UX consultant observations (NOT metric labels). Each field 12-16 words.`;
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
  "score": number,
  "risk": "low"|"medium"|"high",
  "summary": "string",
  "verdict": "string",
  "key_observation": "string",
  "confidence": number,
  ${buildHeadlineDirectionsSchemaSnippet()}
  "metric_observations": {
    "trust": "string",
    "clarity": "string",
    "friction": "string",
    "overall": "string"
  },
  "issues": [{
    "severity": "critical"|"warning"|"minor",
    "category": "hero"|"copy"|"trust"|"cta"|"visual"|"friction",
    "title": "string — max 12 words, must quote or name a specific element",
    "fix": "string — one concrete action, max 15 words, starts with verb"
  }],
  "suggestions": [{
    "section": "string",
    "action": "string — starts with verb, max 10 words"
  }],
  "copy": [{
    "section": "string",
    "before": "exact visible text",
    "after": "rewrite, max 20 words"
  }],
  "breakdown": { "clarity": int, "navigation": int, "visuals": int, "trust": int, "conversion": int }
}

Counts: exactly 4 issues, 3 suggestions, 3 copy (different sections).
Lengths: summary 14-22 words; verdict 6-10 words; key_observation max 14 words.

Hero copy — three distinct layers. Never paraphrase one layer as another:
- verdict: auditor diagnosis in 6-10 words. Name the main UX or conversion problem on THIS page.
  Good: "Hero headline hides who the product is for."
  Bad: "Messaging clarity issues"
- summary: visitor first-impression in 14-22 words. Describe what a new visitor likely feels, misunderstands, or fails to decide. Empathy and behavior, not a restated diagnosis.
  Good: "New visitors likely pause because the hero never names the audience or immediate payoff."
  Bad: repeating the verdict with different wording
- key_observation: one non-obvious insight in max 14 words. A second-angle finding (trust gap, expectation mismatch, hierarchy surprise) that is NOT the same point as verdict or summary.
  Good: "Trust badges appear before the value prop, which can feel like marketing noise."
  Bad: another headline-clarity sentence

issues[].title: max 12 words. Must quote visible text or name a specific element. NEVER use abstract labels ("Weak visual hierarchy", "Low clarity", "CTA gap").
Good title: "Hero headline 'Work smarter' never says who the product is for."
Bad title: "Weak visual hierarchy"
issues[].fix: one concrete action, max 15 words, starts with a verb (Replace, Add, Move, Remove, Rewrite).
issues[].severity: "critical" = visitor likely leaves; "warning" = friction or confusion; "minor" = polish.
suggestions[].action: starts with a verb, max 10 words. Never restate the issue title.
copy[].before: exact visible text from the page. copy[].after: clearer rewrite, max 20 words.
confidence: integer 70-98. breakdown: integers 0-100 where higher = stronger (70+ strong, 40-69 at risk, below 40 critical). score: integer 0-100 aligned with breakdown average.
metric_observations: expert UX consultant observations (NOT metric labels). Each field 12-16 words.
- Do NOT repeat category names (Trust, Clarity, Friction, Overall) or the word "metric".
- Describe likely user perception and behavioral impact, like a consultant briefing a team.
- trust: what users likely feel about credibility and professionalism.
- clarity: what users likely understand about value and the next step.
- friction: how much competing UI or copy may slow first-pass understanding.
- overall: holistic read of the page experience; do not repeat verdict verbatim.
Copy: improve clarity (what/who/outcome), not hype. Preserve brand tone.`;
}
