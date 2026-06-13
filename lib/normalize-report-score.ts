import type { ReportBreakdown, ReportChecklistItem } from "@/lib/audit-report";

const BREAKDOWN_KEYS = ["clarity", "trust", "friction", "visuals"] as const;

function breakdownAverage(breakdown: ReportBreakdown) {
  const total = BREAKDOWN_KEYS.reduce(
    (sum, key) => sum + Number(breakdown[key] ?? 0),
    0
  );

  return total / BREAKDOWN_KEYS.length;
}

function roundScore(value: number) {
  return Math.round(Math.max(0, Math.min(9.5, value)) * 10) / 10;
}

/** Derive 0–10 score from 0–100 breakdown dimensions. */
export function deriveScoreFromBreakdown(breakdown: ReportBreakdown) {
  return roundScore(breakdownAverage(breakdown) / 10);
}

/**
 * Prefer breakdown-derived score; blend lightly with LLM output.
 * No gap-count caps — score reflects breakdown, not checklist quota.
 */
export function calibrateReportScore(
  llmScore: number,
  breakdown: ReportBreakdown,
  _checklist: ReportChecklistItem[]
): number {
  void _checklist;

  const derived = deriveScoreFromBreakdown(breakdown);

  if (!Number.isFinite(llmScore) || llmScore <= 0) {
    return derived;
  }

  return roundScore(derived * 0.8 + llmScore * 0.2);
}
