import type { PagePerformanceMetrics } from "@/lib/audit-report";
import type { SignalRunResult } from "@/lib/signals/types";
import { getSignalPassCount } from "@/lib/signals/run-signals";

export type BenchmarkCohortSample = {
  report_id: string;
  score: number;
  issue_count: number;
  signal_pass_rate: number | null;
  lcp_ms: number | null;
  page_weight_kb: number | null;
};

export type ReportBenchmark = {
  sample_size: number;
  /** 0–100 — share of cohort this page beats on overall score. */
  score_percentile: number;
  /** 0–100 — share of cohort with more open issues (higher = fewer issues than peers). */
  issues_percentile: number;
  /** 0–100 — signal pass rate vs cohort when available. */
  signal_pass_percentile: number | null;
  cohort_median_score: number;
  cohort_avg_score: number;
  cohort_median_issues: number;
  performance: {
    lcp_percentile: number | null;
    page_weight_percentile: number | null;
  };
  /** Short sentence for narrative / exports. */
  summary: string;
};

function percentileRank(
  value: number,
  samples: number[],
  higherIsBetter: boolean
): number | null {
  if (!samples.length) return null;
  const betterCount = samples.filter((sample) =>
    higherIsBetter ? sample <= value : sample >= value
  ).length;
  return Math.round((betterCount / samples.length) * 100);
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildBenchmarkSummary(input: {
  scorePercentile: number;
  sampleSize: number;
  cohortMedianScore: number;
  score: number;
}): string {
  const { scorePercentile, sampleSize, cohortMedianScore, score } = input;

  if (sampleSize < 5) {
    return "Not enough prior audits in the database to benchmark this page yet.";
  }

  if (scorePercentile >= 65) {
    return `Score ${score.toFixed(1)}/10 beats ${scorePercentile}% of ${sampleSize} recent landing pages (cohort median ${cohortMedianScore.toFixed(1)}).`;
  }

  if (scorePercentile >= 40) {
    return `Score ${score.toFixed(1)}/10 is near the middle of ${sampleSize} recent audits (median ${cohortMedianScore.toFixed(1)}).`;
  }

  return `Score ${score.toFixed(1)}/10 trails ${100 - scorePercentile}% of ${sampleSize} recent landing pages (median ${cohortMedianScore.toFixed(1)}).`;
}

export function computeReportBenchmark(input: {
  score: number;
  signalResults: SignalRunResult[];
  performanceMetrics: PagePerformanceMetrics | null | undefined;
  cohort: BenchmarkCohortSample[];
}): ReportBenchmark | null {
  const cohort = input.cohort.filter((sample) => Number.isFinite(sample.score));
  if (!cohort.length) return null;

  const issueCount = input.signalResults.filter((result) => result.status !== "pass").length;
  const signalPassRate = input.signalResults.length
    ? getSignalPassCount(input.signalResults) / input.signalResults.length
    : null;

  const scores = cohort.map((sample) => sample.score);
  const issueCounts = cohort.map((sample) => sample.issue_count);
  const passRates = cohort
    .map((sample) => sample.signal_pass_rate)
    .filter((value): value is number => value != null);
  const lcpSamples = cohort
    .map((sample) => sample.lcp_ms)
    .filter((value): value is number => value != null && value > 0);
  const weightSamples = cohort
    .map((sample) => sample.page_weight_kb)
    .filter((value): value is number => value != null && value > 0);

  const scorePercentile =
    percentileRank(input.score, scores, true) ?? 50;
  const issuesPercentile =
    percentileRank(issueCount, issueCounts, false) ?? 50;
  const signalPassPercentile =
    signalPassRate != null && passRates.length >= 3
      ? percentileRank(signalPassRate, passRates, true)
      : null;

  const lcp = input.performanceMetrics?.lcp_ms;
  const pageWeight = input.performanceMetrics?.page_weight_kb;

  return {
    sample_size: cohort.length,
    score_percentile: scorePercentile,
    issues_percentile: issuesPercentile,
    signal_pass_percentile: signalPassPercentile,
    cohort_median_score: Math.round(median(scores) * 10) / 10,
    cohort_avg_score: Math.round(average(scores) * 10) / 10,
    cohort_median_issues: Math.round(median(issueCounts)),
    performance: {
      lcp_percentile:
        lcp != null && lcp > 0 && lcpSamples.length >= 3
          ? percentileRank(lcp, lcpSamples, false)
          : null,
      page_weight_percentile:
        pageWeight != null && pageWeight > 0 && weightSamples.length >= 3
          ? percentileRank(pageWeight, weightSamples, false)
          : null,
    },
    summary: buildBenchmarkSummary({
      scorePercentile,
      sampleSize: cohort.length,
      cohortMedianScore: median(scores),
      score: input.score,
    }),
  };
}

export function benchmarkToChecklistItems(
  benchmark: ReportBenchmark | null
): import("@/lib/audit-report").ReportChecklistItem[] {
  if (!benchmark || benchmark.sample_size < 5) return [];

  const items: import("@/lib/audit-report").ReportChecklistItem[] = [];

  if (benchmark.score_percentile < 35) {
    items.push({
      id: "benchmark-score-trails-cohort",
      text: "Overall score trails similar landing pages",
      evidence: `${benchmark.score_percentile}th percentile`,
      body: benchmark.summary,
      status: "weak",
      link_to: "structure-nav",
      category: "structure",
      impact_score: 50,
      fix: "Prioritize the highest-impact checklist fixes — this page scores below most recent audits in our database.",
      gap_label: "Below cohort median",
    });
  }

  if (
    benchmark.performance.lcp_percentile != null &&
    benchmark.performance.lcp_percentile < 30
  ) {
    items.push({
      id: "benchmark-lcp-trails-cohort",
      text: "LCP slower than peer landing pages",
      evidence: `${benchmark.performance.lcp_percentile}th percentile`,
      status: "weak",
      link_to: "structure-nav",
      category: "structure",
      impact_score: 45,
      fix: "Compress hero media and reduce render-blocking assets — load speed lags most pages in the benchmark set.",
      gap_label: "Slow vs peers",
    });
  }

  return items;
}
