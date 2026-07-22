/** Shared heuristics for hero subheadline + primary CTA DOM extraction. */

export const LEGAL_BOILERPLATE_PATTERN_SOURCES = [
  String.raw`\bby signing up\b`,
  String.raw`\bagree to (?:our |the )?(?:terms|privacy|policy)\b`,
  String.raw`\bterms of (?:service|use)\b`,
  String.raw`\bprivacy policy\b`,
  String.raw`\bcookie policy\b`,
  String.raw`\bwe (?:use|process) cookies\b`,
  String.raw`\bconsent to\b`,
  String.raw`\bGDPR\b`,
  String.raw`\bby continuing\b`,
  String.raw`\bby clicking\b.*\bagree\b`,
  String.raw`\baccept (?:all )?cookies\b`,
  String.raw`\bmanage cookies\b`,
  String.raw`\bdata processing\b`,
];

const LEGAL_BOILERPLATE_PATTERNS = LEGAL_BOILERPLATE_PATTERN_SOURCES.map(
  (source) => new RegExp(source, "i")
);

/** Nav / utility links that are rarely the hero primary CTA. */
const NAV_LIKE_CTA_PATTERN =
  /^(?:features?|pricing|about(?: us)?|blog|contact(?: us)?|login|log in|sign in|resources?|product|solutions?|demo|learn more|customers?|integrations?|careers|docs|documentation|support|help|faq|news|partners?|security|platform|industries|why(?: us)?)$/i;

const GENERIC_CTA_PATTERN =
  /^(?:click here|submit|continue|next|learn more|read more|discover|explore|see more)$/i;

export function isLegalBoilerplate(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) return false;
  return LEGAL_BOILERPLATE_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function isNavLikeCtaLabel(text: string): boolean {
  const normalized = text.trim();
  if (!normalized || normalized.length > 48) return true;
  return NAV_LIKE_CTA_PATTERN.test(normalized) || GENERIC_CTA_PATTERN.test(normalized);
}

export function sanitizeSubheadlineText(text: string | null | undefined): string | null {
  const normalized = text?.trim() ?? "";
  if (!normalized || isLegalBoilerplate(normalized)) return null;
  if (normalized.length < 12) return null;
  return normalized.slice(0, 120);
}

export function sanitizeCtaText(text: string | null | undefined): string | null {
  const normalized = text?.trim() ?? "";
  if (!normalized || isNavLikeCtaLabel(normalized)) return null;
  return normalized.slice(0, 80);
}

export function getHeroDomSignalPatterns() {
  return {
    legalPatternSources: LEGAL_BOILERPLATE_PATTERN_SOURCES,
    navLikePatternSource: NAV_LIKE_CTA_PATTERN.source,
  };
}
