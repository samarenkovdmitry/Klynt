/**
 * Freemium preview mode for report workspace.
 *
 * - Checklist + verdict: always free
 * - Copy studio / score chips / meta copy: visual Pro locks (content visible)
 * - Export grid + PDF: hard-gated until Stripe Pro ships
 */
export const freemium = {
  enabled: true,
  waitlistStorageKey: "klynt-pro-waitlist-joined",
  /** First N variants per copy block stay fully interactive */
  maxFreeCopyVariants: 1,
  /** Block clipboard export cards + PDF */
  hardLockExport: true,
} as const;

export function isFreemiumEnabled() {
  return freemium.enabled;
}

export type ProUpgradeTrigger =
  | "copy-variant"
  | "score-breakdown"
  | "meta-copy"
  | "export-pdf"
  | "export-copy-deck"
  | "export-designer-brief"
  | "export-dev-tasks"
  | "export-notion-slack"
  | "sticky-bar";

export type FreemiumLockedSummary = {
  domain: string;
  lockedCopyVariants: number;
  lockedExportFormats: number;
  lockedScoreChips: number;
};

export type RequestProUpgrade = (trigger?: ProUpgradeTrigger) => void;
