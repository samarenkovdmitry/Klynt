import type { SignalRunResult } from "./types";
import { getSignalPassCount } from "./run-signals";

/** Confidence blends LLM narrative with deterministic signal coverage. */
export function deriveConfidenceFromSignals(
  signalResults: SignalRunResult[],
  base = 82
): number {
  if (!signalResults.length) return base;
  const passRate = getSignalPassCount(signalResults) / signalResults.length;
  return Math.round(Math.min(96, Math.max(68, base * 0.55 + passRate * 100 * 0.45)));
}

/** Soft blend: LLM score stays primary; signals pull up/down by up to ~0.8 pts. */
export function blendScoreWithSignals(
  llmScore: number,
  signalResults: SignalRunResult[]
): number {
  if (!signalResults.length) return llmScore;
  const passRate = getSignalPassCount(signalResults) / signalResults.length;
  const signalScore = passRate * 10;
  const blended = llmScore * 0.82 + signalScore * 0.18;
  return Math.round(Math.max(0, Math.min(10, blended)) * 10) / 10;
}

export function deriveBreakdownFromSignals(
  signalResults: SignalRunResult[],
  llmFindings: { type: string }[]
): { clarity: number; trust: number; friction: number; visuals: number } {
  const failCategory = (category: SignalRunResult["checklistCategory"]) =>
    signalResults.some((s) => s.checklistCategory === category && s.status !== "pass");
  const failMethodology = (category: SignalRunResult["methodologyCategory"]) =>
    signalResults.some((s) => s.methodologyCategory === category && s.status !== "pass");

  return {
    clarity:
      failCategory("copy") || llmFindings.some((f) => f.type === "clarity") ? 55 : 80,
    trust: failCategory("trust") || llmFindings.some((f) => f.type === "trust") ? 55 : 80,
    friction:
      failMethodology("conversion_friction") ||
      signalResults.some((s) => s.id.includes("ttfb") || s.id.includes("lcp") || s.id.includes("page_weight")) ||
      llmFindings.some((f) => f.type === "friction" || f.type === "performance")
        ? 55
        : 80,
    visuals:
      signalResults.some((s) => s.id.includes("contrast") && s.status !== "pass") ||
      failCategory("visual")
        ? 55
        : 75,
  };
}
