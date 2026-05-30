export type ReportCategory =
  | "Clarity"
  | "Navigation"
  | "Visuals"
  | "Trust"
  | "Conversion";

export type ImpactFields = {
  impact_metric_1?: string;
  impact_value_1?: number | string;
  impact_metric_2?: string;
  impact_value_2?: number | string;
};

export type ReportIssue = ImpactFields & {
  category?: ReportCategory | string;
  title?: string;
  bullets?: string[];
  why?: string;
  severity?: "low" | "medium" | "high";
};

export type ReportSuggestion = ImpactFields & {
  category?: ReportCategory | string;
  section?: string;
  recommendation?: string;
  why?: string;
};

export type ReportCopyItem = ImpactFields & {
  section?: string;
  before?: string;
  after?: string;
  why?: string;
};

export type ReportBreakdown = {
  clarity?: number;
  trust?: number;
  conversion?: number;
  navigation?: number;
  visuals?: number;
};

/** Consultant-style observations for summary metric cards (12–16 words each). */
export type ReportMetricObservations = {
  trust?: string;
  clarity?: string;
  friction?: string;
  overall?: string;
};

export type AuditRisk = "low" | "medium" | "high";

export type AuditReport = {
  url?: string;
  score: number;
  risk?: AuditRisk | string;
  summary?: string;
  verdict?: string;
  key_observation?: string;
  confidence?: number;
  generatedAt?: string;
  /** Hero screenshot preview for report card (data URL or HTTPS URL). */
  previewImage?: string;
  /** Pre-rendered 1200×630 JPEG for social link previews (data URL). */
  ogPreviewImage?: string;
  metric_observations?: ReportMetricObservations;
  breakdown?: ReportBreakdown;
  issues: ReportIssue[];
  suggestions?: ReportSuggestion[];
  copy?: ReportCopyItem[];
  error?: string;
};

export function isAuditReport(json: unknown): json is AuditReport {
  if (!json || typeof json !== "object") return false;

  const data = json as AuditReport;

  if (typeof data.error === "string" && data.error.length > 0) return false;

  const hasScore = Number.isFinite(Number(data.score));
  const hasIssues = Array.isArray(data.issues) && data.issues.length > 0;

  return hasScore && hasIssues;
}
