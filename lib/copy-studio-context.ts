import type { AuditReport, AudienceType, TrafficSource } from "@/lib/audit-report";

function formatAudienceLabel(
  audienceType?: AudienceType,
  trafficSource?: TrafficSource
): string | undefined {
  const parts: string[] = [];

  if (audienceType === "b2b") {
    parts.push("B2B");
  } else if (audienceType === "b2c") {
    parts.push("B2C");
  } else if (audienceType === "both") {
    parts.push("B2B/B2C");
  }

  if (trafficSource === "cold") {
    parts.push("cold");
  } else if (trafficSource === "warm") {
    parts.push("warm");
  }

  return parts.length > 0 ? parts.join(" ") : undefined;
}

function formatTone(brandStage?: AuditReport["brand_stage"]): string | undefined {
  if (brandStage === "established") {
    return "confident";
  }

  if (brandStage === "growing") {
    return "direct";
  }

  if (brandStage === "just_launched") {
    return "clear";
  }

  return undefined;
}

export function buildCopyStudioContext(data: AuditReport) {
  return {
    tone: formatTone(data.brand_stage),
    audience: formatAudienceLabel(data.audience_type, data.traffic_source),
  };
}
