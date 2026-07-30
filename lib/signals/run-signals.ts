import type { ReportChecklistItem } from "@/lib/audit-report";
import type { ExtractionResult, PageMetaSnapshot } from "@/lib/analysis/extraction";
import type { PageComputedValues, PagePerformanceMetrics } from "@/lib/audit-report";

import { SIGNAL_REGISTRY } from "./registry";
import type { SignalContext, SignalRunResult } from "./types";
import { statusToChecklistStatus } from "./types";

export function runDeterministicSignals(input: {
  computedValues: PageComputedValues | null;
  mobileComputedValues?: PageComputedValues | null;
  pageMeta: PageMetaSnapshot | null;
  extraction: ExtractionResult;
  performanceMetrics?: PagePerformanceMetrics | null;
}): SignalRunResult[] {
  const ctx: SignalContext = {
    computedValues: input.computedValues,
    mobileComputedValues: input.mobileComputedValues ?? null,
    pageMeta: input.pageMeta,
    extraction: input.extraction,
    performanceMetrics: input.performanceMetrics ?? null,
  };

  const results: SignalRunResult[] = [];

  for (const signal of SIGNAL_REGISTRY) {
    const evaluation = signal.evaluate(ctx);
    if (!evaluation) continue;

    results.push({
      id: signal.id,
      status: evaluation.status,
      methodologyCategory: signal.methodologyCategory,
      checklistCategory: signal.checklistCategory,
      link_to: signal.link_to,
      text: evaluation.title ?? signal.failTitle,
      evidence: evaluation.evidence,
      body: signal.why,
      fix: signal.fix,
      measured: evaluation.measured,
      impact_score: evaluation.impact_score,
    });
  }

  return results;
}

export function signalResultsToChecklistItems(results: SignalRunResult[]): ReportChecklistItem[] {
  return results
    .filter((r) => r.status !== "pass")
    .map((item) => ({
      id: `signal-${item.id}`,
      text: item.text,
      evidence: item.evidence,
      body: item.body,
      status: statusToChecklistStatus(item.status),
      link_to: item.link_to,
      category: item.checklistCategory,
      impact_score: item.impact_score,
      fix: item.fix,
      gap_label: item.text.split(" ").slice(0, 4).join(" "),
    }));
}

/** Worst failing contrast measurement — used for contrast_numeric hero slot. */
export function pickWorstContrastFailure(results: SignalRunResult[]): SignalRunResult | null {
  const contrastIds = new Set(["h1_contrast_aa", "subheadline_contrast_aa", "cta_contrast_aa"]);
  const failures = results.filter(
    (r) => contrastIds.has(r.id) && r.status !== "pass" && r.measured?.ratio !== undefined
  );
  if (!failures.length) return null;

  return failures.reduce((worst, current) => {
    const wRatio = Number(worst.measured?.ratio ?? 999);
    const cRatio = Number(current.measured?.ratio ?? 999);
    return cRatio < wRatio ? current : worst;
  });
}

export function getSignalPassCount(results: SignalRunResult[]): number {
  return results.filter((r) => r.status === "pass").length;
}
