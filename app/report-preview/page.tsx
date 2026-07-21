"use client";

import { useEffect, useState } from "react";
import { ReportHero, type HeadlineTextualSlot } from "@/components/report-v2/ReportHero";
import { ReportScorePanel } from "@/components/report-v2/ReportScorePanel";
import { ReportTrustMetaPanelV2 } from "@/components/report-v2/ReportTrustMetaPanelV2";
import { ReportPriorityQueue } from "@/components/report-v2/ReportPriorityQueue";
import { ReportCopyStudioV2 } from "@/components/report-v2/ReportCopyStudioV2";
import { ReportVisualFixesGrid } from "@/components/report-v2/ReportVisualFixesGrid";
import { getRecommendedVariant } from "@/lib/report/get-recommended-variant";
import type { mockNarrativeFixture } from "@/lib/analysis/mock-narrative-fixture";
import type {
  ReportChecklistItem,
  ChecklistCategory,
  ChecklistItemStatus,
  ReportCopyVariants,
  CopyVariantBlock,
  ReportVisualFix,
  VisualFixDimension,
} from "@/lib/audit-report";

type Fixture = typeof mockNarrativeFixture;
type CopyStudioEntry = Fixture["copy_studio"][number];

const VALID_CATEGORIES: readonly string[] = ["copy", "trust", "visual", "structure"];

function toCategory(category: string): ChecklistCategory {
  return VALID_CATEGORIES.includes(category) ? (category as ChecklistCategory) : "copy";
}

function toStatus(severity: string): ChecklistItemStatus {
  return severity === "critical" ? "missing" : "weak";
}

const DIMENSION_GUESS: Record<string, VisualFixDimension> = {
  "cta hierarchy":    "cta_hierarchy",
  "typography":       "typography",
  "color contrast":   "color_contrast",
  "navigation":       "navigation",
  "social proof":     "social_proof",
  "spacing":          "spacing",
  "density":          "density",
  "depth":            "depth",
  "headline formula": "headline_formula",
  "corner radius":    "border_radius",
  "color tone":       "color_tone",
};

function guessDimension(title: string): VisualFixDimension {
  return DIMENSION_GUESS[title.trim().toLowerCase()] ?? "cta_hierarchy";
}

function buildCopyVariantBlock(entry: CopyStudioEntry | undefined): CopyVariantBlock {
  if (!entry) return { current: "", variants: [] };
  const chosen = getRecommendedVariant(entry.variants);
  return {
    current: entry.before,
    variants: chosen ? [{ label: chosen.strategy, text: chosen.after }] : [],
  };
}

export default function ReportPreviewPage() {
  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/narrative", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportId: "preview" }),
        });

        if (!res.ok) {
          throw new Error(
            `/api/narrative returned ${res.status}. Set NARRATIVE_MOCK=true in your env and restart the dev server.`
          );
        }

        const json = (await res.json()) as Fixture;
        if (!cancelled) setFixture(json);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load fixture");
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-[13px] text-amber-700">
        <span className="font-semibold">DEV PREVIEW</span>
        <span className="text-amber-500">·</span>
        <span>report-v2 reskin · fed by NARRATIVE_MOCK fixture · not a real report</span>
      </div>

      <main className="min-h-[calc(100dvh-68px)] bg-v2-surface px-4 pb-20 pt-8 text-v2-ink md:px-6 md:pt-[52px]">
        <div className="mx-auto flex w-full max-w-[920px] flex-col gap-7">
          {error && (
            <p className="text-[14px] text-v2-critical">{error}</p>
          )}

          {!error && !fixture && (
            <p className="text-[14px] text-v2-ink-muted">Loading fixture…</p>
          )}

          {fixture && (
            <ReportPreviewBody fixture={fixture} />
          )}
        </div>
      </main>
    </>
  );
}

function ReportPreviewBody({ fixture }: { fixture: Fixture }) {
  const headlineEntry = fixture.copy_studio.find((e) => e.field === "headline");
  const headlineVariant = headlineEntry ? getRecommendedVariant(headlineEntry.variants) : undefined;

  const heroSlot: HeadlineTextualSlot = {
    type: "headline_textual",
    issue_title: fixture.verdict,
    quote: headlineEntry?.before ?? "",
    explanation: fixture.summary,
    before_text: headlineEntry?.before ?? "",
    after_text: headlineVariant?.after ?? "",
    section_label: "HEADLINE, BEFORE & AFTER",
  };

  const scorePotential = {
    target: fixture.score.potential,
    chips: fixture.score.deltas.map((d) => {
      const finding = fixture.findings.find((f) => f.id === d.finding_id);
      return {
        label: finding?.fix_summary ?? finding?.title ?? d.finding_id,
        delta: `+${d.points.toFixed(1)}`,
      };
    }),
  };

  const checklist: ReportChecklistItem[] = fixture.findings.map((f) => ({
    id: f.id,
    text: f.title,
    status: toStatus(f.severity),
    link_to: null,
    category: toCategory(f.category),
    evidence: f.evidence,
    body: `${f.rationale} ${f.evidence}`.trim(),
    impact_score: f.impact_score,
    why_it_matters_here: f.why_it_matters_here,
    reasoning_chain: f.reasoning_chain,
  }));

  const copyVariants: ReportCopyVariants = {
    headline: buildCopyVariantBlock(fixture.copy_studio.find((e) => e.field === "headline")),
    cta: buildCopyVariantBlock(fixture.copy_studio.find((e) => e.field === "cta")),
    subheadline: buildCopyVariantBlock(fixture.copy_studio.find((e) => e.field === "subheadline")),
  };

  const visualFixes: ReportVisualFix[] = fixture.visual_fixes.map((f) => ({
    dimension: guessDimension(f.title),
    title: f.title,
    observation: f.issue,
    recommendation: f.recommendation,
  }));

  return (
    <>
      <ReportHero
        slot={heroSlot}
        report={{ score: fixture.score.current }}
        bridge={fixture.hero_bridge}
        scoreStatus={fixture.score.status as "healthy" | "at_risk" | "critical"}
      />

      <ReportScorePanel score={fixture.score.current} scorePotential={scorePotential} />

      <ReportTrustMetaPanelV2 trustMeta={fixture.trust_meta} />

      <ReportPriorityQueue checklist={checklist} />

      <ReportCopyStudioV2 copyVariants={copyVariants} />

      <ReportVisualFixesGrid fixes={visualFixes} passes={[]} />
    </>
  );
}
