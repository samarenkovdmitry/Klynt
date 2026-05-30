import type { ReportMetricObservations } from "@/lib/audit-report";

const MAX_OBSERVATION_WORDS = 16;

export function normalizeObservation(value: unknown, maxWords = MAX_OBSERVATION_WORDS) {
  if (typeof value !== "string") return "";

  const words = value.trim().split(/\s+/).filter(Boolean);

  return words.slice(0, maxWords).join(" ");
}

export function normalizeMetricObservations(
  raw: unknown
): ReportMetricObservations | undefined {
  if (!raw || typeof raw !== "object") return undefined;

  const data = raw as Record<string, unknown>;
  const trust = normalizeObservation(data.trust);
  const clarity = normalizeObservation(data.clarity);
  const friction = normalizeObservation(data.friction);
  const overall = normalizeObservation(data.overall);

  if (!trust && !clarity && !friction && !overall) {
    return undefined;
  }

  return { trust, clarity, friction, overall };
}

export function getMetricObservationFallbacks(
  breakdown?: {
    clarity?: number;
    trust?: number;
    conversion?: number;
    navigation?: number;
  },
  verdict?: string
): ReportMetricObservations {
  const trust = Number(breakdown?.trust ?? 0);
  const clarity = Number(breakdown?.clarity ?? 0);
  const friction = Math.round(
    (100 - clarity + 100 - Number(breakdown?.conversion ?? 0) + Number(breakdown?.navigation ?? 0)) /
      3
  );

  return {
    trust:
      trust >= 70
        ? "Users are likely to perceive the product as credible and professionally built."
        : trust >= 40
          ? "Some credibility is visible, but trust may not feel immediate or complete."
          : "Users may doubt credibility before they understand what the product offers.",
    clarity:
      clarity >= 70
        ? "The primary action and value proposition likely feel obvious within seconds."
        : clarity >= 40
          ? "The next step may require additional scanning before becoming obvious."
          : "Users may struggle to understand what to do or why it matters at first glance.",
    friction:
      friction >= 70
        ? "Several competing elements may slow understanding during the first interaction."
        : friction >= 40
          ? "Noticeable visual or messaging friction may interrupt early comprehension."
          : "The first screen likely feels focused and relatively easy to process.",
    overall:
      verdict?.trim() ||
      "The page likely communicates value, but early clarity still shapes conversion confidence.",
  };
}
