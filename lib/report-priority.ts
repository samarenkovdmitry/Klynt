import type { ImpactFields, ReportPriority } from "@/lib/audit-report";
import { getImpactEntries } from "@/lib/report-impact";

export type PriorityLabel = "Quick Win" | "High Impact" | "Medium Impact";

export const PRIORITY_LABELS: Record<ReportPriority, PriorityLabel> = {
  quick_win: "Quick Win",
  high_impact: "High Impact",
  medium_impact: "Medium Impact",
};

const PRIORITY_ALIASES: Record<string, ReportPriority> = {
  quick_win: "quick_win",
  quickwin: "quick_win",
  "quick win": "quick_win",
  high_impact: "high_impact",
  highimpact: "high_impact",
  "high impact": "high_impact",
  medium_impact: "medium_impact",
  mediumimpact: "medium_impact",
  "medium impact": "medium_impact",
};

export type PriorityItem = {
  priority?: ReportPriority;
} & Partial<ImpactFields>;

function priorityFromLegacyImpact(
  legacy: ImpactFields | Record<string, number>
): ReportPriority {
  const entries =
    "impact_metric_1" in legacy ||
    "impact_value_1" in legacy ||
    "impact_metric_2" in legacy ||
    "impact_value_2" in legacy
      ? getImpactEntries(legacy as ImpactFields)
      : Object.entries(legacy as Record<string, number>)
          .filter(([, value]) => typeof value === "number" && value !== 0)
          .map(([key, value]) => ({ key, value: Math.abs(Number(value)) }));

  const max =
    entries.length > 0
      ? Math.max(...entries.map((entry) => Math.abs(entry.value)))
      : 0;

  if (max >= 14) return "high_impact";
  if (max >= 10) return "quick_win";
  return "medium_impact";
}

export function normalizeReportPriority(
  input: unknown,
  legacyImpact?: ImpactFields | Record<string, number>
): ReportPriority {
  if (typeof input === "string") {
    const normalized = input.trim().toLowerCase().replace(/[\s-]+/g, " ");
    const underscored = normalized.replace(/\s+/g, "_");
    const match =
      PRIORITY_ALIASES[underscored] ?? PRIORITY_ALIASES[normalized];

    if (match) return match;
  }

  if (legacyImpact) {
    return priorityFromLegacyImpact(legacyImpact);
  }

  return "medium_impact";
}

export function getPriorityLabel(item: PriorityItem): PriorityLabel {
  if (item.priority) {
    return PRIORITY_LABELS[item.priority];
  }

  return PRIORITY_LABELS[priorityFromLegacyImpact(item)];
}

export const PRIORITY_BADGE_CLASS: Record<PriorityLabel, string> = {
  "Quick Win": "border-[#FCE664] bg-[#FEFCE8] text-[#D08700]",
  "High Impact": "border-[#A4F4CF] bg-[#ECFDF5] text-[#009966]",
  "Medium Impact": "border-[#E5E5E5] bg-[#FAFAFA] text-[#616C77]",
};
