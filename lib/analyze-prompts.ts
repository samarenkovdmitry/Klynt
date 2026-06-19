import {
  buildAuditContextPromptBlock,
  type AudienceType,
  type TrafficSource,
} from "@/lib/audit-context";
import {
  buildBrandStagePromptBlock,
  buildCopyStudioPromptBlock,
  type BrandStage,
} from "@/lib/brand-stage";
import { buildAnalysisQualityPromptBlock } from "@/lib/report-findings-quality";
import type { PageComputedValues } from "@/lib/audit-report";

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

type ChecklistComputedValues = Pick<
  PageComputedValues,
  "social_proof_above_fold" | "cta_text" | "nav_link_labels" | "nav_link_count"
>;

function buildChecklistComputedContextBlock(cv: ChecklistComputedValues | null | undefined): string {
  if (!cv) {
    return `CHECKLIST COMPUTED CONTEXT (DOM-extracted):
- social_proof_above_fold: unknown (check screenshot)
- cta_text: unknown (check screenshot)
- nav_link_count: unknown (check screenshot)
- nav_link_labels: unknown (check screenshot)`;
  }

  const labelsStr =
    cv.nav_link_labels.length > 0
      ? `[${cv.nav_link_labels.map((l) => `"${l}"`).join(", ")}]`
      : "[]";

  return `CHECKLIST COMPUTED CONTEXT (DOM-extracted — use these values to avoid false gap flags):
- social_proof_above_fold: ${cv.social_proof_above_fold}
- cta_text: ${cv.cta_text ? `"${cv.cta_text}"` : "null"}
- nav_link_count: ${cv.nav_link_count}
- nav_link_labels: ${labelsStr}`;
}

const CHECKLIST_EVIDENCE_RULES = `RULES FOR CHECKLIST GAPS (mandatory — violations will be filtered server-side):
- Every gap (missing/weak) MUST include an evidence field: exact quote or specific element name from THIS page, minimum 15 characters. Gaps without evidence will be discarded.
- Every pass MUST include an evidence field: name the specific visible element that passes (e.g., "Product Hunt badge visible below CTA" or exact button label). Passes without evidence will be discarded.
- DO NOT flag "no trust signals" or "trust missing" if social_proof_above_fold is true — the page already has above-fold social proof.
- DO NOT flag "headline lacks audience clarity" if audienceType is B2B and the headline contains any role, industry, or use-case signal (even implicit).
- DO NOT flag "CTA unclear" if cta_text is NOT in VAGUE_CTA_PATTERN.
  VAGUE_CTA_PATTERN = ["Get Started", "Start Now", "Learn More", "Click Here", "Get Access", "Go", "Submit", "Register", "Continue", "Open", "Next"]
  If cta_text contains "free", "trial", a product name, or a specific outcome — it is NOT vague; do not flag.
- DO NOT flag "no navigation" or "nav missing" if nav_link_count > 0 or nav_link_labels is non-empty.
- A gallery of real product examples, a portfolio, or a work showcase counts as social proof — do not flag as "missing trust signals".
- Maximum 1 generic gap per report. All other gaps must reference a specific visible element from this page with evidence.`;

export function buildFullAuditPrompt(
  brandStage: BrandStage,
  trafficSource: TrafficSource,
  audienceType: AudienceType,
  options?: {
    skipCtaAudit?: boolean;
    computedValues?: ChecklistComputedValues | null;
  }
) {
  const skipCta = options?.skipCtaAudit ?? false;
  const checklistComputedContext = buildChecklistComputedContextBlock(options?.computedValues);
  const auditContextPrompt = buildAuditContextPromptBlock(trafficSource, audienceType);
  const brandStagePrompt = buildBrandStagePromptBlock(brandStage);
  const copyStudioPrompt = buildCopyStudioPromptBlock();
  const analysisQualityPrompt = buildAnalysisQualityPromptBlock();

  return `You are a senior SaaS UX auditor (clarity, conversion, positioning).

Analyze ONLY what is visible in the screenshot(s). Never invent UI. No generic advice — name the actual element/section.

${auditContextPrompt}

${brandStagePrompt}

${copyStudioPrompt}

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
      "evidence": "string — exact quote or specific visible element from the page (required, min 15 chars)",
      "status": "pass"|"missing"|"weak",
      "link_to": "copy-headline"|"copy-cta"|"copy-subheadline"|"trust"|"visual-fixes"|"structure-nav"|"hero-density"|null,
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
    "proof_suggestion": "string",
    "trust_notes": ["string"]
  },
  "visual_fixes": [
    {
      "dimension": "border_radius"|"density"|"color_tone"|"spacing"|"cta_hierarchy"|"typography"|"depth"|"navigation"|"social_proof",
      "observation": "string",
      "recommendation": "string"
    }
  ],
  "visual_passes": [
    {
      "dimension": "border_radius"|"density"|"color_tone"|"spacing"|"cta_hierarchy"|"typography"|"depth"|"navigation"|"social_proof",
      "note": "string"
    }
  ]
}

${checklistComputedContext}

${CHECKLIST_EVIDENCE_RULES}

checklist: 6-8 items. Gaps (missing/weak) first, pass items last. Max 3 missing + 1 weak, rest pass. Fewer real gaps is OK — never invent gaps to fill slots.

HERO INVENTORY (mandatory — decide internally before any gap or visual_fix):
  1) Hero theme: dark | light | mixed.
  2) Header nav: yes/no — if yes, name 2+ visible nav labels.
  3) Hero CTAs: count buttons above fold + exact labels (e.g. "Download for iOS", "Setup now").
  4) Trust above fold: list stats, logos, badges, press, Product Hunt, testimonials — or "none".
  5) Subhead: one line vs multi-paragraph essay; approximate word count feel.
Every gap and visual_fix MUST match this inventory. Do NOT contradict it.

CHECKLIST BY SCORE (must match breakdown-derived score):
- score MUST equal round((clarity + trust + friction + visuals) / 40, 1 decimal).
- breakdown scores must reflect actual visible strengths and weaknesses — vary all four values; never copy the same number into clarity/trust/friction/visuals.
- Use the full 0–10 score range based on what you see. Strong pages score 7–9; poor pages score 3–5; average pages score 5–7. Do NOT cluster scores in the 6–7 range by default.
- score < 5.0: page has fundamental clarity or trust failures — 3+ missing gaps expected.
- score 5.0–6.4: meaningful problems visible — include gaps that match the actual issues; do not invent gaps to hit a quota.
- score 6.5–7.4: mixed quality — some strong elements alongside real gaps; gaps must reflect actual visible problems.
- score >= 7.5: mark genuinely strong elements pass; 0-2 gaps is normal.
- weak typography (link_to visual-fixes) ONLY when subhead is visibly hard to read on its local background — omit when a dark hero uses intentional lighter subhead weight.
- copy-cta trial gap ONLY when the visible primary CTA text mentions trial/try/free/sign up — never for "Explore", "Browse", "Download", "Get started" alone.
- structure-nav missing ONLY when HERO INVENTORY confirms zero header nav links — never when pass items mention visible nav/menu.
- hero-density weak belongs in checklist (link_to hero-density), NOT as a pass item and NOT duplicated in visual_fixes spacing.
- If score is below 7.0, do NOT mark copy/trust elements as pass when they contributed to the low score.
- score_potential.chips MUST list one chip per copy/trust missing gap (same gap_label).
- id: slug like "headline-category" or "cta-trial". For copy items, id MUST match the link_to value ("copy-headline", "copy-cta", "copy-subheadline"). Typography weak → id "subheadline-clarity".
- gap_label: max 4 words, short badge for Copy studio ONLY. Examples: "Category missing", "Trial unclear", "Content weak", "Trust missing", "Weak typography". NEVER repeat checklist text or use ALL CAPS.
- text: max 10 words, specific actionable label. Must match label in score_potential chips for copy/trust gaps.
- link_to: copy gaps → "copy-headline"/"copy-cta"/"copy-subheadline"; trust gap → "trust"; typography weak → "visual-fixes"; no nav → "structure-nav"; hero essay subhead → "hero-density"; pass items → null.
- category: "copy" | "trust" | "visual" | "structure"
- NEVER create two gaps about the same root cause (e.g. two headline/category items). One gap per link_to.
- At most 1 weak typography item → link_to "visual-fixes", gap_label "Weak typography" — only when legibility is visibly poor on this screenshot.
- pass items text: must name a specific visible element on this page — NEVER write generic observations.
  Correct: "Two hero CTAs visible — Download for iOS and Continue on web"
  Correct: "Header nav shows Features, Blog, Try Demo"
  Correct: "Product Hunt badge visible below hero CTAs"
  Wrong:   "Hero image is visually appealing"
  Wrong:   "Strong visual but lacks clear messaging"
- NEVER mark an item missing/weak if its text describes something working (e.g. "Single CTA above fold" must be pass, not missing).
- NEVER claim CTA is below the fold when HERO INVENTORY lists hero button labels.
- NEVER claim trust missing when HERO INVENTORY lists stats, logos, badges, or Product Hunt.
- NEVER mark an item pass if its text describes a problem (lacks, unclear, missing, without, too light, too playful, cramped, reducing).
- NEVER use gap_label values like "Trial unclear", "Category missing", "CTA clarity", "Color tone mismatch", or "Spacing issue" on pass items — those belong in gaps or visual_fixes.
- NEVER put spacing, color tone, typography weight, or CTA hierarchy problems in checklist pass — put them in visual_fixes with the matching dimension.
- NEVER pass "Single CTA" if 2+ hero buttons are visible — use pass "Two hero CTAs visible" or visual_fixes.cta_hierarchy if they compete.
- TRUST CALIBRATION (mandatory):
  - Stats, usage counts, Product Hunt badge, press/Featured In logos, security audit badges above fold → do NOT use trust:missing.
  - trust:missing ONLY when hero shows zero credibility signals (no logos, no stats, no testimonials, no security badges).
  - If a usage stat or social-proof line exists but logos/testimonials are absent → omit the trust checklist gap; put logo/testimonial advice in meta.proof_suggestion only.
  - Never claim "no trust signals" when a visible usage stat or social-proof line is in the hero.

copy_variants:
- current: exact visible text from the page (empty string if not visible).
- NEVER write "No content available to assess", "Not visible", "N/A", or similar meta phrases in ANY field. If text is not readable, use empty string for current only — all other fields must contain real audit content from what IS visible.
- Follow all COPY STUDIO rules above for labels, word limits, and button register.
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
meta.proof_suggestion: max 12 words. One specific trust element to add on THIS page (e.g. "Add customer logos below CTA").
meta.trust_notes: 1-2 items, max 14 words each. Observations about missing proof or CTA reassurance — e.g. when CTA says "Try X" without free/trial clarity, note that it suggests risk without reassurance. Do not duplicate checklist trust gap text verbatim.

visual_fixes: 0-4 items. Surface/conversion design guidance — how CTAs, hierarchy, contrast, and trust placement read on screen. Headline rewrites belong in copy_variants, not here.

SURFACE AUDIT MINIMUM (mandatory — do not skip):
- ${skipCta ? "Skip cta_hierarchy — CTA has been pre-evaluated by the derive layer; do not emit a cta_hierarchy fix or pass." : "Always evaluate CTA TEXT AUDIT under cta_hierarchy using exact hero button labels from HERO INVENTORY."}
- Deliver at least 2 total insights across visual_fixes + visual_passes combined (fixes preferred when a real issue exists).
${skipCta ? "" : `- CTA TEXT AUDIT criteria for each hero button label: (1) specificity — "GET STARTED", "Start Free", "Try Free" are weak (no product or outcome); "Start your free website" is specific; (2) active verb + concrete outcome; (3) all-caps tone ("GET STARTED", "TRY FREE FOR 30 DAYS" — all caps → sentence case fix); (4) urgency fit when trial or limited offer is implied elsewhere on page.`}
- NAV COMPLEXITY: count visible nav links in the header. If 6+ links OR nav has no primary CTA button → output a "navigation" dimension fix. observation: name the exact link count or missing element. recommendation: max 18 words, specific to this page.
- SOCIAL PROOF FORMAT: if trust signals exist, identify format (logos | stats/numbers | testimonial quotes) and position (above fold | below fold). If strong social proof is above fold → social_proof pass. If missing or below fold → social_proof fix with format and position in recommendation. Never use "social_proof" dimension AND "depth" for the same observation.
- If the page is polished (score >= 7.5), still output concrete passes — never leave visual_fixes and visual_passes both empty.

STEP 0 — HERO THEME (use HERO INVENTORY theme):
  Classify hero background: dark | light | mixed.
  dark: near-black/navy hero with light text — lighter subheads are often intentional; do NOT flag typography unless illegible or same contrast as body copy.
  light: white/off-white hero — watch for low-contrast gray subheads and flat depth.
  mixed: split layout or photo overlay — judge contrast relative to the local background behind each text block.

STEP 1: Use BRAND STAGE + AUDIENCE + TRAFFIC context to infer who this product is for.
STEP 2: Pick dimensions with visible evidence on THIS screenshot:
  border_radius | density | color_tone | spacing | ${skipCta ? "" : "cta_hierarchy | "}typography | depth | navigation | social_proof
${skipCta ? "" : "Always include cta_hierarchy (CTA text audit or visual weight). "}Use navigation when nav link count or sticky CTA is an issue. Use social_proof for trust format and placement (not depth). Skip dimensions with no visible signal. Never repeat checklist gap text verbatim.

Each item MUST cite what you see on this page:
- dimension: one enum value above
- observation: max 14 words. Name visible UI (exact button labels, dark/light treatment, radius, spacing, fold placement). When PAGE COMPUTED VALUES are provided, cite exact hex/px from those fields; otherwise estimate from the screenshot.
- recommendation: max 18 words. Concrete change for THIS page (e.g. "Switch GET STARTED to sentence case — add a product-specific outcome" or "Darken subhead #9CA3AF → #4B5563").

BANNED templates (instant failure — never output these or close paraphrases):
- "Subheadline weight feels too light for emphasis" / "Increase subheadline weight for better readability"
- "Subheadline color blends into the background" / "Increase contrast on subheadline" without naming dark/light hero
- "Hero section has cramped elements" / "Elements feel cramped in the hero section"
- "Add more vertical spacing between headline and subheadline" / "Increase vertical spacing between headline and subheadline"
- Generic spacing/typography advice that ignores dark vs light background
- Fixes without naming a visible element on this screenshot

Good examples:
${skipCta ? "" : `- cta_hierarchy (text): "GET STARTED — all caps, no product or trial hint" → "Switch to sentence case and add a specific outcome — say what happens after click"
- cta_hierarchy (text): "'Start Free' — no product or outcome on button" → "Add a specific outcome — mention what happens after click"
- cta_hierarchy (weight): "Start for free and Download share equal pill weight on dark hero" → "Fill primary CTA, outline secondary Download for cold traffic"
`}- typography (light hero only): "Gray #9CA3AF subhead on white hero matches body copy" → "Darken subhead to #4B5563 and 18px for scan"
- navigation: "8 nav links in header — Features, Pricing, Blog, Docs, About, Contact, Login, Sign Up" → "Collapse to 4 core links + sticky CTA button for cold traffic focus"
- social_proof: "3 customer logos below fold — cold visitors scroll past before deciding" → "Move logos above fold directly under hero CTA"
- social_proof: "No logos, stats, or testimonials above fold" → "Add 3 logos or one usage stat directly under primary hero button"
- border_radius: "24px pill CTAs read consumer-playful for enterprise CRM" → "Tighten CTA radius to 8px for B2B tone"
- depth (light hero): "Flat white hero — no visual separation from page body" → "Add #F8F8F6 background tint to hero section"
- depth (dark hero): "Flat hero container — no depth cue separating card from background" → "Add 4px card shadow to hero container to increase perceived depth"

visual_passes: 1-4 items. REQUIRED when score >= 7.5 OR when fewer than 2 visual_fixes exist.
Dimensions you evaluated and found aligned with BRAND STAGE + AUDIENCE + hero theme.
- Use only dimensions NOT already in visual_fixes (no overlap).
- note: max 12 words. Concrete evidence — not compliments. Name button labels, counts, or placement.
  Good: "Single primary CTA above fold — no competing hero buttons"
  Good: "Start your free trial — specific verb and outcome on primary button"
  Bad: "Hero section has clear CTAs and well-structured content"
- Do NOT repeat checklist pass items (footer links, nav labels) unless noting visual hierarchy.
- Never write vague praise; each pass must state one observable fact.`;
}
