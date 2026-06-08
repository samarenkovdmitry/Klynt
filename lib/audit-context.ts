export type TrafficSource = "cold" | "warm" | "mixed";

export type AudienceType = "b2b" | "b2c" | "both";

export const TRAFFIC_SOURCE_STORAGE_KEY = "klynt-traffic-source";
export const AUDIENCE_TYPE_STORAGE_KEY = "klynt-audience-type";

export const DEFAULT_TRAFFIC_SOURCE: TrafficSource = "mixed";
export const DEFAULT_AUDIENCE_TYPE: AudienceType = "both";

export const TRAFFIC_SOURCE_OPTIONS: {
  id: TrafficSource;
  label: string;
  shortLabel: string;
}[] = [
  {
    id: "cold",
    label: "Cold",
    shortLabel: "Ads, SEO, social — first-time visitors",
  },
  {
    id: "warm",
    label: "Warm",
    shortLabel: "Email, retargeting, word of mouth",
  },
  {
    id: "mixed",
    label: "Mixed",
    shortLabel: "Blend of cold and returning traffic",
  },
];

export const AUDIENCE_TYPE_OPTIONS: {
  id: AudienceType;
  label: string;
  shortLabel: string;
}[] = [
  {
    id: "b2b",
    label: "B2B",
    shortLabel: "Teams and business buyers",
  },
  {
    id: "b2c",
    label: "B2C",
    shortLabel: "Individual consumers",
  },
  {
    id: "both",
    label: "Both",
    shortLabel: "Businesses and individuals",
  },
];

export function isTrafficSource(value: unknown): value is TrafficSource {
  return value === "cold" || value === "warm" || value === "mixed";
}

export function isAudienceType(value: unknown): value is AudienceType {
  return value === "b2b" || value === "b2c" || value === "both";
}

export function parseTrafficSource(value: unknown): TrafficSource {
  const raw = String(value ?? "").trim();
  return isTrafficSource(raw) ? raw : DEFAULT_TRAFFIC_SOURCE;
}

export function parseAudienceType(value: unknown): AudienceType {
  const raw = String(value ?? "").trim();
  return isAudienceType(raw) ? raw : DEFAULT_AUDIENCE_TYPE;
}

export function getTrafficSourceLabel(source: TrafficSource) {
  return TRAFFIC_SOURCE_OPTIONS.find((option) => option.id === source)?.label ?? source;
}

export function getAudienceTypeLabel(audience: AudienceType) {
  return AUDIENCE_TYPE_OPTIONS.find((option) => option.id === audience)?.label ?? audience;
}

export function readStoredTrafficSource(): TrafficSource {
  if (typeof window === "undefined") {
    return DEFAULT_TRAFFIC_SOURCE;
  }

  try {
    return parseTrafficSource(localStorage.getItem(TRAFFIC_SOURCE_STORAGE_KEY));
  } catch {
    return DEFAULT_TRAFFIC_SOURCE;
  }
}

export function readStoredAudienceType(): AudienceType {
  if (typeof window === "undefined") {
    return DEFAULT_AUDIENCE_TYPE;
  }

  try {
    return parseAudienceType(localStorage.getItem(AUDIENCE_TYPE_STORAGE_KEY));
  } catch {
    return DEFAULT_AUDIENCE_TYPE;
  }
}

export function writeStoredTrafficSource(source: TrafficSource) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(TRAFFIC_SOURCE_STORAGE_KEY, source);
  } catch {
    // ignore quota errors
  }
}

export function writeStoredAudienceType(audience: AudienceType) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(AUDIENCE_TYPE_STORAGE_KEY, audience);
  } catch {
    // ignore quota errors
  }
}

export function buildAuditContextPromptBlock(
  trafficSource: TrafficSource,
  audienceType: AudienceType
) {
  const trafficRules =
    trafficSource === "cold"
      ? `TRAFFIC CONTEXT: Cold traffic — most visitors are first-time and skeptical.
- Weight hero clarity, audience fit, and immediate value proposition more heavily in issues and summary.
- Trust gaps matter more when there is no prior relationship.
- Recommendations should help a stranger understand "what is this" within seconds.`
      : trafficSource === "warm"
        ? `TRAFFIC CONTEXT: Warm traffic — many visitors already know the brand or offer.
- Do not over-penalize missing category explanations if the page clearly serves returning users.
- Focus more on next-step clarity, offer specifics, and conversion friction than basic education.
- Trust signals may be less critical unless the page still feels vague about the action.`
        : `TRAFFIC CONTEXT: Mixed traffic — assume a blend of first-time and returning visitors.
- Balance first-impression clarity with action clarity.
- Call out anything that only works for warm traffic but would confuse cold visitors.`;

  const audienceRules =
    audienceType === "b2b"
      ? `AUDIENCE CONTEXT: B2B buyers and teams.
- Prioritize role fit, workflow outcomes, risk reduction, and credibility for business decisions.
- Headline and CTA recommendations should sound professional and specific, not consumer-hype.`
      : audienceType === "b2c"
        ? `AUDIENCE CONTEXT: Individual consumers.
- Prioritize immediate personal benefit, ease, and emotional clarity over enterprise framing.
- Flag jargon or team-centric language that would feel distant to a solo user.`
        : `AUDIENCE CONTEXT: Mixed B2B and B2C audience.
- Flag copy that is ambiguous about who the product is for.
- Recommendations should make the target user explicit without over-narrowing.`;

  return `${trafficRules}

${audienceRules}`;
}
