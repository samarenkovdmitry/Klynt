import type {
  ChecklistCategory,
  ChecklistItemStatus,
  ChecklistLinkTarget,
} from "@/lib/audit-report";
import type { ExtractionResult, PageMetaSnapshot } from "@/lib/analysis/extraction";
import type { PageComputedValues, PagePerformanceMetrics } from "@/lib/audit-report";

export type SignalStatus = "pass" | "weak" | "missing";

/** Groups signals for the methodology panel (6 categories). */
export type SignalMethodologyCategory =
  | "messaging_clarity"
  | "trust_signals"
  | "visual_hierarchy"
  | "conversion_friction"
  | "copy_specificity"
  | "technical_meta";

export type SignalContext = {
  computedValues: PageComputedValues | null;
  mobileComputedValues: PageComputedValues | null;
  pageMeta: PageMetaSnapshot | null;
  extraction: ExtractionResult;
  performanceMetrics: PagePerformanceMetrics | null;
};

export type SignalDefinition = {
  id: string;
  methodologyCategory: SignalMethodologyCategory;
  checklistCategory: ChecklistCategory;
  link_to: ChecklistLinkTarget | null;
  /** When status is not pass — short title for checklist row. */
  failTitle: string;
  /** Imperative fix sentence when status is not pass. */
  fix: string;
  /** Optional body explaining why it matters. */
  why?: string;
  evaluate: (ctx: SignalContext) => SignalEvaluation | null;
};

export type SignalEvaluation = {
  status: SignalStatus;
  /** Shown as checklist evidence — keep under ~50 chars when possible. */
  evidence: string;
  /** Override default fail title when the measurement is specific. */
  title?: string;
  /** Numeric or structured measurement for hero slots / exports. */
  measured?: Record<string, string | number | boolean | undefined>;
  impact_score?: number;
};

export type SignalRunResult = {
  id: string;
  status: SignalStatus;
  methodologyCategory: SignalMethodologyCategory;
  checklistCategory: ChecklistCategory;
  link_to: ChecklistLinkTarget | null;
  text: string;
  evidence: string;
  body?: string;
  fix: string;
  measured?: Record<string, string | number | boolean | undefined>;
  impact_score?: number;
};

export type MethodologyStats = {
  totalSignals: number;
  byCategory: Record<SignalMethodologyCategory, number>;
};

export const METHODOLOGY_CATEGORY_LABELS: Record<
  SignalMethodologyCategory,
  { label: string; tags: string }
> = {
  messaging_clarity: { label: "Messaging clarity", tags: "AUDIENCE, VALUE" },
  trust_signals: { label: "Trust signals", tags: "PROOF, LOGOS" },
  visual_hierarchy: { label: "Visual hierarchy", tags: "FOCUS, CONTRAST" },
  conversion_friction: { label: "Conversion friction", tags: "CTA, FORMS" },
  copy_specificity: { label: "Copy specificity", tags: "CONCRETENESS" },
  technical_meta: { label: "Technical & meta", tags: "TITLES, A11Y" },
};

export function statusToChecklistStatus(status: SignalStatus): ChecklistItemStatus {
  if (status === "pass") return "pass";
  if (status === "missing") return "missing";
  return "weak";
}
