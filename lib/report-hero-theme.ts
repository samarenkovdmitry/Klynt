import type { HealthTier } from "@/lib/report-metrics";
import { getScoreTier } from "@/lib/report-metrics";

export type ReportHeroTheme = {
  tier: HealthTier;
  heroBg: string;
  gridColor: string;
  badgeBg: string;
};

const THEMES: Record<HealthTier, Omit<ReportHeroTheme, "tier">> = {
  healthy: {
    heroBg: "#F5FFFB",
    gridColor: "#C8F2E4",
    badgeBg: "#10B981",
  },
  medium: {
    heroBg: "#FFFBF7",
    gridColor: "#F6E4D4",
    badgeBg: "#FF7A00",
  },
  critical: {
    heroBg: "#FFF7F7",
    gridColor: "#F9D5D5",
    badgeBg: "#FF5A4F",
  },
};

export function getReportHeroTheme(score: number): ReportHeroTheme {
  const tier = getScoreTier(score);

  return {
    tier,
    ...THEMES[tier],
  };
}

export function formatOverallScore(score: number) {
  return (Math.max(0, Math.min(100, Number(score))) / 10).toFixed(1);
}

export function formatAnalyzedDate(value?: string) {
  const date = value ? new Date(value) : new Date();

  return `Analyzed ${date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}`;
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
  if (value >= 70) return "#10B981";
  if (value >= 40) return "#FF7A00";
  return "#FF5A4F";
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
