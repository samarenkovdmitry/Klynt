import { NextResponse } from "next/server";

import {
  applyLowerFoldGroundTruth,
  extractLowerFoldSnapshot,
  type LowerFoldSnapshot,
} from "@/lib/analysis/lower-fold";
import {
  buildCompetitorComparison,
  competitorComparisonToChecklistItems,
  deriveScoreFromSignals,
} from "@/lib/analysis/competitor-comparison";
import {
  benchmarkToChecklistItems,
  computeReportBenchmark,
} from "@/lib/benchmark/report-benchmark";
import { generateNarrative, resolveHeroScreenshotBase64 } from "@/lib/analysis/narrative";
import type { StoredExtraction } from "@/lib/analysis/extraction";
import type { CopyVariant as NarrativeCopyVariant } from "@/lib/analysis/narrative";
import type { Finding } from "@/lib/analysis/narrative";
import type { PageContextInput } from "@/lib/analysis/narrative";
import type { HeroSlot } from "@/components/report-v2/ReportHero";
import type { NarrativeResult } from "@/lib/analysis/narrative";
import {
  assembleReportVisuals,
  enrichCopyVariants,
  filterFalseFindings,
  splitStoredExtraction,
  applyDomGroundTruth,
  applyPerformanceGroundTruth,
} from "@/lib/analysis/report-enrichment";
import {
  deriveHeroSlotWithSignals,
  mergeChecklistWithSignals,
  runDeterministicSignals,
  signalResultsToChecklistItems,
  signalResultsToVisualContrastFixes,
  blendScoreWithSignals,
  deriveBreakdownFromSignals,
  deriveConfidenceFromSignals,
  getSignalPassCount,
} from "@/lib/signals";
import {
  type AuditReport,
  type ReportCopyVariants,
  type CopyVariantBlock,
  type ReportChecklistItem,
  type ChecklistCategory,
  type ChecklistItemStatus,
  type ChecklistLinkTarget,
  type BrandStage,
  type TrafficSource,
  type AudienceType,
} from "@/lib/audit-report";
import { deriveRiskFromScore } from "@/lib/report-metrics";
import { isValidReportId } from "@/lib/report-id";
import { updateReportWithNarrativeInDb, fetchBenchmarkCohort } from "@/lib/reports-db";
import {
  createServerSupabase,
  isSupabaseConfigured,
} from "@/lib/supabase-server";

export const runtime = "nodejs";
export const maxDuration = 90;

// -----------------------------
// ADAPTERS (moved from /api/analyze)
// -----------------------------
function adaptHeroSlot(
  hero: NarrativeResult["hero"],
  extraction: import("@/lib/analysis/extraction").ExtractionResult,
  copyVariants: NarrativeCopyVariant[]
): HeroSlot {
  const { format, topIssue, score, lift, headline } = hero;

  switch (format) {
    case "D_textual":
      return {
        type: "headline_textual",
        issue_title: topIssue.title,
        quote: extraction.headline,
        explanation: topIssue.body,
        before_text: extraction.headline,
        after_text: topIssue.fix,
        section_label: "HEADLINE, BEFORE & AFTER",
      };

    case "B_before_after": {
      const ctaVariant =
        copyVariants.find((v) => v.section === "cta") ?? copyVariants[0];
      return {
        type: "cta_statistic",
        title: topIssue.title,
        stat: "70%",
        stat_label: "of visitors ignore generic CTAs",
        stat_source: "CXL Institute",
        description: topIssue.body,
        before_text: extraction.primaryCta.text || "Get Started",
        after_text: ctaVariant?.after_text || topIssue.fix,
      };
    }

    case "C_count_trust": {
      const ABSENT_MAP: Record<string, string> = {
        logos: "Customer logos",
        testimonials: "Testimonials",
        numbers: "Ratings",
        badges: "Guarantees",
      };
      const present = new Set(
        extraction.socialProofTypes.filter((t) => t !== "none")
      );
      const absent = (["logos", "testimonials", "numbers", "badges"] as const)
        .filter((t) => !present.has(t))
        .map((t) => ABSENT_MAP[t])
        .slice(0, 4);

      return {
        type: "trust_count",
        title: topIssue.title,
        description: topIssue.body,
        count: extraction.trustedByCount,
        label: "trust signals detected above the fold",
        absent_items:
          absent.length > 0
            ? absent
            : ["Customer logos", "Testimonials", "Ratings", "Guarantees"],
      };
    }

    case "A_numeric":
    default:
      return {
        type: "opportunity",
        score: Math.round((score / 10) * 10) / 10,
        score_label: `${lift}-point conversion lift possible`,
        title: headline,
        description: topIssue.body,
        before_text: topIssue.body,
        after_text: topIssue.fix,
        section_label: "BEFORE & AFTER",
      };
  }
}

function adaptCopyVariants(raw: NarrativeCopyVariant[]): ReportCopyVariants | null {
  if (!raw?.length) return null;

  const bySection = Object.fromEntries(
    ["headline", "cta", "subheadline"].map((s) => [
      s,
      raw.filter((v) => v.section === s),
    ])
  ) as Record<string, NarrativeCopyVariant[]>;

  const toBlock = (items: NarrativeCopyVariant[]): CopyVariantBlock => {
    const variants = items.map((v) => ({
      label: v.label,
      text: v.after_text,
      rationale: v.rationale,
      strategy: v.strategy,
      recommended: v.recommended,
    }));

    // Defensive: the prompt requires exactly one `recommended: true` per
    // section group, but LLM output isn't guaranteed — if it gives us 0 or
    // 2+, fall back to the first variant so the UI never shows an ambiguous
    // or missing recommendation.
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
  };

  return {
    headline:    toBlock(bySection.headline    ?? []),
    cta:         toBlock(bySection.cta         ?? []),
    subheadline: toBlock(bySection.subheadline ?? []),
  };
}

// Mirrors ISSUE_CATEGORY_MAP in ReportPageV2.tsx (v1 issue.category -> ChecklistCategory)
// so findings and legacy issues land in the same buckets.
const FINDING_CATEGORY_MAP: Record<Finding["type"], ChecklistCategory> = {
  clarity:     "copy",
  cta:         "copy",
  trust:       "trust",
  friction:    "structure",
  performance: "structure",
};

const FINDING_LINK_MAP: Record<Finding["type"], ChecklistLinkTarget> = {
  clarity:     "copy-headline",
  cta:         "copy-cta",
  trust:       "trust",
  friction:    "structure-nav",
  performance: "structure-nav",
};

// Reach is a coarse "does this get seen at all" heuristic, not a measured %:
// extraction only gives us above/below-fold booleans for the primary CTA and
// social proof — no DOM coordinates or scroll-depth data exist upstream (see
// lib/analysis/extraction.ts). Deliberately NOT using hasMobileViewport here:
// without a mobile traffic share (traffic_source only gives cold/warm/mixed),
// any mobile-based adjustment would be a guess dressed up as a number.
const REACH_BASE: Record<Finding["type"], number> = {
  clarity: 95,     // hero headline/subheadline — seen by virtually all visitors
  cta: 70,         // primary CTA — reach depends on fold position, adjusted below
  trust: 55,       // social proof section — reach depends on fold position, adjusted below
  friction: 40,    // forms/pricing — only reached by visitors already committed to convert
  performance: 90, // load time — affects everyone before any content renders
};

const REACH_FOLD_ADJUSTMENT = 12;

function computeReach(type: Finding["type"], extraction: import("@/lib/analysis/extraction").ExtractionResult): number {
  let reach = REACH_BASE[type];

  if (type === "cta") {
    reach += extraction.primaryCta.aboveFold ? REACH_FOLD_ADJUSTMENT : -REACH_FOLD_ADJUSTMENT;
  } else if (type === "trust") {
    reach += extraction.socialProofAboveFold ? REACH_FOLD_ADJUSTMENT : -REACH_FOLD_ADJUSTMENT;
  }

  return Math.max(0, Math.min(100, reach));
}

function adaptFindingsToChecklist(
  findings: Finding[],
  extraction: import("@/lib/analysis/extraction").ExtractionResult
): ReportChecklistItem[] {
  return findings.map((f, i) => {
    const status: ChecklistItemStatus =
      f.severity === "critical" || f.severity === "high" ? "missing" : "weak";
    const reach = computeReach(f.type, extraction);

    return {
      id: `finding-${i}`,
      text: f.title,
      evidence: f.evidence,
      body: f.body,
      status,
      link_to: FINDING_LINK_MAP[f.type] ?? null,
      category: FINDING_CATEGORY_MAP[f.type] ?? "copy",
      impact_score: Math.round((reach * f.drag_score) / 100),
      why_it_matters_here: f.why_it_matters_here,
      reasoning_chain: f.reasoning_chain,
      fix: f.fix,
    };
  });
}

import {
  assignChecklistDeltasFromHeroLift,
  topOpportunityItems,
} from "@/lib/checklist-deltas";
// ROUTE
// -----------------------------
export async function POST(req: Request) {
  if (process.env.NARRATIVE_MOCK === "true") {
    const { mockNarrativeFixture } = await import(
      "@/lib/analysis/mock-narrative-fixture"
    );
    return NextResponse.json(mockNarrativeFixture);
  }

  try {
    const body = await req.json().catch(() => null);
    const reportId =
      typeof body?.reportId === "string" ? body.reportId.trim() : "";

    if (!reportId || !isValidReportId(reportId)) {
      return NextResponse.json({ error: "Invalid reportId" }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Storage not configured" },
        { status: 503 }
      );
    }

    const supabase = createServerSupabase();
    const { data, error: dbError } = await supabase
      .from("reports")
      .select("extraction, audited_url, brand_stage, traffic_source, audience_type")
      .eq("id", reportId)
      .maybeSingle();

    if (dbError) {
      console.error("[narrative] DB read error:", dbError.message);
      return NextResponse.json(
        { error: "Failed to load report" },
        { status: 500 }
      );
    }

    if (!data?.extraction) {
      return NextResponse.json(
        { error: "Extraction not found for this reportId" },
        { status: 404 }
      );
    }

    const stored = splitStoredExtraction(data.extraction as StoredExtraction);
    const {
      previewImage: storedPreviewImage,
      lowerPreviewImage,
      lower_fold,
      viewport_width,
      computed_values,
      performance_metrics,
      mobile_computed_values,
      mobile_preview_image,
      competitor,
      page_meta,
    } = stored;
    let { extraction } = stored;
    extraction = applyDomGroundTruth(extraction, computed_values, page_meta);
    extraction = applyPerformanceGroundTruth(extraction, performance_metrics);

    let lowerFold: LowerFoldSnapshot | null = lower_fold ?? null;
    if (!lowerFold && lowerPreviewImage) {
      const lowerScreenshotBase64 = await resolveHeroScreenshotBase64(lowerPreviewImage);
      if (lowerScreenshotBase64) {
        try {
          lowerFold = await extractLowerFoldSnapshot(lowerScreenshotBase64);
        } catch (error) {
          console.warn("[narrative] lower-fold extraction failed", error);
        }
      }
    }
    if (lowerFold) {
      extraction = applyLowerFoldGroundTruth(extraction, lowerFold);
    }
    const url = (data.audited_url as string) ?? "";

    const brandStage = data.brand_stage as BrandStage | null | undefined;
    const trafficSource = data.traffic_source as TrafficSource | null | undefined;
    const audienceType = data.audience_type as AudienceType | null | undefined;
    const pageContext: PageContextInput | undefined =
      brandStage || trafficSource || audienceType
        ? {
            brand_stage: brandStage ?? undefined,
            traffic_source: trafficSource ?? undefined,
            audience_type: audienceType ?? undefined,
          }
        : undefined;

    const heroScreenshotBase64 = await resolveHeroScreenshotBase64(storedPreviewImage);

    const signalResults = runDeterministicSignals({
      computedValues: computed_values,
      mobileComputedValues: mobile_computed_values,
      pageMeta: page_meta ?? null,
      extraction,
      performanceMetrics: performance_metrics,
    });

    let competitorComparison = null;
    if (competitor) {
      const competitorSignals = runDeterministicSignals({
        computedValues: competitor.computed_values ?? null,
        mobileComputedValues: competitor.mobile_computed_values ?? null,
        pageMeta: competitor.page_meta ?? null,
        extraction: applyDomGroundTruth(
          competitor.extraction,
          competitor.computed_values,
          competitor.page_meta
        ),
        performanceMetrics: null,
      });
      competitorComparison = buildCompetitorComparison({
        competitorUrl: competitor.url,
        competitorPreviewImage: competitor.previewImage,
        primarySignals: signalResults,
        competitorSignals,
        primaryScore: deriveScoreFromSignals(signalResults),
      });
    }

    const { result: narrativeRaw, usage } = await generateNarrative(
      extraction,
      url,
      pageContext,
      {
        computedValues: computed_values,
        pageMeta: page_meta,
        heroScreenshotBase64,
        lowerFold,
        performanceMetrics: performance_metrics,
        mobileComputedValues: mobile_computed_values,
        competitorComparison,
      }
    );
    const narrative = {
      ...narrativeRaw,
      findings: filterFalseFindings(
        narrativeRaw.findings ?? [],
        page_meta,
        computed_values
      ),
    };
    console.log(
      `[narrative] score=${narrative.hero.score} visual_fixes=${narrative.visual_fixes?.length} copy_variants=${narrative.copy_variants?.length} cost=$${usage.estimatedCostUsd.toFixed(5)}`
    );

    const rawCopyVariants = narrative.copy_variants ?? [];
    const adaptedCopyVariants = adaptCopyVariants(rawCopyVariants);
    const meta = {
      title_suggestion: narrative.meta.title_suggestion,
      description_suggestion: narrative.meta.description_suggestion,
      proof_suggestion: narrative.meta.proof_suggestion,
    };
    const copy_variants = enrichCopyVariants(
      adaptedCopyVariants,
      extraction,
      rawCopyVariants,
      meta
    );
    const hero_slot = adaptHeroSlot(narrative.hero, extraction, rawCopyVariants);
    const llmChecklist = adaptFindingsToChecklist(narrative.findings, extraction);

    const score = blendScoreWithSignals(
      Math.max(0, Math.min(10, narrative.hero.score / 10)),
      signalResults
    );

    const benchmark = computeReportBenchmark({
      score,
      signalResults,
      performanceMetrics: performance_metrics,
      cohort: await fetchBenchmarkCohort(reportId),
    });

    if (competitorComparison) {
      competitorComparison = {
        ...competitorComparison,
        primary_score: score,
        score_delta: Math.round((score - competitorComparison.competitor_score) * 10) / 10,
      };
    }

    const signalChecklistItems = signalResultsToChecklistItems(signalResults);
    const benchmarkChecklistItems = benchmarkToChecklistItems(benchmark);
    const competitorChecklistItems = competitorComparisonToChecklistItems(competitorComparison);
    const checklist = [
      ...benchmarkChecklistItems,
      ...competitorChecklistItems,
      ...mergeChecklistWithSignals(llmChecklist, signalChecklistItems, signalResults),
    ].sort((a, b) => {
      const statusRank = (status: ReportChecklistItem["status"]) =>
        status === "missing" ? 0 : status === "weak" ? 1 : 2;
      const rankDiff = statusRank(a.status) - statusRank(b.status);
      if (rankDiff !== 0) return rankDiff;
      return (b.impact_score ?? 0) - (a.impact_score ?? 0);
    });
    const checklistWithDeltas = assignChecklistDeltasFromHeroLift(checklist, narrative.hero.lift);
    const topOpportunities = topOpportunityItems(checklistWithDeltas);

    const contrastFixes = signalResultsToVisualContrastFixes(signalResults);
    const visualSection = assembleReportVisuals(
      {
        extraction,
        stored,
        narrative: {
          ...narrative,
          visual_fixes: [
            ...contrastFixes.map((fix) => ({
              category: fix.dimension as import("@/lib/analysis/narrative").VisualFix["category"],
              observation: fix.observation,
              fix: fix.recommendation,
              impact: fix.impact ?? ("medium" as const),
              element: fix.element ?? "",
            })),
            ...(narrative.visual_fixes ?? []),
          ],
        },
        rawCopyVariants,
        brandStage: brandStage ?? undefined,
        trafficSource: trafficSource ?? undefined,
        audienceType: audienceType ?? undefined,
      },
      checklistWithDeltas,
      copy_variants,
      meta
    );

    const reportPayload: AuditReport = {
      url,
      score,
      viewport_width: viewport_width ?? 1280,
      computed_values,
      performance_metrics,
      mobile_computed_values,
      benchmark,
      signal_summary: {
        total: signalResults.length,
        passed: getSignalPassCount(signalResults),
      },
      competitor_comparison: competitorComparison,
      risk: deriveRiskFromScore(score),
      summary: narrative.summary,
      verdict: narrative.hero.title ?? "",
      confidence: deriveConfidenceFromSignals(signalResults),
      ...(storedPreviewImage ? { previewImage: storedPreviewImage } : {}),
      ...(mobile_preview_image ? { mobile_preview_image } : {}),
      issues: narrative.findings.map((f) => ({
        category: f.type,
        title: f.title,
        why: f.body,
        evidence: f.evidence,
        // ReportIssue.severity is a deprecated legacy field that only knows
        // "low"|"medium"|"high" — fold "critical" into "high" here.
        severity: f.severity === "critical" ? "high" : f.severity,
        bullets: [],
      })),
      suggestions: topOpportunities.map((item) => ({
        recommendation: item.fix ?? item.text,
        priority: "quick_win" as const,
      })),
      copy: [],
      checklist: checklistWithDeltas,
      breakdown: deriveBreakdownFromSignals(signalResults, narrative.findings),
      copy_variants,
      meta,
      visual_fixes: visualSection.fixes,
      visual_passes: visualSection.passes,
      score_potential: {
        target: Math.min(9.4, (narrative.hero.scorePotential) / 10),
        chips: topOpportunities.map((item) => ({
          label: item.fix ?? item.text,
          delta: `+${(item.delta ?? 0).toFixed(1)}`,
        })),
      },
      hero_slot: deriveHeroSlotWithSignals(
        {
          url,
          score,
          checklist: checklistWithDeltas,
          copy_variants,
          summary: narrative.summary,
        } as AuditReport,
        signalResults,
        () => hero_slot
      ),
      generatedAt: new Date().toISOString(),
    };

    await updateReportWithNarrativeInDb(reportId, reportPayload);

    return NextResponse.json({ status: "ready" });
  } catch (error: any) {
    console.error("[narrative] Error:", error?.message);
    console.error(error?.stack);

    return NextResponse.json(
      {
        error: error?.message?.includes("parse")
          ? "LLM response could not be parsed. Please retry."
          : error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
