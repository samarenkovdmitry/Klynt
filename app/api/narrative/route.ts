import { NextResponse } from "next/server";

import { generateNarrative } from "@/lib/analysis/narrative";
import type { ExtractionResult } from "@/lib/analysis/extraction";
import type { CopyVariant as NarrativeCopyVariant } from "@/lib/analysis/narrative";
import type { HeroSlot } from "@/components/report-v2/ReportHero";
import type { NarrativeResult } from "@/lib/analysis/narrative";

import {
  type AuditReport,
  type ReportCopyVariants,
  type CopyVariantBlock,
  type VisualFixDimension,
} from "@/lib/audit-report";
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
  extraction: ExtractionResult
): HeroSlot {
  const { format, topIssue, score, lift, headline, subheadline } = hero;

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

    case "B_before_after":
      return {
        type: "cta_statistic",
        title: topIssue.title,
        stat: "70%",
        stat_label: "of visitors ignore generic CTAs",
        stat_source: "CXL Institute",
        description: topIssue.body,
        before_text: extraction.primaryCta.text || "Get Started",
        after_text: topIssue.fix,
      };

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
        description: subheadline,
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

  const toBlock = (items: NarrativeCopyVariant[]): CopyVariantBlock => ({
    current: items[0]?.before_text ?? "",
    variants: items.map((v) => ({ label: v.label, text: v.after_text })),
  });

  return {
    headline:    toBlock(bySection.headline    ?? []),
    cta:         toBlock(bySection.cta         ?? []),
    subheadline: toBlock(bySection.subheadline ?? []),
  };
}

// -----------------------------
// ROUTE
// -----------------------------
export async function POST(req: Request) {
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
      .select("extraction, audited_url")
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

    const extraction = data.extraction as ExtractionResult;
    const url = (data.audited_url as string) ?? "";

    const { result: narrative, usage } = await generateNarrative(extraction, url);
    console.log(
      `[narrative] score=${narrative.hero.score} visual_fixes=${narrative.visual_fixes?.length} copy_variants=${narrative.copy_variants?.length} cost=$${usage.estimatedCostUsd.toFixed(5)}`
    );

    const score = Math.max(0, Math.min(10, narrative.hero.score / 10));
    const hero_slot = adaptHeroSlot(narrative.hero, extraction);
    const copy_variants = adaptCopyVariants(narrative.copy_variants ?? []) ?? undefined;

    const reportPayload: AuditReport = {
      url,
      score,
      risk: deriveRiskFromScore(score),
      summary: narrative.summary,
      verdict: narrative.hero.topIssue?.title ?? "",
      key_observation: narrative.hero.subheadline ?? "",
      confidence: 88,
      issues: narrative.findings.map((f) => ({
        category: f.type,
        title: f.title,
        why: f.body,
        evidence: f.evidence,
        severity: f.severity,
        bullets: [],
      })),
      suggestions: narrative.quickWins.slice(0, 3).map((qw) => ({
        recommendation: qw.text,
        priority: "quick_win" as const,
      })),
      copy: [],
      checklist: [],
      breakdown: {
        clarity:  narrative.findings.some((f) => f.type === "clarity")  ? 55 : 80,
        trust:    narrative.findings.some((f) => f.type === "trust")    ? 55 : 80,
        friction: narrative.findings.some((f) => f.type === "friction") ? 55 : 80,
        visuals:  75,
      },
      copy_variants,
      visual_fixes: (narrative.visual_fixes ?? []).map((f) => ({
        dimension: f.category as VisualFixDimension,
        observation: f.observation,
        recommendation: f.fix,
      })),
      score_potential: {
        target: Math.min(9.4, (narrative.hero.scorePotential) / 10),
        chips: narrative.quickWins.slice(0, 3).map((qw) => ({
          label: qw.text,
          delta: `+${qw.delta.toFixed(1)}`,
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
