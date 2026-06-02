import type { ImpactFields } from "@/lib/audit-report";

export type ImpactEntry = { key: string; value: number };

type ImpactObject = Record<string, unknown>;

type IssueImpactSource = ImpactFields & {
  impact?: ImpactObject;
};

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

export function mapIssueImpact(item: IssueImpactSource) {
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
      (entry, index, list) =>
        list.findIndex((candidate) => candidate.key === entry.key) === index
    );

  const primary = entries[0];
  const secondary = entries[1];

  return {
    impact_metric_1: primary?.key ?? "",
    impact_value_1: primary?.value ?? 0,
    impact_metric_2: secondary?.key ?? "",
    impact_value_2: secondary?.value ?? 0,
  };
}

export function getImpactEntries(item: IssueImpactSource): ImpactEntry[] {
  const mapped = mapIssueImpact(item);

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
