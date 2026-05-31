import type { ImpactFields } from "@/lib/audit-report";
import { getImpactEntries } from "@/lib/report-impact";

export type PriorityLabel = "Quick Win" | "High Impact" | "Medium Impact";

export function getPriorityLabel(item: ImpactFields): PriorityLabel {
  const values = getImpactEntries(item).map((entry) => Math.abs(entry.value));
  const max = values.length > 0 ? Math.max(...values) : 0;

  if (max >= 14) return "High Impact";
  if (max >= 10) return "Quick Win";
  return "Medium Impact";
}

export const PRIORITY_BADGE_CLASS: Record<PriorityLabel, string> = {
  "Quick Win":
    "border-[#FCE664] bg-[#FEFCE8] text-[#D08700]",
  "High Impact":
    "border-[#A4F4CF] bg-[#ECFDF5] text-[#009966]",
  "Medium Impact":
    "border-[#E5E5E5] bg-[#FAFAFA] text-[#616C77]",
};

export const PRIORITY_BADGE_ICON: Partial<Record<PriorityLabel, string>> = {
  "Medium Impact": "◐",
};
