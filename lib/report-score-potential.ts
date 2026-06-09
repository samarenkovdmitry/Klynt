import type { AuditReport, ReportBreakdown, ReportIssue } from "@/lib/audit-report";
import { getImpactEntries } from "@/lib/report-impact";

/** Rough uplift from top issue impacts (UI-only estimate, not a promise). */
const IMPACT_TO_SCORE_FACTOR = 0.35;

export type ScorePotentialSummary = {
  currentScore: number;
  potentialScore: number;
  fixCount: number;
  leverageTitle: string;
  leverageDetail: string;
};

export function estimateScorePotential(
  score: number,
  issues: ReportIssue[],
  breakdown?: ReportBreakdown
): ScorePotentialSummary {
  const topIssues = issues.slice(0, 3);
  const gain = topIssues.reduce((total, issue, index) => {
    const entry = getImpactEntries(issue, { breakdown, index })[0];
    return total + (entry ? Math.abs(entry.value) * IMPACT_TO_SCORE_FACTOR : 0);
  }, 0);

  const currentScore = Math.max(0, Math.min(100, Number(score) || 0));
  const potentialScore = Math.min(95, Math.round(currentScore + gain));
  const topIssue = issues[0];
  const topImpact = topIssue
    ? getImpactEntries(topIssue, { breakdown, index: 0 })[0]
    : undefined;

  return {
    currentScore,
    potentialScore,
    fixCount: topIssues.length,
    leverageTitle: topIssue?.title
      ? "Fix the top issue first"
      : "Address the highest-impact findings",
    leverageDetail: topImpact
      ? `${formatImpactMetric(topImpact.key)} impact accounts for much of the gap — it's the highest-leverage change on this page.`
      : "Tackling the top findings should move the score meaningfully on the next run.",
  };
}

function formatImpactMetric(key: string) {
  if (key.toLowerCase() === "cta") return "CTA";
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export function pickTopIssueCopy(report: AuditReport) {
  const copy = report.copy ?? [];
  const topIssue = report.issues?.[0];

  if (copy.length === 0) {
    return null;
  }

  if (!topIssue?.title) {
    return copy[0];
  }

  const heroMatch = copy.find((item) =>
    /hero|headline|h1|above/i.test(String(item.section ?? ""))
  );

  return heroMatch ?? copy[0];
}
