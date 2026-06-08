import type {
  AudienceType,
  AuditReport,
  BrandStage,
  TrafficSource,
} from "@/lib/audit-report";
import {
  normalizeHeadlineDirections,
  resolveHeadlineBeforeGap,
} from "@/lib/brand-stage";
import { normalizeReportFindings } from "@/lib/report-findings-quality";
import { mapIssueImpact } from "@/lib/report-impact";
import { normalizeMetricObservations } from "@/lib/metric-observations";
import { normalizeReportBreakdown } from "@/lib/normalize-report-breakdown";
import { normalizeReportPriority } from "@/lib/report-priority";
import { deriveRiskFromScore } from "@/lib/report-metrics";
import { normalizeReportHeroCopy } from "@/lib/report-hero-copy";

function clampPercent(n: unknown) {
  const v = Number(n ?? 0);

  if (Number.isNaN(v)) return 0;

  return Math.max(0, Math.min(100, v));
}

function normalizePriorityItem(item: Record<string, unknown>) {
  const {
    impact,
    impact_metric_1,
    impact_value_1,
    impact_metric_2,
    impact_value_2,
    priority,
    ...rest
  } = item;

  const legacyImpact =
    impact && typeof impact === "object"
      ? (impact as Record<string, number>)
      : ({
          impact_metric_1,
          impact_value_1,
          impact_metric_2,
          impact_value_2,
        } as Record<string, unknown>);

  return {
    ...rest,
    priority: normalizeReportPriority(
      priority,
      legacyImpact as Record<string, number>
    ),
  };
}

function normalizeSignals(signals: string[] = []) {
  const tags = new Set<string>();
  const joined = signals.join(" ").toLowerCase();

  if (joined.includes("hierarchy") || joined.includes("visual priority")) {
    tags.add("Weak hierarchy");
  }

  if (
    joined.includes("contrast") ||
    joined.includes("hard to see") ||
    joined.includes("visibility")
  ) {
    tags.add("Low contrast");
  }

  if (
    joined.includes("crowded") ||
    joined.includes("spacing") ||
    joined.includes("layout") ||
    joined.includes("dense")
  ) {
    tags.add("Overloaded layout");
  }

  if (joined.includes("cta") || joined.includes("button")) {
    tags.add("Weak CTA");
  }

  if (
    joined.includes("trust") ||
    joined.includes("testimonial") ||
    joined.includes("social proof")
  ) {
    tags.add("Missing trust signals");
  }

  if (joined.includes("navigation") || joined.includes("menu")) {
    tags.add("Navigation friction");
  }

  if (
    joined.includes("clarity") ||
    joined.includes("unclear") ||
    joined.includes("generic")
  ) {
    tags.add("Low clarity");
  }

  return Array.from(tags).slice(0, 3);
}

function isAbstractIssueTitle(title: string): boolean {
  const t = title.trim();
  if (!t) return true;

  const looksLikeSentence =
    /[.!?]$/.test(t) ||
    /\b(don't|doesn't|can't|cannot|isn't|aren't|because|so users|so visitors|which makes|which means|before they|when they)\b/i.test(
      t
    );

  if (looksLikeSentence && t.split(/\s+/).length >= 8) return false;

  const abstractLabel =
    /^(weak|low|missing|poor|unclear|navigation|messaging|cta|visual|conversion|trust|clarity|overloaded|generic)\b/i.test(
      t
    ) ||
    /\b(issues?|gap|friction|hierarchy|optimization|clarity problems?)\b/i.test(t);

  return abstractLabel || t.split(/\s+/).length <= 6;
}

function normalizeIssueTitle(item: { title?: unknown; why?: unknown }): string {
  const title = String(item.title ?? "").trim();
  const why = String(item.why ?? "").trim();

  if (!isAbstractIssueTitle(title)) return title;
  if (why.length < 20) return title;

  const firstSentence = why.match(/^[^.!?]+[.!?]/)?.[0]?.trim();
  return firstSentence || why;
}

function normalizeBreakdown(json: Record<string, unknown>) {
  if (!json.breakdown || typeof json.breakdown !== "object") {
    json.breakdown = {
      clarity: 0,
      navigation: 0,
      visuals: 0,
      trust: 0,
      conversion: 0,
    };
  }

  const breakdown = json.breakdown as Record<string, unknown>;

  return {
    clarity: clampPercent(breakdown.clarity),
    navigation: clampPercent(breakdown.navigation),
    visuals: clampPercent(breakdown.visuals),
    trust: clampPercent(breakdown.trust),
    conversion: clampPercent(breakdown.conversion),
  };
}

export type NormalizeAuditContext = {
  url: string;
  brandStage: BrandStage;
  trafficSource: TrafficSource;
  audienceType: AudienceType;
  previewImage?: string;
  generatedAt?: string;
};

export function normalizeHeroAuditJson(
  raw: Record<string, unknown>,
  context: NormalizeAuditContext
): AuditReport {
  const json = { ...raw };

  json.confidence = Number.isFinite(Number(json.confidence))
    ? Math.max(70, Math.min(98, Number(json.confidence)))
    : 82;

  const breakdown = normalizeBreakdown(json);
  json.breakdown = breakdown;

  Object.assign(json, normalizeReportHeroCopy(json));

  const normalizedScores = normalizeReportBreakdown({
    score: Number(json.score) || 0,
    breakdown,
    issues: [],
  });

  const auditedUrl =
    typeof json.url === "string" && json.url.trim() ? json.url.trim() : context.url;

  return {
    url: auditedUrl,
    score: normalizedScores.score,
    risk: deriveRiskFromScore(normalizedScores.score),
    summary: typeof json.summary === "string" ? json.summary : undefined,
    verdict: typeof json.verdict === "string" ? json.verdict : undefined,
    key_observation:
      typeof json.key_observation === "string" ? json.key_observation : undefined,
    confidence: Number(json.confidence) || 82,
    previewImage: context.previewImage,
    metric_observations: normalizeMetricObservations(json.metric_observations),
    issues: [],
    suggestions: [],
    copy: [],
    brand_stage: context.brandStage,
    traffic_source: context.trafficSource,
    audience_type: context.audienceType,
    breakdown: normalizedScores.breakdown,
    generatedAt: context.generatedAt ?? new Date().toISOString(),
    analysis_status: "partial",
  };
}

export function normalizeFullAuditJson(
  raw: Record<string, unknown>,
  context: NormalizeAuditContext
): AuditReport {
  const json = { ...raw };

  json.confidence = Number.isFinite(Number(json.confidence))
    ? Math.max(70, Math.min(98, Number(json.confidence)))
    : 82;

  json.breakdown = normalizeBreakdown(json);

  json.issues = Array.isArray(json.issues) ? json.issues.slice(0, 4) : [];
  json.suggestions = Array.isArray(json.suggestions)
    ? json.suggestions.slice(0, 3)
    : [];
  json.copy = Array.isArray(json.copy) ? json.copy.slice(0, 3) : [];

  json.issues = (json.issues as Record<string, unknown>[]).map((item, index) => {
    const { impact, ...rest } = item;

    return {
      ...rest,
      title: normalizeIssueTitle(item),
      bullets: normalizeSignals((item.bullets as string[]) || []),
      ...mapIssueImpact(item, json.breakdown as AuditReport["breakdown"], index),
    };
  });

  json.suggestions = (json.suggestions as Record<string, unknown>[]).map((item) =>
    normalizePriorityItem(item)
  );

  json.copy = (json.copy as Record<string, unknown>[]).map((item) =>
    normalizePriorityItem(item)
  );

  Object.assign(json, normalizeReportFindings(json));

  let headlineDirections = normalizeHeadlineDirections(
    json.headline_directions,
    context.brandStage
  );

  if (headlineDirections && !headlineDirections.gap) {
    const gap = resolveHeadlineBeforeGap(
      headlineDirections,
      (json.copy as AuditReport["copy"]) ?? []
    );

    if (gap) {
      headlineDirections = { ...headlineDirections, gap };
    }
  }

  json.headline_directions = headlineDirections;
  Object.assign(json, normalizeReportHeroCopy(json));

  const normalizedScores = normalizeReportBreakdown({
    score: Number(json.score) || 0,
    breakdown: json.breakdown as AuditReport["breakdown"],
    issues: json.issues as AuditReport["issues"],
  });

  const auditedUrl =
    typeof json.url === "string" && json.url.trim() ? json.url.trim() : context.url;

  return {
    url: auditedUrl,
    score: normalizedScores.score,
    risk: deriveRiskFromScore(normalizedScores.score),
    summary: typeof json.summary === "string" ? json.summary : undefined,
    verdict: typeof json.verdict === "string" ? json.verdict : undefined,
    key_observation:
      typeof json.key_observation === "string" ? json.key_observation : undefined,
    confidence: Number(json.confidence) || 82,
    previewImage: context.previewImage,
    metric_observations: normalizeMetricObservations(json.metric_observations),
    issues: json.issues as AuditReport["issues"],
    suggestions: json.suggestions as AuditReport["suggestions"],
    copy: json.copy as AuditReport["copy"],
    brand_stage: context.brandStage,
    traffic_source: context.trafficSource,
    audience_type: context.audienceType,
    headline_directions: headlineDirections,
    breakdown: normalizedScores.breakdown,
    generatedAt: context.generatedAt ?? new Date().toISOString(),
    analysis_status: "complete",
  };
}
