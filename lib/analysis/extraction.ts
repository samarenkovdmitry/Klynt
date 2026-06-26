import { callLLM } from "../models/client";

export interface PageData {
  url: string;
  html: string;
  screenshot: string;
  meta: { title: string; description: string; ogImage?: string };
  puppeteerExtracted: {
    ctaText: string[];
    headlineText: string;
    subheadlineText: string;
    socialProofAboveFold: boolean;
    loadTimeMs: number;
    mobileViewportWidth: number;
  };
}

export interface ExtractionResult {
  headline: string;
  subheadline: string;
  valuePropositionClear: boolean;
  targetAudienceMentioned: boolean;
  primaryCta: { text: string; aboveFold: boolean; specificity: "generic" | "specific" | "none" };
  ctaCount: number;
  socialProofAboveFold: boolean;
  socialProofTypes: Array<"logos" | "testimonials" | "numbers" | "badges" | "none">;
  trustedByCount: number;
  formFieldCount: number;
  emailOnlySignup: boolean;
  pricingVisible: boolean;
  pricingAboveFold: boolean;
  loadTimeMs: number;
  hasMobileViewport: boolean;
  issues: Array<{
    type: "clarity" | "cta" | "trust" | "friction" | "performance";
    severity: "high" | "medium" | "low";
    element: string;
    observation: string;
  }>;
}

const EXTRACTION_SYSTEM = `You are a structured data extractor for landing page analysis.
Output ONLY valid JSON matching the schema. No markdown fences, no commentary.
Rules:
- Be factual and terse. No opinions.
- "element" must name the actual HTML element (e.g. "H1 headline", "hero CTA button").
- "observation" is one factual sentence, not advice.
- Null for unknown values.

Schema: { "headline": string, "subheadline": string, "valuePropositionClear": boolean, "targetAudienceMentioned": boolean, "primaryCta": { "text": string, "aboveFold": boolean, "specificity": "generic"|"specific"|"none" }, "ctaCount": number, "socialProofAboveFold": boolean, "socialProofTypes": array, "trustedByCount": number, "formFieldCount": number, "emailOnlySignup": boolean, "pricingVisible": boolean, "pricingAboveFold": boolean, "loadTimeMs": number, "hasMobileViewport": boolean, "issues": [{ "type": string, "severity": string, "element": string, "observation": string }] }`;

export async function extractPageData(page: PageData) {
  const userPrompt = `URL: ${page.url}\n\nPUPPETEER:\n${JSON.stringify(page.puppeteerExtracted, null, 2)}\n\nMETA:\n${JSON.stringify(page.meta, null, 2)}\n\nPAGE TEXT:\n${page.html.slice(0, 8000)}`;

  const { text, usage } = await callLLM({
    role: "extraction",
    systemPrompt: EXTRACTION_SYSTEM,
    userPrompt,
    maxTokens: 800,
    cacheSystem: true,
  });

  let result: ExtractionResult;
  try {
    result = JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    throw new Error(`Extraction parse failed: ${text.slice(0, 200)}`);
  }

  // Override with puppeteer ground-truth (more reliable than LLM)
  result.socialProofAboveFold = page.puppeteerExtracted.socialProofAboveFold;
  result.loadTimeMs = page.puppeteerExtracted.loadTimeMs;
  result.hasMobileViewport = page.puppeteerExtracted.mobileViewportWidth > 0;

  return { result, usage };
}
