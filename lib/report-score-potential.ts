import type {
  AuditReport,
  ReportBreakdown,
  ReportIssue,
  ReportSuggestion,
} from "@/lib/audit-report";
import {
  deriveScoreFixLabel,
  formatLeverageDetailDisplay,
} from "@/lib/report-copy-limits";
import { getImpactEntries } from "@/lib/report-impact";

/** Rough uplift from top issue impacts (UI-only estimate, not a promise). */
const IMPACT_TO_SCORE_FACTOR = 0.35;

export type ScoreFixItem = {
  label: string;
  text: string;
  points: string;
};

export type ScorePotentialSummary = {
  currentScore: number;
  potentialScore: number;
  fixCount: number;
  leverageTitle: string;
  leverageDetail: string;
  fixItems: ScoreFixItem[];
};

function matchSuggestion(
  issue: ReportIssue,
  index: number,
  suggestions: ReportSuggestion[]
) {
  return (
    suggestions.find(
      (item) =>
        item.category &&
        issue.category &&
        String(item.category).toLowerCase() === String(issue.category).toLowerCase()
    ) ?? suggestions[index]
  );
}

export function estimateScorePotential(
  score: number,
  issues: ReportIssue[],
  breakdown?: ReportBreakdown,
  suggestions: ReportSuggestion[] = []
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

  const fixItems = buildScoreFixItems(
    issues,
    breakdown,
    currentScore,
    potentialScore,
    suggestions
  );

  const leverageDetail = topImpact
    ? formatLeverageDetailDisplay(
        `Fixing the top findings adds about +${formatPointDelta(currentScore, potentialScore, 0.7)} points. Both are copy or layout changes — no full redesign needed.`
      )
    : formatLeverageDetailDisplay(
        "Tackling the top findings should move the score meaningfully on the next run."
      );

  return {
    currentScore,
    potentialScore,
    fixCount: topIssues.length,
    leverageTitle: topIssues.length >= 2
      ? "Fix issues 1 and 2 first"
      : topIssue?.title
        ? "Fix the top issue first"
        : "Address the highest-impact findings",
    leverageDetail,
    fixItems,
  };
}

function buildScoreFixItems(
  issues: ReportIssue[],
  breakdown: ReportBreakdown | undefined,
  currentScore: number,
  potentialScore: number,
  suggestions: ReportSuggestion[]
): ScoreFixItem[] {
  if (issues.length === 0) return [];

  const totalGain = potentialScore - currentScore;
  const topImpacts = issues.slice(0, 3).map((issue, index) => {
    const entry = getImpactEntries(issue, { breakdown, index })[0];
    return {
      issue,
      index,
      magnitude: entry ? Math.abs(entry.value) : 0,
      severity: entry && Math.abs(entry.value) >= 16 ? "Critical" : "Warning",
      suggestion: matchSuggestion(issue, index, suggestions),
    };
  });

  const impactSum = topImpacts.reduce((sum, item) => sum + item.magnitude, 0) || 1;
  const items: ScoreFixItem[] = [];

  if (topImpacts[0]) {
    items.push({
      label: `Fix 1 · ${topImpacts[0].severity}`,
      text: deriveScoreFixLabel(topImpacts[0].issue, topImpacts[0].suggestion),
      points: `+${((totalGain * topImpacts[0].magnitude) / impactSum).toFixed(1)} pts`,
    });
  }

  if (topImpacts[1]) {
    items.push({
      label: `Fix 2 · ${topImpacts[1].severity}`,
      text: deriveScoreFixLabel(topImpacts[1].issue, topImpacts[1].suggestion),
      points: `+${((totalGain * topImpacts[1].magnitude) / impactSum).toFixed(1)} pts`,
    });
  }

  if (topImpacts.length > 2) {
    items.push({
      label: `Fix 3–${topImpacts.length} · Warning`,
      text: "Visual hierarchy + trust signals",
      points: `+${(
        totalGain -
        items.reduce((sum, item) => sum + Number.parseFloat(item.points.replace(/[^\d.]/g, "")), 0)
      ).toFixed(1)} pts`,
    });
  }

  return items.slice(0, 3);
}

function formatPointDelta(currentScore: number, potentialScore: number, fraction = 1) {
  return ((potentialScore - currentScore) * fraction).toFixed(1);
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
