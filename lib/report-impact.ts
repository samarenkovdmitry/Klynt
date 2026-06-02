import type { ImpactFields, ReportBreakdown, ReportIssue } from "@/lib/audit-report";

export type ImpactEntry = { key: string; value: number };

type ImpactObject = Record<string, unknown>;

type IssueImpactSource = ImpactFields &
  Pick<ReportIssue, "category" | "bullets" | "title" | "severity"> & {
    impact?: ImpactObject;
  };

const CATEGORY_METRIC: Record<string, string> = {
  clarity: "clarity",
  navigation: "navigation",
  visuals: "visuals",
  trust: "trust",
  conversion: "conversion",
};

const BULLET_METRIC_PATTERNS: { pattern: RegExp; metric: string }[] = [
  { pattern: /\bcta\b/i, metric: "cta" },
  { pattern: /clarity/i, metric: "clarity" },
  { pattern: /trust/i, metric: "trust" },
  { pattern: /navigation|menu/i, metric: "navigation" },
  { pattern: /visual|hierarchy|contrast|layout/i, metric: "visuals" },
  { pattern: /conversion/i, metric: "conversion" },
];

function coerceImpactValue(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function impactEntriesFromObject(impactObj: ImpactObject | undefined) {
  if (!impactObj || typeof impactObj !== "object") {
    return [] as ImpactEntry[];
  }

  return Object.entries(impactObj)
    .map(([key, value]) => ({
      key: key.trim(),
      value: coerceImpactValue(value),
    }))
    .filter(
      (entry): entry is ImpactEntry =>
        Boolean(entry.key) && entry.value !== null && entry.value !== 0
    )
    .map((entry) => ({ key: entry.key, value: entry.value as number }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
}

function resolveMetricKey(item: IssueImpactSource): string {
  const category = String(item.category ?? "")
    .trim()
    .toLowerCase();

  if (category && CATEGORY_METRIC[category]) {
    return CATEGORY_METRIC[category];
  }

  const bulletText = (item.bullets ?? []).join(" ");
  const titleText = String(item.title ?? "");
  const combined = `${bulletText} ${titleText}`;

  for (const { pattern, metric } of BULLET_METRIC_PATTERNS) {
    if (pattern.test(combined)) {
      return metric;
    }
  }

  return "clarity";
}

function breakdownScoreForMetric(
  metric: string,
  breakdown?: ReportBreakdown
): number {
  if (!breakdown) {
    return 55;
  }

  if (metric === "cta") {
    return Number(breakdown.conversion ?? breakdown.clarity ?? 55);
  }

  const score = breakdown[metric as keyof ReportBreakdown];

  return Number.isFinite(Number(score)) ? Number(score) : 55;
}

function inferImpactValue(
  metric: string,
  breakdown: ReportBreakdown | undefined,
  severity: ReportIssue["severity"],
  index: number
): number {
  const score = breakdownScoreForMetric(metric, breakdown);
  const deficit = 100 - score;
  let magnitude = Math.round(deficit / 3.5);
  magnitude = Math.max(8, Math.min(22, magnitude));

  if (severity === "high") {
    magnitude = Math.min(25, magnitude + 3);
  } else if (severity === "low") {
    magnitude = Math.max(5, magnitude - 2);
  }

  const jitter = [0, 2, -1, 3][index % 4];
  magnitude = Math.max(5, Math.min(25, magnitude + jitter));

  return -magnitude;
}

export function inferIssueImpactFallback(
  item: IssueImpactSource,
  breakdown?: ReportBreakdown,
  index = 0
) {
  const metric = resolveMetricKey(item);

  return {
    impact_metric_1: metric,
    impact_value_1: inferImpactValue(metric, breakdown, item.severity, index),
    impact_metric_2: "",
    impact_value_2: 0,
  };
}

export function mapIssueImpact(
  item: IssueImpactSource,
  breakdown?: ReportBreakdown,
  index = 0
) {
  const fromObject = impactEntriesFromObject(item.impact);
  const fromFields = [
    { key: String(item.impact_metric_1 ?? "").trim(), value: item.impact_value_1 },
    { key: String(item.impact_metric_2 ?? "").trim(), value: item.impact_value_2 },
  ]
    .map((entry) => ({
      key: entry.key,
      value: coerceImpactValue(entry.value),
    }))
    .filter(
      (entry): entry is ImpactEntry =>
        Boolean(entry.key) && entry.value !== null && entry.value !== 0
    )
    .map((entry) => ({ key: entry.key, value: entry.value as number }));

  const entries = [...fromFields, ...fromObject]
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .filter(
      (entry, entryIndex, list) =>
        list.findIndex((candidate) => candidate.key === entry.key) === entryIndex
    );

  if (entries.length === 0) {
    return inferIssueImpactFallback(item, breakdown, index);
  }

  const primary = entries[0];
  const secondary = entries[1];

  return {
    impact_metric_1: primary.key,
    impact_value_1: primary.value,
    impact_metric_2: secondary?.key ?? "",
    impact_value_2: secondary?.value ?? 0,
  };
}

export function getImpactEntries(
  item: IssueImpactSource,
  options?: { breakdown?: ReportBreakdown; index?: number }
): ImpactEntry[] {
  const mapped = mapIssueImpact(item, options?.breakdown, options?.index ?? 0);

  return [
    { key: mapped.impact_metric_1, value: mapped.impact_value_1 },
    { key: mapped.impact_metric_2, value: mapped.impact_value_2 },
  ]
    .filter(
      (entry) =>
        entry.key && Number.isFinite(entry.value) && entry.value !== 0
    )
    .slice(0, 1);
}
