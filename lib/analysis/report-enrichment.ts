import type { CopyVariant as NarrativeCopyVariant } from "@/lib/analysis/narrative";
import type { Finding } from "@/lib/analysis/narrative";
import type {
  ExtractionResult,
  PageMetaSnapshot,
  StoredExtraction,
} from "@/lib/analysis/extraction";
import type {
  AudienceType,
  AuditReport,
  BrandStage,
  CopyVariantBlock,
  PageComputedValues,
  ReportChecklistItem,
  ReportCopyVariants,
  ReportMeta,
  ReportVisualFix,
  TrafficSource,
} from "@/lib/audit-report";
import {
  normalizeVisualDimension,
  normalizeVisualSection,
  type NormalizedVisualSection,
} from "@/lib/report-visual-fixes";

export function splitStoredExtraction(raw: StoredExtraction) {
  const {
    previewImage,
    viewport_width,
    computed_values,
    page_meta,
    ...extraction
  } = raw;

  return {
    extraction: extraction as ExtractionResult,
    previewImage,
    viewport_width,
    computed_values: computed_values ?? null,
    page_meta,
  };
}

export function applyDomGroundTruth(
  extraction: ExtractionResult,
  computedValues?: PageComputedValues | null,
  pageMeta?: PageMetaSnapshot
): ExtractionResult {
  const next: ExtractionResult = { ...extraction, primaryCta: { ...extraction.primaryCta } };

  if (computedValues?.h1_text?.trim()) {
    next.headline = computedValues.h1_text.trim();
  }

  if (computedValues?.sub_text?.trim()) {
    next.subheadline = computedValues.sub_text.trim();
  }

  if (computedValues?.cta_text?.trim()) {
    next.primaryCta.text = computedValues.cta_text.trim();
    next.primaryCta.aboveFold = true;
  }

  if (computedValues) {
    next.socialProofAboveFold = computedValues.social_proof_above_fold;
  }

  if (pageMeta) {
    next.hasMobileViewport = pageMeta.hasMobileViewportMeta;
  }

  return next;
}

export function filterFalseFindings(
  findings: Finding[],
  pageMeta?: PageMetaSnapshot,
  computedValues?: PageComputedValues | null
): Finding[] {
  return findings.filter((finding) => {
    const haystack = `${finding.title} ${finding.body} ${finding.evidence}`.toLowerCase();

    if (pageMeta?.title?.trim() && /empty meta|no seo positioning|meta title.*empty|missing meta title/i.test(haystack)) {
      return false;
    }

    if (pageMeta?.description?.trim() && /empty meta description|missing meta description/i.test(haystack)) {
      return false;
    }

    if (
      computedValues &&
      /1280px viewport|mobile layout likely broken|viewport.*mobile/i.test(haystack)
    ) {
      return false;
    }

    if (/load time data missing|performance unverified|load time.*missing/i.test(haystack)) {
      return false;
    }

    return true;
  });
}

function toCopyBlock(items: NarrativeCopyVariant[]): CopyVariantBlock {
  const variants = items.map((v) => ({
    label: v.label,
    text: v.after_text,
    rationale: v.rationale,
    strategy: v.strategy,
    recommended: v.recommended,
  }));

  const recommendedCount = variants.filter((v) => v.recommended).length;
  if (variants.length > 0 && recommendedCount !== 1) {
    variants.forEach((v, i) => {
      v.recommended = i === 0;
    });
  }

  return {
    current: items[0]?.before_text ?? "",
    variants,
  };
}

function hasCopyBlockContent(block?: CopyVariantBlock): boolean {
  if (!block) return false;
  return Boolean(block.current?.trim() || block.variants.some((v) => v.text?.trim()));
}

function backfillCopyBlock(
  block: CopyVariantBlock,
  currentText: string,
  rawVariants: NarrativeCopyVariant[],
  fallbackAfter?: string
): CopyVariantBlock {
  if (hasCopyBlockContent(block)) {
    return block;
  }

  const current = currentText.trim();
  if (!current) {
    return block;
  }

  const narrativeVariants = rawVariants.filter((v) => v.after_text?.trim());
  if (narrativeVariants.length > 0) {
    return toCopyBlock(
      narrativeVariants.map((v, i) => ({
        ...v,
        before_text: v.before_text?.trim() || current,
        recommended: i === 0 ? true : v.recommended,
      }))
    );
  }

  const after = fallbackAfter?.trim();
  if (!after || after.toLowerCase() === current.toLowerCase()) {
    return { current, variants: [] };
  }

  return {
    current,
    variants: [
      {
        label: "Value prop",
        text: after,
        rationale: "Clarifies the product outcome for first-time visitors.",
        strategy: "outcome_led",
        recommended: true,
      },
    ],
  };
}

export function enrichCopyVariants(
  variants: ReportCopyVariants | null | undefined,
  extraction: ExtractionResult,
  raw: NarrativeCopyVariant[],
  meta?: Pick<ReportMeta, "description_suggestion">
): ReportCopyVariants {
  const bySection = Object.fromEntries(
    ["headline", "cta", "subheadline"].map((section) => [
      section,
      raw.filter((v) => v.section === section),
    ])
  ) as Record<string, NarrativeCopyVariant[]>;

  const base: ReportCopyVariants = variants ?? {
    headline: toCopyBlock(bySection.headline ?? []),
    cta: toCopyBlock(bySection.cta ?? []),
    subheadline: toCopyBlock(bySection.subheadline ?? []),
  };

  return {
    headline: backfillCopyBlock(
      base.headline,
      extraction.headline,
      bySection.headline ?? []
    ),
    subheadline: backfillCopyBlock(
      base.subheadline,
      extraction.subheadline,
      bySection.subheadline ?? [],
      meta?.description_suggestion
    ),
    cta: backfillCopyBlock(
      base.cta,
      extraction.primaryCta.text,
      bySection.cta ?? []
    ),
  };
}

export function mapNarrativeVisualFixes(
  raw: Array<{
    category: string;
    observation: string;
    fix: string;
    impact?: "high" | "medium" | "low";
    element?: string;
  }>
): ReportVisualFix[] {
  return raw.flatMap((fix) => {
    const dimension = normalizeVisualDimension(fix.category);
    if (!dimension) {
      return [];
    }

    return [
      {
        dimension,
        observation: fix.observation,
        recommendation: fix.fix,
        impact: fix.impact,
        element: fix.element,
      },
    ];
  });
}

export function buildReportVisualSection(
  fixesRaw: ReportVisualFix[],
  checklist: ReportChecklistItem[],
  options: {
    score: number;
    copyVariants?: ReportCopyVariants;
    meta?: ReportMeta;
    computedValues?: PageComputedValues | null;
    audienceType?: AudienceType;
    trafficSource?: TrafficSource;
  }
): NormalizedVisualSection {
  return normalizeVisualSection(
    fixesRaw,
    undefined,
    checklist,
    undefined,
    options.score,
    checklist,
    undefined,
    {
      checklist,
      copyVariants: options.copyVariants,
      meta: options.meta,
      computedValues: options.computedValues,
      audienceType: options.audienceType,
      trafficSource: options.trafficSource,
    }
  );
}

export type NarrativeAssemblyInput = {
  extraction: ExtractionResult;
  stored: ReturnType<typeof splitStoredExtraction>;
  narrative: import("@/lib/analysis/narrative").NarrativeResult;
  rawCopyVariants: NarrativeCopyVariant[];
  brandStage?: BrandStage;
  trafficSource?: TrafficSource;
  audienceType?: AudienceType;
};

export function assembleReportVisuals(
  input: NarrativeAssemblyInput,
  checklist: ReportChecklistItem[],
  copyVariants: ReportCopyVariants,
  meta: AuditReport["meta"]
) {
  const score = Math.max(0, Math.min(10, input.narrative.hero.score / 10));
  const llmFixes = mapNarrativeVisualFixes(input.narrative.visual_fixes ?? []);

  return buildReportVisualSection(llmFixes, checklist, {
    score,
    copyVariants,
    meta,
    computedValues: input.stored.computed_values,
    audienceType: input.audienceType,
    trafficSource: input.trafficSource,
  });
}
