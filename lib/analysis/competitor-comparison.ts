import type { ReportChecklistItem } from "@/lib/audit-report";
import type { SignalRunResult } from "@/lib/signals/types";
import { getSignalPassCount } from "@/lib/signals/run-signals";
import { blendScoreWithSignals } from "@/lib/signals/score";

export type CompetitorComparisonPoint = {
  id: string;
  label: string;
  primary_evidence: string;
  competitor_evidence: string;
  impact: "high" | "medium" | "low";
};

export type CompetitorComparison = {
  competitor_url: string;
  competitor_preview_image?: string;
  primary_score: number;
  competitor_score: number;
  score_delta: number;
  advantages: CompetitorComparisonPoint[];
  gaps: CompetitorComparisonPoint[];
  summary: string;
};

const COMPARISON_SIGNALS: Array<{
  id: string;
  label: string;
  impact: CompetitorComparisonPoint["impact"];
}> = [
  { id: "h1_contrast_aa", label: "Headline contrast (WCAG AA)", impact: "high" },
  { id: "cta_contrast_aa", label: "CTA contrast (WCAG AA)", impact: "high" },
  { id: "cta_specificity", label: "CTA specificity", impact: "high" },
  { id: "social_proof_above_fold", label: "Social proof above fold", impact: "medium" },
  { id: "meta_title_present", label: "Page title tag", impact: "medium" },
  { id: "meta_description_present", label: "Meta description", impact: "medium" },
  { id: "mobile_cta_visible", label: "Mobile CTA visibility", impact: "high" },
  { id: "pricing_visible", label: "Pricing visibility", impact: "medium" },
];

function statusRank(status: SignalRunResult["status"]): number {
  if (status === "pass") return 2;
  if (status === "weak") return 1;
  return 0;
}

function evidenceFor(results: SignalRunResult[], id: string): string {
  const match = results.find((result) => result.id === id);
  if (!match) return "not measured";
  if (match.status === "pass") return match.evidence || "pass";
  return match.evidence || match.text;
}

export function deriveScoreFromSignals(signalResults: SignalRunResult[]): number {
  if (!signalResults.length) return 0;
  const passRate = getSignalPassCount(signalResults) / signalResults.length;
  return blendScoreWithSignals(5.5 + passRate * 4, signalResults);
}

export function buildCompetitorComparison(input: {
  competitorUrl: string;
  competitorPreviewImage?: string;
  primarySignals: SignalRunResult[];
  competitorSignals: SignalRunResult[];
  primaryScore: number;
}): CompetitorComparison | null {
  if (!input.competitorUrl.trim()) return null;

  const competitorScore = deriveScoreFromSignals(input.competitorSignals);
  const advantages: CompetitorComparisonPoint[] = [];
  const gaps: CompetitorComparisonPoint[] = [];

  for (const spec of COMPARISON_SIGNALS) {
    const primary = input.primarySignals.find((result) => result.id === spec.id);
    const competitor = input.competitorSignals.find((result) => result.id === spec.id);
    if (!primary || !competitor) continue;

    const primaryRank = statusRank(primary.status);
    const competitorRank = statusRank(competitor.status);
    if (primaryRank === competitorRank) continue;

    const point: CompetitorComparisonPoint = {
      id: spec.id,
      label: spec.label,
      primary_evidence: evidenceFor(input.primarySignals, spec.id),
      competitor_evidence: evidenceFor(input.competitorSignals, spec.id),
      impact: spec.impact,
    };

    if (primaryRank > competitorRank) {
      advantages.push(point);
    } else {
      gaps.push(point);
    }
  }

  const scoreDelta = Math.round((input.primaryScore - competitorScore) * 10) / 10;

  let summary: string;
  if (scoreDelta > 0.4) {
    summary = `Your page scores ${input.primaryScore.toFixed(1)} vs ${competitorScore.toFixed(1)} for the competitor on deterministic checks.`;
  } else if (scoreDelta < -0.4) {
    summary = `The competitor scores ${competitorScore.toFixed(1)} vs ${input.primaryScore.toFixed(1)} on deterministic checks — ${gaps.length} gaps to close.`;
  } else {
    summary = `Both pages score similarly on deterministic checks (${input.primaryScore.toFixed(1)} vs ${competitorScore.toFixed(1)}).`;
  }

  return {
    competitor_url: input.competitorUrl,
    ...(input.competitorPreviewImage
      ? { competitor_preview_image: input.competitorPreviewImage }
      : {}),
    primary_score: input.primaryScore,
    competitor_score: competitorScore,
    score_delta: scoreDelta,
    advantages: advantages.slice(0, 4),
    gaps: gaps.slice(0, 4),
    summary,
  };
}

export function competitorComparisonToChecklistItems(
  comparison: CompetitorComparison | null
): ReportChecklistItem[] {
  if (!comparison) return [];

  return comparison.gaps.slice(0, 3).map((gap) => ({
    id: `competitor-gap-${gap.id}`,
    text: `${gap.label} — competitor leads`,
    evidence: `You: ${gap.primary_evidence}`,
    body: `Competitor: ${gap.competitor_evidence}`,
    status: gap.impact === "high" ? "missing" : "weak",
    link_to: gap.id.includes("contrast") || gap.id.includes("mobile")
      ? "visual-fixes"
      : gap.id.includes("cta")
        ? "copy-cta"
        : "structure-nav",
    category: gap.id.includes("contrast") ? "visual" : "structure",
    impact_score: gap.impact === "high" ? 70 : 50,
    fix: `Close the gap on ${gap.label.toLowerCase()} — the competitor passes where this page does not.`,
    gap_label: gap.label.split(" ")[0],
  }));
}
