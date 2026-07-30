import type { ContrastNumericSlot } from "@/components/report-v2/ReportHero";
import type { AuditReport } from "@/lib/audit-report";

import type { SignalRunResult } from "./types";
import { pickWorstContrastFailure } from "./run-signals";

export function buildContrastHeroSlot(
  failure: SignalRunResult,
  report: Pick<AuditReport, "copy_variants">
): ContrastNumericSlot | null {
  const ratioLabel = String(failure.measured?.ratioLabel ?? "");
  const foregroundHex = String(failure.measured?.foregroundHex ?? "#6B7280");
  const backgroundHex = String(failure.measured?.backgroundHex ?? "#FFFFFF");
  const suggested = String(failure.measured?.suggestedForegroundHex ?? "#111827");
  const element = String(failure.measured?.element ?? "Hero text");
  const sampleText =
    element.includes("CTA")
      ? report.copy_variants?.cta?.current || "Get started"
      : element.includes("sub")
        ? report.copy_variants?.subheadline?.current || "Your product outcome in one line"
        : report.copy_variants?.headline?.current || "Your headline here";

  if (!ratioLabel) return null;

  return {
    type: "contrast_numeric",
    title: failure.text,
    description:
      failure.body ??
      `${element} contrast is below WCAG AA. Visitors on mobile and bright screens will struggle to read it.`,
    ratio: ratioLabel.replace(":1", ""),
    label: `${element} contrast ratio`,
    before_hex: foregroundHex,
    after_hex: suggested,
    after_label: "Suggested AA-safe color",
    before_context: backgroundHex,
    side_by_side: {
      text: sampleText.slice(0, 80),
      bg_before: backgroundHex,
      color_before: foregroundHex,
      color_after: suggested,
    },
  };
}

export function deriveHeroSlotWithSignals(
  report: AuditReport,
  signalResults: SignalRunResult[],
  fallback: () => import("@/components/report-v2/ReportHero").HeroSlot
): import("@/components/report-v2/ReportHero").HeroSlot {
  const worstContrast = pickWorstContrastFailure(signalResults);
  if (!worstContrast) {
    return fallback();
  }

  const contrastSlot = buildContrastHeroSlot(worstContrast, report);
  if (!contrastSlot) {
    return fallback();
  }

  // Use measured contrast hero when it's the highest-impact issue.
  const topSignal = signalResults
    .filter((r) => r.status !== "pass")
    .sort((a, b) => (b.impact_score ?? 0) - (a.impact_score ?? 0))[0];

  if (topSignal?.id === worstContrast.id) {
    return contrastSlot;
  }

  return fallback();
}
