import type { PagePerformanceMetrics } from "@/lib/audit-report";

export type PerformanceMetricStatus = "pass" | "weak" | "missing" | "unknown";

export type PerformanceMetricSpec = {
  id: keyof Pick<
    PagePerformanceMetrics,
    "lcp_ms" | "cls" | "ttfb_ms" | "page_weight_kb"
  >;
  label: string;
  shortLabel: string;
  /** Plain-language tooltip for report UI. */
  tooltip: string;
  unit: string;
  /** Lower values are better (LCP, TTFB, weight). */
  lowerIsBetter: boolean;
  format: (value: number) => string;
  passThreshold: number;
  weakThreshold: number;
};

export const PERFORMANCE_METRIC_SPECS: PerformanceMetricSpec[] = [
  {
    id: "lcp_ms",
    label: "Largest Contentful Paint",
    shortLabel: "LCP",
    tooltip:
      "How long until the largest visible element (hero image or headline) finishes loading. Slow LCP makes visitors leave before they read your offer.",
    unit: "ms",
    lowerIsBetter: true,
    format: (v) => `${Math.round(v)} ms`,
    passThreshold: 2500,
    weakThreshold: 4000,
  },
  {
    id: "cls",
    label: "Cumulative Layout Shift",
    shortLabel: "CLS",
    tooltip:
      "How much the page layout shifts while loading. High CLS causes mis-clicks and makes the page feel unreliable.",
    unit: "",
    lowerIsBetter: true,
    format: (v) => v.toFixed(2),
    passThreshold: 0.1,
    weakThreshold: 0.25,
  },
  {
    id: "ttfb_ms",
    label: "Time to First Byte",
    shortLabel: "TTFB",
    tooltip:
      "Time until the server starts sending the page. High TTFB usually points to slow hosting, redirects, or backend latency.",
    unit: "ms",
    lowerIsBetter: true,
    format: (v) => `${Math.round(v)} ms`,
    passThreshold: 800,
    weakThreshold: 1800,
  },
  {
    id: "page_weight_kb",
    label: "Transfer size",
    shortLabel: "Weight",
    tooltip:
      "Total data downloaded to load the page. Heavier pages load slower, especially on mobile networks.",
    unit: "KB",
    lowerIsBetter: true,
    format: (v) => `${v.toFixed(1)} KB`,
    passThreshold: 1500,
    weakThreshold: 3000,
  },
];

export function evaluatePerformanceMetric(
  spec: PerformanceMetricSpec,
  value: number | null | undefined
): PerformanceMetricStatus {
  if (value == null || !Number.isFinite(value) || value <= 0) return "unknown";

  if (value <= spec.passThreshold) return "pass";
  if (value <= spec.weakThreshold) return "weak";
  return "missing";
}

export function statusLabel(status: PerformanceMetricStatus): string {
  if (status === "pass") return "Good";
  if (status === "weak") return "Needs work";
  if (status === "missing") return "Poor";
  return "Not measured";
}

export function statusTargetHint(spec: PerformanceMetricSpec): string {
  if (spec.id === "cls") return "Target ≤ 0.10";
  if (spec.id === "lcp_ms") return "Target ≤ 2.5s";
  if (spec.id === "ttfb_ms") return "Target ≤ 800 ms";
  return "Target ≤ 1.5 MB";
}

export function hasPerformanceMetrics(
  metrics: PagePerformanceMetrics | null | undefined
): boolean {
  if (!metrics) return false;
  return PERFORMANCE_METRIC_SPECS.some((spec) => {
    const value = metrics[spec.id];
    return value != null && Number.isFinite(value) && value > 0;
  });
}

export type PerformanceMetricRow = {
  spec: PerformanceMetricSpec;
  value: number | null;
  status: PerformanceMetricStatus;
};

export function buildPerformanceMetricRows(
  metrics: PagePerformanceMetrics | null | undefined
): PerformanceMetricRow[] {
  return PERFORMANCE_METRIC_SPECS.map((spec) => {
    const rawValue = metrics?.[spec.id];
    const value =
      rawValue != null && Number.isFinite(rawValue) && rawValue > 0 ? rawValue : null;
    return { spec, value, status: evaluatePerformanceMetric(spec, value) };
  });
}

export function performanceNeedsAttention(rows: PerformanceMetricRow[]): boolean {
  return rows.some(
    (row) => row.value != null && (row.status === "weak" || row.status === "missing")
  );
}
