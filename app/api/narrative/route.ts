import { NextResponse } from "next/server";

import { generateNarrative } from "@/lib/analysis/narrative";
import type { ExtractionResult } from "@/lib/analysis/extraction";
import type { CopyVariant as NarrativeCopyVariant } from "@/lib/analysis/narrative";
import type { Finding } from "@/lib/analysis/narrative";
import type { PageContextInput } from "@/lib/analysis/narrative";
import type { HeroSlot } from "@/components/report-v2/ReportHero";
import type { NarrativeResult } from "@/lib/analysis/narrative";

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
import { normalizeVisualDimension } from "@/lib/report-visual-fixes";
import { deriveRiskFromScore } from "@/lib/report-metrics";
import { isValidReportId } from "@/lib/report-id";
import { updateReportWithNarrativeInDb } from "@/lib/reports-db";
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
  extraction: ExtractionResult,
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

function computeReach(type: Finding["type"], extraction: ExtractionResult): number {
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
  extraction: ExtractionResult
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

// Deterministic replacement for the old LLM-generated quickWins: splits the
// hero's score lift across the top-3 highest-impact checklist items,
// proportional to impact_score, so the sum of deltas never exceeds the
// actual current -> potential gap shown in the hero.
const TOP_OPPORTUNITY_COUNT = 3;

function assignChecklistDeltas(
  checklist: ReportChecklistItem[],
  lift: number
): ReportChecklistItem[] {
  const candidates = checklist
    .filter((item) => item.status !== "pass")
    .sort((a, b) => (b.impact_score ?? 0) - (a.impact_score ?? 0))
    .slice(0, TOP_OPPORTUNITY_COUNT);

  const impactSum = candidates.reduce((sum, item) => sum + (item.impact_score ?? 0), 0);
  if (impactSum > 0) {
    const liftDisplay = lift / 10; // match the 0-10 score scale shown in the report
    for (const item of candidates) {
      item.delta = Math.round(liftDisplay * ((item.impact_score ?? 0) / impactSum) * 10) / 10;
    }
  }

  return candidates;
}

// -----------------------------
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

    const extraction = data.extraction as ExtractionResult & { viewport_width?: number };
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

    const { result: narrative, usage } = await generateNarrative(extraction, url, pageContext);
    console.log(
      `[narrative] score=${narrative.hero.score} visual_fixes=${narrative.visual_fixes?.length} copy_variants=${narrative.copy_variants?.length} cost=$${usage.estimatedCostUsd.toFixed(5)}`
    );

    const score = Math.max(0, Math.min(10, narrative.hero.score / 10));
    const hero_slot = adaptHeroSlot(narrative.hero, extraction, narrative.copy_variants ?? []);
    const copy_variants = adaptCopyVariants(narrative.copy_variants ?? []) ?? undefined;
    const checklist = adaptFindingsToChecklist(narrative.findings, extraction);
    const topOpportunities = assignChecklistDeltas(checklist, narrative.hero.lift);

    const reportPayload: AuditReport = {
      url,
      score,
      viewport_width: extraction.viewport_width ?? 1280,
      risk: deriveRiskFromScore(score),
      summary: narrative.summary,
      verdict: narrative.hero.title ?? "",
      confidence: 88,
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
      checklist,
      breakdown: {
        clarity:  narrative.findings.some((f) => f.type === "clarity")  ? 55 : 80,
        trust:    narrative.findings.some((f) => f.type === "trust")    ? 55 : 80,
        friction: narrative.findings.some((f) => f.type === "friction") ? 55 : 80,
        visuals:  75,
      },
      copy_variants,
      meta: {
        title_suggestion: narrative.meta.title_suggestion,
        description_suggestion: narrative.meta.description_suggestion,
        proof_suggestion: narrative.meta.proof_suggestion,
      },
      visual_fixes: (narrative.visual_fixes ?? []).flatMap((f) => {
        const dimension = normalizeVisualDimension(f.category);
        if (!dimension) {
          console.warn("[visual_fixes] unmapped category:", f.category);
          return [];
        }
        return [{
          dimension,
          observation: f.observation,
          recommendation: f.fix,
          impact: f.impact,
          element: f.element,
        }];
      }),
      score_potential: {
        target: Math.min(9.4, (narrative.hero.scorePotential) / 10),
        chips: topOpportunities.map((item) => ({
          label: item.fix ?? item.text,
          delta: `+${(item.delta ?? 0).toFixed(1)}`,
        })),
      },
      hero_slot,
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
