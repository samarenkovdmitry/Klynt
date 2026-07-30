import type { ReportChecklistItem } from "@/lib/audit-report";

import type { SignalRunResult } from "./types";

function normalizeKey(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function isDuplicateFinding(
  signal: SignalRunResult,
  llmItem: ReportChecklistItem
): boolean {
  if (signal.link_to && llmItem.link_to && signal.link_to === llmItem.link_to) {
    return true;
  }
  if (signal.checklistCategory === llmItem.category) {
    const signalKey = normalizeKey(signal.text);
    const llmKey = normalizeKey(llmItem.text);
    if (signalKey && llmKey && (signalKey.includes(llmKey) || llmKey.includes(signalKey))) {
      return true;
    }
  }
  return false;
}

/**
 * Merge LLM findings with deterministic signal failures.
 * Signal rows win on evidence when they duplicate an LLM row at the same link target.
 */
export function mergeChecklistWithSignals(
  llmItems: ReportChecklistItem[],
  signalItems: ReportChecklistItem[],
  signalResults: SignalRunResult[]
): ReportChecklistItem[] {
  const signalFailures = signalResults.filter((r) => r.status !== "pass");
  const filteredLlm = llmItems.filter(
    (llm) => !signalFailures.some((signal) => isDuplicateFinding(signal, llm))
  );

  const merged = [...signalItems, ...filteredLlm];

  return merged.sort((a, b) => {
    const statusRank = (s: ReportChecklistItem["status"]) =>
      s === "missing" ? 0 : s === "weak" ? 1 : 2;
    const rankDiff = statusRank(a.status) - statusRank(b.status);
    if (rankDiff !== 0) return rankDiff;
    return (b.impact_score ?? 0) - (a.impact_score ?? 0);
  });
}

export function signalResultsToVisualContrastFixes(
  signalResults: SignalRunResult[]
): import("@/lib/audit-report").ReportVisualFix[] {
  const contrastIds = new Set(["h1_contrast_aa", "subheadline_contrast_aa", "cta_contrast_aa"]);

  return signalResults
    .filter((r) => contrastIds.has(r.id) && r.status !== "pass")
    .map((r) => ({
      dimension: "color_contrast" as const,
      title: r.text,
      observation: `${r.measured?.element ?? "Text"} — ${r.evidence}`,
      recommendation: r.fix,
      impact: r.status === "missing" ? ("high" as const) : ("medium" as const),
      element: String(r.measured?.element ?? ""),
    }));
}
