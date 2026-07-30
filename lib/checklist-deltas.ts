import type { ReportChecklistItem } from "@/lib/audit-report";

export const TOP_OPPORTUNITY_DELTA_COUNT = 3;

function compareChecklistImpact(a: ReportChecklistItem, b: ReportChecklistItem) {
  const aWeight = Math.abs(a.impact_score ?? 0);
  const bWeight = Math.abs(b.impact_score ?? 0);
  if (bWeight !== aWeight) return bWeight - aWeight;
  return (b.impact_score ?? 0) - (a.impact_score ?? 0);
}

export function topOpportunityItems(checklist: ReportChecklistItem[]) {
  return checklist
    .filter((item) => item.status !== "pass")
    .sort(compareChecklistImpact)
    .slice(0, TOP_OPPORTUNITY_DELTA_COUNT);
}

/** Splits score lift (0–10 scale) across the top checklist gaps for delta badges. */
export function assignChecklistItemDeltas(
  checklist: ReportChecklistItem[],
  potentialGain: number
): ReportChecklistItem[] {
  const candidates = topOpportunityItems(checklist);

  if (candidates.length === 0 || potentialGain <= 0) {
    return checklist;
  }

  const weights = candidates.map((item) => {
    const raw = item.impact_score ?? 0;
    return raw > 0 ? raw : Math.abs(raw);
  });
  let weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  const equalSplit = weightSum <= 0;

  if (equalSplit) {
    weightSum = candidates.length;
  }

  const deltaById = new Map<string, number>();

  candidates.forEach((item, index) => {
    const weight = equalSplit ? 1 : weights[index];
    const share = weight / weightSum;
    deltaById.set(item.id, Math.round(potentialGain * share * 10) / 10);
  });

  return checklist.map((item) => {
    if (typeof item.delta === "number") {
      return item;
    }

    const delta = deltaById.get(item.id);
    return delta === undefined ? item : { ...item, delta };
  });
}

/** Ensures Close the gap rows have delta badges, including legacy reports stored without them. */
export function enrichChecklistWithDeltas(
  checklist: ReportChecklistItem[],
  score: number,
  target?: number
): ReportChecklistItem[] {
  const potentialGain = Math.max(0, (target ?? score) - score);
  return assignChecklistItemDeltas(checklist, potentialGain);
}

/** Narrative pipeline: hero lift is on the 0–100 score scale. */
export function assignChecklistDeltasFromHeroLift(
  checklist: ReportChecklistItem[],
  lift: number
): ReportChecklistItem[] {
  return assignChecklistItemDeltas(checklist, lift / 10);
}