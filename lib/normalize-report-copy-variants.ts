import type { ReportCopyVariants } from "@/lib/audit-report";
import { sanitizeLlmVisibleText } from "@/lib/llm-placeholder-text";

const COPY_VARIANT_KEYS = ["headline", "cta", "subheadline"] as const;

export function normalizeReportCopyVariants(
  copyVariants: ReportCopyVariants | undefined
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
        ? block.variants.map((variant) => ({
            ...variant,
            label:
              typeof variant.label === "string"
                ? variant.label.replace(/^Option [A-Z] — /i, "").trim()
                : variant.label,
            text: sanitizeLlmVisibleText(variant.text),
          }))
        : block.variants,
    };
  }

  return normalized;
}
