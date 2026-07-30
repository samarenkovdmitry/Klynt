export { SIGNAL_REGISTRY, getMethodologyStats } from "./registry";
export { METHODOLOGY_CATEGORY_LABELS } from "./types";
export type { MethodologyStats } from "./types";
export {
  runDeterministicSignals,
  signalResultsToChecklistItems,
  pickWorstContrastFailure,
  getSignalPassCount,
} from "./run-signals";
export {
  mergeChecklistWithSignals,
  signalResultsToVisualContrastFixes,
} from "./merge-checklist";
export { buildContrastHeroSlot, deriveHeroSlotWithSignals } from "./hero-contrast-slot";
export {
  blendScoreWithSignals,
  deriveBreakdownFromSignals,
  deriveConfidenceFromSignals,
} from "./score";
export { buildMobileDesktopComparison, mobileElementMissing } from "./mobile-comparison";
export type { MobileDesktopComparison } from "./mobile-comparison";
export {
  contrastRatio,
  formatRatio,
  measureContrast,
  parseCssColor,
  suggestAaForeground,
} from "./wcag-contrast";
export type {
  SignalContext,
  SignalDefinition,
  SignalEvaluation,
  SignalMethodologyCategory,
  SignalRunResult,
  SignalStatus,
} from "./types";
