import { extractPageData, type PageData, type ExtractionResult } from "./extraction";
import { generateNarrative, type NarrativeResult } from "./narrative";

export type { PageData, ExtractionResult, NarrativeResult };

export interface AnalysisResult {
  url: string;
  extraction: ExtractionResult;
  narrative: NarrativeResult;
  meta: {
    extractionModel: string;
    narrativeModel: string;
    totalCostUsd: number;
    durationMs: number;
    extractionUsage: object;
    narrativeUsage: object;
  };
}

function getMockResult(url: string): AnalysisResult {
  return {
    url,
    extraction: {
      headline: "The Newsletter Platform Built for Creators",
      subheadline: "Start your free newsletter today",
      valuePropositionClear: false,
      targetAudienceMentioned: false,
      primaryCta: { text: "Get Started", aboveFold: true, specificity: "generic" },
      ctaCount: 3,
      socialProofAboveFold: false,
      socialProofTypes: ["logos"],
      trustedByCount: 4,
      formFieldCount: 1,
      emailOnlySignup: true,
      pricingVisible: true,
      pricingAboveFold: false,
      loadTimeMs: 2100,
      hasMobileViewport: true,
      issues: [
        { type: "clarity", severity: "high", element: "H1 headline", observation: "Headline does not specify who the platform is for or what outcome it delivers." },
        { type: "trust", severity: "medium", element: "Hero section", observation: "No social proof appears in the first viewport." },
        { type: "cta", severity: "medium", element: "Hero CTA button", observation: 'Primary CTA reads "Get Started" with no specificity about what happens next.' },
      ],
    },
    narrative: {
      hero: {
        format: "D_textual",
        headline: "Visitors don't know who this is for",
        subheadline: "Your headline skips the outcome — and users bounce",
        score: 61,
        scorePotential: 79,
        lift: 18,
        topIssue: { type: "clarity", severity: "high", element: "H1 headline", title: "Headline is category, not promise", body: 'Your H1 reads "The Newsletter Platform Built for Creators" — it names a category, not an outcome. Visitors can\'t instantly answer "will this work for me?" and leave.', fix: 'Replace with an outcome headline: "Grow your newsletter to 10k subscribers without a dev team."', evidence: '"Built for Creators" — no outcome stated', why_it_matters_here: "A visitor scanning the H1 can't tell if this fits their situation, so they leave without reading further.", reasoning_chain: { sees: '"The Newsletter Platform Built for Creators" as the H1', infers: "This describes a category, not a result for me", decides: "Leaves without scrolling further" }, drag_score: 82 },
      },
      findings: [
        { type: "clarity", severity: "high", element: "H1 headline", title: "Headline is category, not promise", body: 'Your H1 reads "The Newsletter Platform Built for Creators" — it names a category, not an outcome.', fix: 'Rewrite to lead with a specific outcome: "Grow your newsletter to 10k subscribers without a dev team."', evidence: '"Built for Creators" — no outcome stated', why_it_matters_here: "A visitor scanning the H1 can't tell if this fits their situation, so they leave without reading further.", reasoning_chain: { sees: '"The Newsletter Platform Built for Creators" as the H1', infers: "This describes a category, not a result for me", decides: "Leaves without scrolling further" }, drag_score: 82 },
        { type: "trust", severity: "medium", element: "Hero section", title: "Social proof buried below fold", body: "Logos appear below the fold, meaning 60%+ of visitors leave before seeing them.", fix: "Move one testimonial or a subscriber count stat directly below the subheadline.", evidence: "4 logos, all below fold", why_it_matters_here: "A skeptical visitor sees no proof before deciding, so they doubt the product actually works.", reasoning_chain: { sees: "No logos or testimonials in the first viewport", infers: "Nobody notable seems to use this", decides: "Hesitates and looks for validation elsewhere" }, drag_score: 55 },
        { type: "cta", severity: "medium", element: "Hero CTA button", title: 'CTA "Get Started" signals nothing', body: '"Get Started" carries zero specificity — visitors don\'t know if they\'re signing up or booking a demo.', fix: 'Change to "Start your free newsletter →" to set expectations.', evidence: '"Get Started" — no outcome stated', why_it_matters_here: "A visitor unsure what \"Get Started\" commits them to hesitates instead of clicking.", reasoning_chain: { sees: '"Get Started" button with no outcome or commitment stated', infers: "Unclear what happens after clicking", decides: "Hesitates instead of clicking through" }, drag_score: 60 },
      ],
      summary: "The landing page loses visitors in the first 5 seconds because the headline names a category instead of delivering a promise. Fixing headline clarity and moving social proof above the fold would lift conversion by an estimated 18 points.",
      quickWins: [
        { text: "Rewrite H1 to lead with subscriber growth outcome", delta: 1.2 },
        { text: "Move logo strip or testimonial above the fold", delta: 0.8 },
        { text: 'Change CTA from "Get Started" to "Start your free newsletter →"', delta: 0.6 },
      ],
      copy_variants: [],
      visual_fixes: [],
    },
    meta: { extractionModel: "mock", narrativeModel: "mock", totalCostUsd: 0, durationMs: 0, extractionUsage: {}, narrativeUsage: {} },
  };
}

export async function runAnalysisPipeline(page: PageData): Promise<AnalysisResult> {
  if (process.env.USE_MOCK_REPORT === "true") {
    console.log("[pipeline] Mock mode");
    return getMockResult(page.url);
  }

  const start = Date.now();
  console.log(`[pipeline] Starting: ${page.url}`);

  const { result: extraction, usage: extractionUsage } = await extractPageData(page);
  console.log(`[pipeline] Extraction: ${extraction.issues.length} issues, $${extractionUsage.estimatedCostUsd.toFixed(5)}`);

  const { result: narrative, usage: narrativeUsage } = await generateNarrative(extraction, page.url);
  console.log(`[pipeline] Narrative: score ${narrative.hero.score}, $${narrativeUsage.estimatedCostUsd.toFixed(5)}`);
  console.log('[narrative] visual_fixes:', narrative.visual_fixes?.length, JSON.stringify(narrative.visual_fixes?.slice(0,1)));
  console.log('[narrative] copy_variants:', narrative.copy_variants?.length);

  const totalCostUsd = extractionUsage.estimatedCostUsd + narrativeUsage.estimatedCostUsd;
  console.log(`[pipeline] Done in ${Date.now() - start}ms | $${totalCostUsd.toFixed(5)}`);

  return {
    url: page.url,
    extraction,
    narrative,
    meta: {
      extractionModel: process.env.EXTRACTION_MODEL ?? "claude-haiku-4-5-20251001",
      narrativeModel: process.env.NARRATIVE_MODEL ?? "claude-sonnet-4-6",
      totalCostUsd,
      durationMs: Date.now() - start,
      extractionUsage,
      narrativeUsage,
    },
  };
}
