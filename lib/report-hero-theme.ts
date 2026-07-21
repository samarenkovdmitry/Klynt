import type { HealthTier } from "@/lib/report-metrics";
import { getScoreTier, getTierColor } from "@/lib/report-metrics";

export type ReportHeroTheme = {
  tier: HealthTier;
  heroBg: string;
  gridColor: string;
  badgeBg: string;
};

const THEMES: Record<HealthTier, Omit<ReportHeroTheme, "tier" | "badgeBg">> = {
  healthy: {
    heroBg: "#E8FBF4",
    gridColor: "#C8F2E4",
  },
  medium: {
    heroBg: "#FFF3EA",
    gridColor: "#F6E4D4",
  },
  critical: {
    heroBg: "#FFEFEF",
    gridColor: "#F9D5D5",
  },
};

export function getReportHeroTheme(score: number): ReportHeroTheme {
  const tier = getScoreTier(score);

  return {
    tier,
    badgeBg: getTierColor(tier),
    ...THEMES[tier],
  };
}

export function getTierLabel(tier: HealthTier) {
  if (tier === "healthy") return "Healthy";
  if (tier === "medium") return "At risk";
  return "Critical";
}

export function formatOverallScore(score: number) {
  const s = Number(score);
  if (!Number.isFinite(s)) return "0.0";
  // Old stored reports used 0-100 scale; new reports use 0-10 directly
  const display = s > 10 ? s / 10 : s;
  return Math.max(0, Math.min(10, display)).toFixed(1);
}

export function formatAnalyzedDate(value?: string) {
  const date = value ? new Date(value) : new Date();

  return `Analyzed ${date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}`;
}

export function formatReportDateShort(value?: string) {
  const date = value ? new Date(value) : new Date();

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatReportDomain(url?: string) {
  if (!url) return "";

  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(
      /^www\./,
      ""
    );
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
}

export function formatReportHref(url?: string) {
  if (!url) return undefined;

  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).href;
  } catch {
    return undefined;
  }
}

export function getMetricBarColor(value: number) {
  if (value >= 70) return getTierColor("healthy");
  if (value >= 40) return getTierColor("medium");
  return getTierColor("critical");
}

export function getFrictionScore(breakdown?: {
  clarity?: number;
  conversion?: number;
  navigation?: number;
}) {
  const clarity = Number(breakdown?.clarity ?? 0);
  const conversion = Number(breakdown?.conversion ?? 0);
  const navigation = Number(breakdown?.navigation ?? 0);

  return Math.round((100 - clarity + 100 - conversion + navigation) / 3);
}
