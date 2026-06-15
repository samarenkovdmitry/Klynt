import type { ReportBreakdown, ReportIssue } from "@/lib/audit-report";
import { getImpactEntries } from "@/lib/report-impact";

const BREAKDOWN_KEYS = [
  "clarity",
  "trust",
  "friction",
  "visuals",
] as const satisfies readonly (keyof ReportBreakdown)[];

type BreakdownKey = (typeof BREAKDOWN_KEYS)[number];

function clampPercent(value: unknown) {
  const parsed = Number(value ?? 0);

  if (!Number.isFinite(parsed)) return 0;

  return Math.max(0, Math.min(100, Math.round(parsed)));
}

function toBreakdownScale(score: number) {
  const parsed = Number(score ?? 0);

  if (!Number.isFinite(parsed)) return 0;

  return parsed <= 10 ? clampPercent(parsed * 10) : clampPercent(parsed);
}

function clampBreakdown(breakdown?: ReportBreakdown): ReportBreakdown {
  return {
    clarity: clampPercent(breakdown?.clarity),
    trust: clampPercent(breakdown?.trust),
    friction: clampPercent(breakdown?.friction),
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

  if (normalized === "cta" || normalized === "conversion") return "friction";
  if (normalized === "navigation") return "clarity";

  return BREAKDOWN_KEYS.includes(normalized as BreakdownKey)
    ? (normalized as BreakdownKey)
    : null;
}

function isPenaltyBreakdown(score: number, breakdown: ReportBreakdown) {
  const scaledScore = toBreakdownScale(score);
  const average = breakdownAverage(breakdown);
  const max = breakdownMax(breakdown);

  return scaledScore >= 50 && max <= 35 && average <= 40;
}

function deriveBreakdownFromScore(score: number, issues: ReportIssue[]): ReportBreakdown {
  const baseScore = toBreakdownScale(score);
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

export function isBreakdownMismatched(score: number, breakdown: ReportBreakdown) {
  return (
    isPenaltyBreakdown(score, breakdown) ||
    Math.abs(breakdownAverage(breakdown) - toBreakdownScale(score)) >= 12
  );
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
  const modelScore = toBreakdownScale(score);
  let normalizedBreakdown = clampBreakdown(breakdown);

  if (isPenaltyBreakdown(score, normalizedBreakdown)) {
    normalizedBreakdown = deriveBreakdownFromScore(score, issues);
  }

  const alignedScore = breakdownAverage(normalizedBreakdown) / 10;

  return {
    score: alignedScore,
    breakdown: normalizedBreakdown,
  };
}
