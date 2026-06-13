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

function countActionableGaps(checklist: ReportChecklistItem[]) {
  const gaps = checklist.filter(
    (item) => item.status !== "pass" && item.link_to !== "visual-fixes"
  );

  return {
    missing: gaps.filter((item) => item.status === "missing").length,
    weak: gaps.filter((item) => item.status === "weak").length,
    total: gaps.length,
  };
}

/**
 * Replace LLM score anchoring (~6.5) with breakdown + checklist-calibrated value.
 */
export function calibrateReportScore(
  llmScore: number,
  breakdown: ReportBreakdown,
  checklist: ReportChecklistItem[]
): number {
  const derived = deriveScoreFromBreakdown(breakdown);
  const { missing, total } = countActionableGaps(checklist);
  let score = derived;

  if (missing >= 3) {
    score = Math.min(score, 6.4);
  } else if (missing === 2) {
    score = Math.min(score, 6.9);
  } else if (missing === 1 && total <= 1) {
    score = Math.max(score, 7.0);
  } else if (missing === 0 && total === 0) {
    score = Math.max(score, 7.8);
  }

  if (Number.isFinite(llmScore) && llmScore > 0) {
    const blended = derived * 0.7 + llmScore * 0.3;
    score = roundScore(blended);

    if (missing >= 3) {
      score = Math.min(score, 6.4);
    } else if (missing === 0 && total === 0) {
      score = Math.max(score, 7.5);
    }
  }

  return roundScore(score);
}
