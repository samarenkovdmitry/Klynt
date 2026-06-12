import type { BrandStage, ReportCopyVariants } from "@/lib/audit-report";
import {
  COPY_VARIANT_WORD_LIMITS,
  DEFAULT_BRAND_STAGE,
  normalizeCtaOptionLabel,
  normalizeHeadlineOptionLabel,
  normalizeSubheadlineOptionLabel,
} from "@/lib/brand-stage";
import { clampWords } from "@/lib/report-copy-limits";
import { sanitizeLlmVisibleText } from "@/lib/llm-placeholder-text";

const COPY_VARIANT_KEYS = ["headline", "cta", "subheadline"] as const;

const VARIANT_WORD_LIMITS: Record<(typeof COPY_VARIANT_KEYS)[number], number> = {
  headline: COPY_VARIANT_WORD_LIMITS.headline,
  cta: COPY_VARIANT_WORD_LIMITS.cta,
  subheadline: COPY_VARIANT_WORD_LIMITS.subheadline,
};

function normalizeVariantLabel(
  key: (typeof COPY_VARIANT_KEYS)[number],
  label: string,
  index: number,
  brandStage: BrandStage
) {
  if (key === "headline") {
    return normalizeHeadlineOptionLabel(label, index, brandStage);
  }

  if (key === "cta") {
    return normalizeCtaOptionLabel(label, index);
  }

  return normalizeSubheadlineOptionLabel(label, index);
}

export function normalizeReportCopyVariants(
  copyVariants: ReportCopyVariants | undefined,
  brandStage: BrandStage = DEFAULT_BRAND_STAGE
): ReportCopyVariants | undefined {
  if (!copyVariants || typeof copyVariants !== "object") {
    return copyVariants;
  }

  const normalized = { ...copyVariants };

  for (const key of COPY_VARIANT_KEYS) {
    const block = normalized[key];
    if (!block || typeof block !== "object") {
      continue;
    }

    normalized[key] = {
      ...block,
      current: sanitizeLlmVisibleText(block.current),
      variants: Array.isArray(block.variants)
        ? block.variants.slice(0, 3).map((variant, index) => ({
            ...variant,
            label: normalizeVariantLabel(
              key,
              typeof variant.label === "string"
                ? variant.label.replace(/^Option [A-Z] — /i, "").trim()
                : "",
              index,
              brandStage
            ),
            text: clampWords(
              sanitizeLlmVisibleText(variant.text),
              VARIANT_WORD_LIMITS[key],
              key !== "cta"
            ),
          }))
        : block.variants,
    };
  }

  return normalized;
}
