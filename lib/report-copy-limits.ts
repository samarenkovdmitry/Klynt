import type {
  ReportCopyItem,
  ReportIssue,
  ReportMetricObservations,
  ReportSuggestion,
} from "@/lib/audit-report";

export const REPORT_COPY_LIMITS = {
  verdict: 10,
  summary: 22,
  keyObservation: 14,
  metricObservation: 8,
  issueTitle: 22,
  issueWhy: 28,
  fixRecommendation: 25,
  copyAfter: 18,
  scoreFixLabel: 8,
  leverageDetail: 28,
} as const;

export function clampWords(
  text: string | undefined | null,
  maxWords: number,
  ellipsis = false
): string {
  if (!text) return "";

  const trimmed = text.trim();
  if (!trimmed) return "";

  const words = trimmed.split(/\s+/).filter(Boolean);

  if (words.length <= maxWords) {
    return trimmed;
  }

  const clipped = words.slice(0, maxWords).join(" ");

  if (!ellipsis) {
    return clipped;
  }

  return `${clipped.replace(/[,;:—-]$/, "").trim()}…`;
}

export function clampChars(text: string | undefined | null, maxChars: number): string {
  const trimmed = text?.trim() ?? "";

  if (trimmed.length <= maxChars) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxChars - 1).trimEnd()}…`;
}

export function firstSentence(text: string | undefined | null): string {
  const trimmed = text?.trim() ?? "";

  if (!trimmed) {
    return "";
  }

  const match = trimmed.match(/^[^.!?]+[.!?]?/);
  return match?.[0]?.trim() ?? trimmed;
}

export function formatVerdictDisplay(text?: string | null) {
  return clampWords(text, REPORT_COPY_LIMITS.verdict, true);
}

export function formatSummaryDisplay(text?: string | null) {
  return clampWords(text, REPORT_COPY_LIMITS.summary, true);
}

export function formatKeyObservationDisplay(text?: string | null) {
  return clampWords(text, REPORT_COPY_LIMITS.keyObservation, true);
}

export function formatMetricObservationDisplay(text?: string | null) {
  return clampWords(text, REPORT_COPY_LIMITS.metricObservation, true);
}

export function formatIssueTitleDisplay(text?: string | null) {
  return clampWords(text, REPORT_COPY_LIMITS.issueTitle, true);
}

export function formatFixDisplay(text?: string | null) {
  return clampWords(firstSentence(text), REPORT_COPY_LIMITS.fixRecommendation, true);
}

export function formatCopyAfterDisplay(text?: string | null) {
  return clampWords(text, REPORT_COPY_LIMITS.copyAfter, true);
}

export function pickIssueFixDisplay(
  issue: ReportIssue,
  index: number,
  suggestions: ReportSuggestion[]
): string {
  const match =
    suggestions.find(
      (item) =>
        item.category &&
        issue.category &&
        String(item.category).toLowerCase() === String(issue.category).toLowerCase()
    ) ?? suggestions[index];

  const raw =
    match?.recommendation?.trim() ||
    issue.bullets?.[0]?.trim() ||
    issue.why?.trim() ||
    "";

  return formatFixDisplay(raw);
}

export function deriveScoreFixLabel(
  issue: ReportIssue,
  suggestion?: ReportSuggestion
): string {
  const fromRecommendation = formatFixDisplay(suggestion?.recommendation);

  if (fromRecommendation.length >= 12) {
    return clampWords(fromRecommendation, REPORT_COPY_LIMITS.scoreFixLabel, true);
  }

  const title = issue.title?.trim() ?? "";

  if (!title) {
    return "Address the top finding";
  }

  const actionMatch = title.match(
    /(?:^|[—–-]\s*)(Add|Replace|Clarify|Increase|Move|Show|Remove|Fix)\b[^.!?]*/i
  );

  if (actionMatch?.[0]) {
    return clampWords(actionMatch[0].replace(/^[—–-]\s*/, ""), REPORT_COPY_LIMITS.scoreFixLabel, true);
  }

  return clampWords(title, REPORT_COPY_LIMITS.scoreFixLabel, true);
}

export function formatLeverageDetailDisplay(text?: string | null) {
  return clampWords(text, REPORT_COPY_LIMITS.leverageDetail, true);
}

type CopyLengthInput = {
  verdict?: string;
  summary?: string;
  key_observation?: string;
  metric_observations?: ReportMetricObservations;
  issues?: ReportIssue[];
  suggestions?: ReportSuggestion[];
  copy?: ReportCopyItem[];
};

export function normalizeReportCopyLengths<T extends CopyLengthInput>(report: T): T {
  const metricObservations = report.metric_observations
    ? {
        ...report.metric_observations,
        trust: formatMetricObservationDisplay(report.metric_observations.trust),
        clarity: formatMetricObservationDisplay(report.metric_observations.clarity),
        friction: formatMetricObservationDisplay(report.metric_observations.friction),
        visuals: formatMetricObservationDisplay(report.metric_observations.visuals),
        overall: formatMetricObservationDisplay(report.metric_observations.overall),
      }
    : report.metric_observations;

  return {
    ...report,
    verdict: formatVerdictDisplay(report.verdict) || report.verdict,
    summary: formatSummaryDisplay(report.summary) || report.summary,
    key_observation: formatKeyObservationDisplay(report.key_observation) || report.key_observation,
    metric_observations: metricObservations,
    issues: (report.issues ?? []).map((issue) => ({
      ...issue,
      title: formatIssueTitleDisplay(issue.title) || issue.title,
      why: clampWords(issue.why, REPORT_COPY_LIMITS.issueWhy, true) || issue.why,
    })),
    suggestions: (report.suggestions ?? []).map((item) => ({
      ...item,
      recommendation: formatFixDisplay(item.recommendation) || item.recommendation,
      why: clampWords(item.why, REPORT_COPY_LIMITS.issueWhy, true) || item.why,
    })),
    copy: (report.copy ?? []).map((item) => ({
      ...item,
      after: formatCopyAfterDisplay(item.after) || item.after,
    })),
  };
}
