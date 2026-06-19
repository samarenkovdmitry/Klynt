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

/** Effort/impact label for suggestions and copy cards (not percentage-based). */
export type ReportPriority = "quick_win" | "high_impact" | "medium_impact";

export type ReportIssue = ImpactFields & {
  category?: ReportCategory | string;
  title?: string;
  bullets?: string[];
  why?: string;
  severity?: "low" | "medium" | "high";
};

export type ReportSuggestion = {
  category?: ReportCategory | string;
  section?: string;
  recommendation?: string;
  why?: string;
  priority?: ReportPriority;
};

export type ReportCopyItem = {
  section?: string;
  before?: string;
  after?: string;
  why?: string;
  priority?: ReportPriority;
};

export type HeadlineDirectionOption = {
  label: string;
  text: string;
};

export type HeadlineDirections = {
  before?: string;
  /** Short note on what is weak about the current headline (max ~24 words). */
  gap?: string;
  context?: string;
  options: HeadlineDirectionOption[];
};

export type BrandStage = "just_launched" | "growing" | "established";

export type TrafficSource = "cold" | "warm" | "mixed";

export type AudienceType = "b2b" | "b2c" | "both";

export type ReportBreakdown = {
  clarity?: number;
  trust?: number;
  friction?: number;
  visuals?: number;
  /** @deprecated kept for old stored reports */
  conversion?: number;
  /** @deprecated kept for old stored reports */
  navigation?: number;
};

/** Consultant-style observations for summary metric cards (12–16 words each). */
export type ReportMetricObservations = {
  trust?: string;
  clarity?: string;
  friction?: string;
  visuals?: string;
  overall?: string;
};

export type ChecklistItemStatus = "pass" | "missing" | "weak";
export type ChecklistLinkTarget =
  | "copy-headline"
  | "copy-cta"
  | "copy-subheadline"
  | "trust"
  | "visual-fixes"
  | "structure-nav"
  | "hero-density";
export type ChecklistCategory = "copy" | "trust" | "visual" | "structure";

export type ReportChecklistItem = {
  id: string;
  text: string;
  /** Short label for Copy studio badges (3–5 words). */
  gap_label?: string;
  status: ChecklistItemStatus;
  link_to: ChecklistLinkTarget | null;
  category: ChecklistCategory;
};

export type CopyVariant = {
  label: string;
  text: string;
};

export type CopyVariantBlock = {
  current: string;
  variants: CopyVariant[];
};

export type ReportCopyVariants = {
  headline: CopyVariantBlock;
  cta: CopyVariantBlock;
  subheadline: CopyVariantBlock;
};

export type ScorePotentialChip = {
  label: string;
  delta: string;
};

export type ReportScorePotential = {
  target: number;
  chips: ScorePotentialChip[];
};

export type ReportMeta = {
  title_suggestion: string;
  description_suggestion: string;
  /** Actionable trust proof to add (e.g. "Add CISO quote below CTA"). */
  proof_suggestion?: string;
  /** Extra trust observations (logos, CTA reassurance, etc.). */
  trust_notes?: string[];
};

export type VisualFixDimension =
  | "border_radius"
  | "density"
  | "color_tone"
  | "spacing"
  | "cta_hierarchy"
  | "typography"
  | "depth"
  | "navigation"
  | "social_proof"
  | "headline_formula"
  | "color_contrast";

export type ReportVisualFix = {
  dimension: VisualFixDimension;
  observation: string;
  recommendation: string;
};

export type ReportVisualPass = {
  dimension: VisualFixDimension;
  note: string;
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
  /** Pre-rendered 1200×630 PNG for social link previews (data URL). */
  ogPreviewImage?: string;
  metric_observations?: ReportMetricObservations;
  breakdown?: ReportBreakdown;
  checklist?: ReportChecklistItem[];
  copy_variants?: ReportCopyVariants;
  score_potential?: ReportScorePotential;
  meta?: ReportMeta;
  /** Context-aware visual/design recommendations from screenshot analysis. */
  visual_fixes?: ReportVisualFix[];
  /** Dimensions reviewed and aligned with product context. */
  visual_passes?: ReportVisualPass[];
  /** @deprecated use checklist + copy_variants instead */
  issues?: ReportIssue[];
  /** @deprecated use copy_variants instead */
  suggestions?: ReportSuggestion[];
  /** @deprecated use copy_variants instead */
  copy?: ReportCopyItem[];
  brand_stage?: BrandStage;
  traffic_source?: TrafficSource;
  audience_type?: AudienceType;
  headline_directions?: HeadlineDirections;
  error?: string;
};

export function isAuditReport(json: unknown): json is AuditReport {
  if (!json || typeof json !== "object") return false;

  const data = json as AuditReport;

  if (typeof data.error === "string" && data.error.length > 0) return false;

  const hasScore = Number.isFinite(Number(data.score));
  const hasChecklist = Array.isArray(data.checklist) && data.checklist.length > 0;
  const hasIssues = Array.isArray(data.issues) && data.issues.length > 0;

  return hasScore && (hasChecklist || hasIssues);
}
