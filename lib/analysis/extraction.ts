import { callLLM, callLLMWithImage } from "../models/client";
import { cropHeroScreenshotBase64 } from "@/lib/report-preview";

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

export type PageMetaSnapshot = {
  title: string;
  description: string;
  hasMobileViewportMeta: boolean;
};

export type StoredExtraction = ExtractionResult & {
  viewport_width?: number;
  previewImage?: string;
  computed_values?: import("@/lib/audit-report").PageComputedValues | null;
  page_meta?: PageMetaSnapshot;
};

const EXTRACTION_SYSTEM = `You are a structured data extractor for landing page analysis.
Output ONLY valid JSON matching the schema. No markdown fences, no commentary.
Rules:
- Be factual and terse. No opinions.
- "element" must name the actual HTML element (e.g. "H1 headline", "hero CTA button").
- "observation" is one factual sentence, not advice.
- Null for unknown values.
- hasMobileViewport means the page HTML includes <meta name="viewport" content="width=device-width"> — NOT the browser capture width.
- If META.title or META.description are non-empty, do NOT report missing/empty meta tags.
- Do NOT treat a desktop capture width (e.g. 1280px) as a mobile viewport misconfiguration.
- If loadTimeMs is 0, omit performance issues about load time.

Schema: { "headline": string, "subheadline": string, "valuePropositionClear": boolean, "targetAudienceMentioned": boolean, "primaryCta": { "text": string, "aboveFold": boolean, "specificity": "generic"|"specific"|"none" }, "ctaCount": number, "socialProofAboveFold": boolean, "socialProofTypes": array, "trustedByCount": number, "formFieldCount": number, "emailOnlySignup": boolean, "pricingVisible": boolean, "pricingAboveFold": boolean, "loadTimeMs": number, "hasMobileViewport": boolean, "issues": [{ "type": string, "severity": string, "element": string, "observation": string }] }`;

const VISION_EXTRACTION_SYSTEM = `${EXTRACTION_SYSTEM}

You are analyzing a screenshot of a landing page (hero / above-the-fold region).
Read visible text, CTAs, logos, forms, and trust signals directly from the image.
If the screenshot shows a full-page capture, focus on the top portion visible in the image.`;

function parseExtractionJson(text: string): ExtractionResult {
  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    throw new Error(`Extraction parse failed: ${text.slice(0, 200)}`);
  }
}

function shouldUseVisionExtraction(page: PageData): boolean {
  const hasScreenshot = Boolean(page.screenshot?.trim());
  const hasText = Boolean(page.html?.trim());
  const hasPuppeteer = Boolean(
    page.puppeteerExtracted.headlineText?.trim() ||
      page.puppeteerExtracted.subheadlineText?.trim() ||
      page.puppeteerExtracted.ctaText.some((cta) => cta.trim())
  );

  return hasScreenshot && !hasText && !hasPuppeteer;
}

export function isExtractionEmpty(extraction: ExtractionResult): boolean {
  const headline = extraction.headline?.trim() ?? "";
  const subheadline = extraction.subheadline?.trim() ?? "";
  const cta = extraction.primaryCta?.text?.trim() ?? "";

  return !headline && !subheadline && !cta;
}

async function extractPageDataFromScreenshot(page: PageData) {
  const heroBase64 = await cropHeroScreenshotBase64(page.screenshot);
  const urlLine = page.url?.trim() ? `URL (if known): ${page.url}` : "URL: unknown (screenshot upload)";

  const userPrompt = `${urlLine}

Analyze the screenshot and extract landing page signals from the visible hero / above-the-fold content.
META:\n${JSON.stringify(page.meta, null, 2)}`;

  const { text, usage } = await callLLMWithImage({
    role: "extraction",
    systemPrompt: VISION_EXTRACTION_SYSTEM,
    userPrompt,
    imageBase64: heroBase64,
    imageMediaType: "image/jpeg",
    maxTokens: 900,
    cacheSystem: true,
  });

  const result = parseExtractionJson(text);
  result.hasMobileViewport = page.puppeteerExtracted.mobileViewportWidth > 0;

  return { result, usage };
}

async function extractPageDataFromText(page: PageData) {
  const userPrompt = `URL: ${page.url}\n\nPUPPETEER:\n${JSON.stringify(page.puppeteerExtracted, null, 2)}\n\nMETA:\n${JSON.stringify(page.meta, null, 2)}\n\nPAGE TEXT:\n${page.html.slice(0, 8000)}`;

  const { text, usage } = await callLLM({
    role: "extraction",
    systemPrompt: EXTRACTION_SYSTEM,
    userPrompt,
    maxTokens: 800,
    cacheSystem: true,
  });

  const result = parseExtractionJson(text);

  // Override with puppeteer ground-truth (more reliable than LLM)
  result.socialProofAboveFold = page.puppeteerExtracted.socialProofAboveFold;
  result.loadTimeMs = page.puppeteerExtracted.loadTimeMs;
  result.hasMobileViewport = page.puppeteerExtracted.mobileViewportWidth > 0;

  return { result, usage };
}

export async function extractPageData(page: PageData) {
  if (shouldUseVisionExtraction(page)) {
    return extractPageDataFromScreenshot(page);
  }

  return extractPageDataFromText(page);
}
