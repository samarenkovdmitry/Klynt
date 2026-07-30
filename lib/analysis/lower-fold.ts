import { callLLMWithImage } from "@/lib/models/client";
import { extractJsonFromLlmText } from "./parse-llm-json";

export type LowerFoldSnapshot = {
  sections_visible: string[];
  pricing_section: boolean;
  testimonial_section: boolean;
  faq_section: boolean;
  footer_cta: boolean;
  form_fields_estimate: number;
  observation: string;
};

const LOWER_FOLD_SYSTEM = `You analyze a below-the-fold screenshot of a landing page.
Output ONLY valid JSON. No markdown fences.

Return:
{
  "sections_visible": string[],
  "pricing_section": boolean,
  "testimonial_section": boolean,
  "faq_section": boolean,
  "footer_cta": boolean,
  "form_fields_estimate": number,
  "observation": string
}

Rules:
- sections_visible: short labels only (e.g. "pricing", "testimonials", "features grid", "faq", "footer").
- booleans: true only when clearly visible in THIS screenshot crop.
- form_fields_estimate: count visible input fields (0 if none).
- observation: one sentence, max 20 words, naming the most conversion-relevant below-fold element.`;

export async function extractLowerFoldSnapshot(
  lowerScreenshotBase64: string
): Promise<LowerFoldSnapshot> {
  const { text } = await callLLMWithImage({
    role: "extraction",
    systemPrompt: LOWER_FOLD_SYSTEM,
    userPrompt:
      "Describe below-the-fold conversion elements visible in this screenshot crop.",
    imageBase64: lowerScreenshotBase64,
    maxTokens: 512,
    cacheSystem: true,
  });

  const parsed = extractJsonFromLlmText(text) as Partial<LowerFoldSnapshot>;

  return {
    sections_visible: Array.isArray(parsed.sections_visible)
      ? parsed.sections_visible.filter((s): s is string => typeof s === "string").slice(0, 8)
      : [],
    pricing_section: Boolean(parsed.pricing_section),
    testimonial_section: Boolean(parsed.testimonial_section),
    faq_section: Boolean(parsed.faq_section),
    footer_cta: Boolean(parsed.footer_cta),
    form_fields_estimate:
      typeof parsed.form_fields_estimate === "number"
        ? Math.max(0, Math.min(20, Math.round(parsed.form_fields_estimate)))
        : 0,
    observation:
      parsed.observation?.trim() ||
      "Below-the-fold content was captured but no standout conversion block was identified.",
  };
}

export function applyLowerFoldGroundTruth(
  extraction: import("./extraction").ExtractionResult,
  lowerFold: LowerFoldSnapshot
): import("./extraction").ExtractionResult {
  const next = { ...extraction };

  if (lowerFold.pricing_section) {
    next.pricingVisible = true;
    if (!next.pricingAboveFold) {
      next.pricingAboveFold = false;
    }
  }

  if (lowerFold.testimonial_section && !next.socialProofAboveFold) {
    const types = new Set(next.socialProofTypes);
    types.delete("none");
    types.add("testimonials");
    next.socialProofTypes = [...types];
    next.socialProofAboveFold = false;
  }

  if (lowerFold.form_fields_estimate > next.formFieldCount) {
    next.formFieldCount = lowerFold.form_fields_estimate;
    next.emailOnlySignup = lowerFold.form_fields_estimate <= 1;
  }

  if (lowerFold.pricing_section || lowerFold.testimonial_section || lowerFold.footer_cta) {
    const issueTypes = new Set(next.issues.map((i) => i.element));
    if (lowerFold.pricing_section && !next.pricingAboveFold && !issueTypes.has("Pricing section")) {
      next.issues = [
        ...next.issues,
        {
          type: "friction",
          severity: "medium",
          element: "Pricing section",
          observation: "Pricing appears below the fold — visitors must scroll to compare plans.",
        },
      ];
    }
  }

  return next;
}
