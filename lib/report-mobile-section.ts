import type { PageComputedValues, ReportChecklistItem } from "@/lib/audit-report";
import {
  buildMobileDesktopComparison,
  mobileElementMissing,
  mobilePrimaryCtaRegression,
} from "@/lib/signals/mobile-comparison";

export type MobileSectionExtra = {
  id: string;
  title: string;
  detail?: string;
  fix?: string;
};

const MOBILE_SIGNAL_IDS = new Set([
  "mobile_viewport_meta",
  "mobile_cta_visible",
  "mobile_primary_cta_regression",
  "mobile_h1_visible",
  "mobile_subheadline_visible",
  "mobile_h1_contrast_regression",
  "mobile_cta_contrast_regression",
]);

const VISIBILITY_SIGNAL_FIELDS: Record<string, "h1" | "sub" | "cta"> = {
  mobile_h1_visible: "h1",
  mobile_subheadline_visible: "sub",
  mobile_cta_visible: "cta",
};

export function getMobileSignalId(item: ReportChecklistItem): string {
  if (item.id.startsWith("signal-")) return item.id.slice("signal-".length);
  return item.id;
}

export function isMobileSignalChecklistItem(item: ReportChecklistItem): boolean {
  return MOBILE_SIGNAL_IDS.has(getMobileSignalId(item));
}

export function verifyMobileChecklistIssue(
  item: ReportChecklistItem,
  desktop: PageComputedValues | null | undefined,
  mobile: PageComputedValues | null | undefined
): boolean {
  const signalId = getMobileSignalId(item);
  const comparison = buildMobileDesktopComparison(desktop ?? null, mobile ?? null);

  const visibilityField = VISIBILITY_SIGNAL_FIELDS[signalId];
  if (visibilityField) {
    const missing = mobileElementMissing(desktop ?? null, mobile ?? null, visibilityField);
    return missing === true;
  }

  if (signalId === "mobile_primary_cta_regression") {
    return mobilePrimaryCtaRegression(desktop ?? null, mobile ?? null) === true;
  }

  if (signalId === "mobile_h1_contrast_regression") {
    return comparison?.h1_contrast_regression === true;
  }

  if (signalId === "mobile_cta_contrast_regression") {
    return comparison?.cta_contrast_regression === true;
  }

  return true;
}

export function getMobileChecklistIssues(
  checklist: ReportChecklistItem[] = [],
  desktop?: PageComputedValues | null,
  mobile?: PageComputedValues | null
): ReportChecklistItem[] {
  const candidates = checklist.filter(
    (item) => isMobileSignalChecklistItem(item) && item.status !== "pass"
  );

  if (!desktop && !mobile) return candidates;

  return candidates.filter((item) => verifyMobileChecklistIssue(item, desktop, mobile));
}

export function hasMobileSectionData(input: {
  mobileComputedValues?: PageComputedValues | null;
  mobilePreviewImage?: string;
  checklist?: ReportChecklistItem[];
  computedValues?: PageComputedValues | null;
}): boolean {
  if (input.mobileComputedValues || input.mobilePreviewImage) return true;

  return (
    getMobileChecklistIssues(
      input.checklist,
      input.computedValues,
      input.mobileComputedValues
    ).length > 0
  );
}

export function mobileSectionHeaderSuffix(issueCount: number, extraCount = 0): string {
  const total = issueCount + extraCount;
  if (total === 0) return "Good";
  return total === 1 ? "1 needs work" : `${total} need work`;
}

function issuesCoverSignal(issues: ReportChecklistItem[], signalId: string): boolean {
  return issues.some((item) => getMobileSignalId(item) === signalId);
}

/** Derived mobile-only deltas not always present as checklist rows. */
export function buildMobileSectionExtras(
  issues: ReportChecklistItem[],
  desktop?: PageComputedValues | null,
  mobile?: PageComputedValues | null
): MobileSectionExtra[] {
  if (!desktop || !mobile) return [];

  const comparison = buildMobileDesktopComparison(desktop, mobile);
  const extras: MobileSectionExtra[] = [];

  if (
    comparison?.h1_contrast_regression &&
    !issuesCoverSignal(issues, "mobile_h1_contrast_regression")
  ) {
    extras.push({
      id: "mobile-extra-h1-contrast",
      title: "Headline contrast fails on mobile",
      detail: "Passes WCAG AA on desktop, fails at 390px",
      fix: "Adjust mobile hero text or background colors when the layout stacks.",
    });
  }

  if (
    comparison?.cta_contrast_regression &&
    !issuesCoverSignal(issues, "mobile_cta_contrast_regression")
  ) {
    extras.push({
      id: "mobile-extra-cta-contrast",
      title: "CTA contrast fails on mobile",
      detail: "Button contrast passes on desktop, fails at 390px",
      fix: "Strengthen mobile button colors — ghost and outline variants often regress on small screens.",
    });
  }

  if (desktop.nav_has_sticky && !mobile.nav_has_sticky) {
    extras.push({
      id: "mobile-extra-sticky-nav",
      title: "No sticky signup bar on mobile",
      detail: "Desktop keeps a persistent nav/CTA; mobile header scrolls away",
      fix: "Add a sticky mobile header with the primary CTA after the first scroll.",
    });
  }

  if (
    desktop.social_proof_found &&
    desktop.social_proof_above_fold &&
    !mobile.social_proof_above_fold
  ) {
    extras.push({
      id: "mobile-extra-social-proof",
      title: "Social proof drops below the fold on mobile",
      detail: "Trust signals visible above the fold on desktop, not at 390px",
      fix: "Keep logos, ratings, or customer counts in the first mobile screen.",
    });
  }

  return extras.slice(0, 1);
}

export function buildMobileSectionNarrative(input: {
  issues: ReportChecklistItem[];
  desktop?: PageComputedValues | null;
  mobile?: PageComputedValues | null;
}): string {
  const { issues, desktop, mobile } = input;
  const comparison = buildMobileDesktopComparison(desktop ?? null, mobile ?? null);

  if (mobilePrimaryCtaRegression(desktop ?? null, mobile ?? null)) {
    const desktopCta = desktop?.cta_text?.trim();
    const mobileCta = mobile?.cta_text?.trim();

    if (desktopCta && mobileCta) {
      return `Desktop leads with “${desktopCta}”, but at 390px the hero surfaces “${mobileCta}” instead — the primary signup action is likely below the fold or replaced by secondary chrome.`;
    }

    if (desktopCta) {
      return `Desktop shows “${desktopCta}” above the fold, but that action isn't detected in the mobile hero at 390px — visitors may scroll past the main conversion path.`;
    }
  }

  if (comparison?.cta_missing_on_mobile) {
    const cta = desktop?.cta_text?.trim();
    if (cta) {
      return `Desktop shows “${cta}” above the fold, but that CTA isn't detected at 390px — mobile visitors may miss your main conversion path.`;
    }
    return "The primary CTA isn't detected in the mobile hero at 390px. Most landing traffic is mobile, so this removes the main action before visitors scroll.";
  }

  if (comparison?.h1_missing_on_mobile) {
    return "The hero headline renders on desktop but disappears on mobile — visitors on phones may not see what you offer in the first screen.";
  }

  if (comparison?.h1_contrast_regression) {
    return "Headline contrast passes on desktop but fails WCAG AA at 390px — a common responsive regression when mobile hero backgrounds change.";
  }

  if (comparison?.cta_contrast_regression) {
    return "The primary button meets contrast on desktop but falls below WCAG AA on mobile — outline or ghost variants often break on smaller layouts.";
  }

  if (issues.length === 0) {
    return "At 390px, the hero keeps headline, subheadline, and primary CTA aligned with desktop — mobile layout preserves the conversion path.";
  }

  return issues[0]?.body ?? issues[0]?.text ?? "Mobile layout at 390px has issues that don't appear on desktop.";
}
