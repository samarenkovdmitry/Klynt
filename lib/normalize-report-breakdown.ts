import type { ReportBreakdown, ReportIssue } from "@/lib/audit-report";
import { getImpactEntries } from "@/lib/report-impact";

const BREAKDOWN_KEYS = [
  "clarity",
  "trust",
  "conversion",
  "navigation",
  "visuals",
] as const satisfies readonly (keyof ReportBreakdown)[];

type BreakdownKey = (typeof BREAKDOWN_KEYS)[number];

function clampPercent(value: unknown) {
  const parsed = Number(value ?? 0);

  if (!Number.isFinite(parsed)) return 0;

  return Math.max(0, Math.min(100, Math.round(parsed)));
}

function clampBreakdown(breakdown?: ReportBreakdown): ReportBreakdown {
  return {
    clarity: clampPercent(breakdown?.clarity),
    trust: clampPercent(breakdown?.trust),
    conversion: clampPercent(breakdown?.conversion),
    navigation: clampPercent(breakdown?.navigation),
    visuals: clampPercent(breakdown?.visuals),
  };
}

function breakdownAverage(breakdown: ReportBreakdown) {
  const total = BREAKDOWN_KEYS.reduce(
    (sum, key) => sum + Number(breakdown[key] ?? 0),
    0
  );

  return total / BREAKDOWN_KEYS.length;
}

function breakdownMax(breakdown: ReportBreakdown) {
  return Math.max(...BREAKDOWN_KEYS.map((key) => Number(breakdown[key] ?? 0)));
}

function resolveBreakdownKey(metric: string): BreakdownKey | null {
  const normalized = metric.trim().toLowerCase();

  if (normalized === "cta") return "conversion";

  return BREAKDOWN_KEYS.includes(normalized as BreakdownKey)
    ? (normalized as BreakdownKey)
    : null;
}

export function isBreakdownMismatched(score: number, breakdown: ReportBreakdown) {
  const average = breakdownAverage(breakdown);
  const max = breakdownMax(breakdown);

  if (score >= 50 && max <= 35 && average <= 40) {
    return true;
  }

  if (Math.abs(average - score) > 30) {
    return true;
  }

  return false;
}

function deriveBreakdownFromScore(score: number, issues: ReportIssue[]): ReportBreakdown {
  const baseScore = clampPercent(score);
  const values = Object.fromEntries(
    BREAKDOWN_KEYS.map((key) => [key, baseScore])
  ) as Record<BreakdownKey, number>;

  for (const [index, issue] of issues.entries()) {
    for (const entry of getImpactEntries(issue, { index })) {
      const key = resolveBreakdownKey(entry.key);

      if (!key || entry.value >= 0) continue;

      values[key] -= Math.min(25, Math.abs(entry.value));
    }
  }

  return clampBreakdown(values);
}

export function normalizeReportBreakdown({
  score,
  breakdown,
  issues = [],
}: {
  score: number;
  breakdown?: ReportBreakdown;
  issues?: ReportIssue[];
}) {
  const normalizedScore = clampPercent(score);
  const normalizedBreakdown = clampBreakdown(breakdown);

  if (isBreakdownMismatched(normalizedScore, normalizedBreakdown)) {
    return {
      score: normalizedScore,
      breakdown: deriveBreakdownFromScore(normalizedScore, issues),
    };
  }

  const average = breakdownAverage(normalizedBreakdown);

  if (
    average >= 45 &&
    average <= 95 &&
    Math.abs(average - normalizedScore) > 30
  ) {
    return {
      score: clampPercent(average),
      breakdown: normalizedBreakdown,
    };
  }

  return {
    score: normalizedScore,
    breakdown: normalizedBreakdown,
  };
}
