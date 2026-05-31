import type { ImpactFields } from "@/lib/audit-report";

export type ImpactEntry = { key: string; value: number };

export function getImpactEntries(item: ImpactFields): ImpactEntry[] {
  return [
    { key: item.impact_metric_1, value: item.impact_value_1 },
    { key: item.impact_metric_2, value: item.impact_value_2 },
  ]
    .map((entry) => ({
      key: String(entry.key ?? "").trim(),
      value:
        typeof entry.value === "number" ? entry.value : Number(entry.value),
    }))
    .filter(
      (entry) =>
        entry.key && Number.isFinite(entry.value) && entry.value !== 0
    )
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 1);
}
