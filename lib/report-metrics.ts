export type HealthTier = "healthy" | "medium" | "critical";

export function normalizeRisk(risk: string) {
  if (!risk) return "—";

  const r = risk.toLowerCase();

  if (r === "low") return "Healthy";
  if (r === "medium") return "At risk";
  if (r === "high") return "Critical";

  return risk;
}

function toTenScale(score: number): number {
  // Old stored reports used 0-100; new schema uses 0-10
  return score > 10 ? score / 10 : score;
}

export function getScoreTier(score: number): HealthTier {
  const s = toTenScale(score);
  if (s >= 7) return "healthy";
  if (s >= 4) return "medium";
  return "critical";
}

export function getRiskTier(risk: string): HealthTier {
  const r = risk.toLowerCase();

  if (r === "low") return "healthy";
  if (r === "medium") return "medium";
  if (r === "high") return "critical";

  return "medium";
}

export function getTierColor(tier: HealthTier): string {
  if (tier === "healthy") return "#10B981";
  if (tier === "medium") return "#FF7A00";
  return "#FF5A4F";
}

export function getScoreColor(score: number): string {
  return getTierColor(getScoreTier(score));
}

export function deriveRiskFromScore(score: number): "low" | "medium" | "high" {
  const s = toTenScale(score);
  if (s >= 7) return "low";
  if (s >= 4) return "medium";
  return "high";
}
