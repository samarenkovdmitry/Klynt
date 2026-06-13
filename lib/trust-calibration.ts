import type { ReportChecklistItem, ReportCopyVariants, ReportMeta } from "@/lib/audit-report";

const SOCIAL_PROOF_PATTERNS = [
  /\d[\d,.\s]*\+?\s*(landing pages|pages|audits?|users?|customers?|teams|companies|startups|reviews?|merchants|transactions?)\b/i,
  /\b(landing pages|pages|audits?) audited\b/i,
  /\baudited so far\b/i,
  /\b(used|trusted|chosen|loved)\s+by\b/i,
  /\b(over|more than)\s+\d[\d,]+/i,
  /\bjoin(ed)?\s+\d[\d,]+/i,
  /\b\d[\d,]+(\+)?\s+(happy|satisfied)\s+(customers?|users?|teams?)?\b/i,
  /\b(as seen in|featured in)\b/i,
  /\b\d(\.\d)?\s*\/\s*5\b/,
  /\b(g2|capterra|trustpilot|product hunt)\b/i,
  /\bproduct hunt\b/i,
  /\b(soc ?2|iso ?27001|hipaa|gdpr compliant)\b/i,
  /\b(customer|client|partner|press)\s+logos?\b/i,
  /\b\d+\+?\s+(countries|languages)\b/i,
  /\$\d[\d,.]*[kmb]?\+?\s*(settled|processed|transacted|value settled)/i,
  /\b\d[\d,]+\+?\s+(merchants|onboarded|customers|users)\b/i,
  /\b\d[\d,]+\+?\s+onchain transactions\b/i,
  /\b(no signup needed|smart contracts audited|audited by)\b/i,
  /\b\d+\s*(million|billion)\+?\b/i,
  /\b(badge|launches|reviews on product hunt)\b/i,
  /\b(ap news|cointelegraph|techbullion|featured)\b/i,
];

const TRUST_MISSING_CHIP_LABELS = new Set([
  "Trust missing",
  "Trust missing above fold",
  "Trust signals missing",
]);

export type TrustCalibrationInput = {
  copyVariants?: ReportCopyVariants | null;
  meta?: ReportMeta | null;
  rawChecklist?: unknown;
};

function isTrustRecommendation(text: string): boolean {
  return (
    /\b(add|include|show|need|consider|should)\b/i.test(text) &&
    /\b(logos?|testimonials?|proof|reviews?|endorsements?|case studies)\b/i.test(text)
  );
}

export function textAffirmsSocialProof(text: string): boolean {
  const trimmed = text.trim();

  if (trimmed.length < 4) {
    return false;
  }

  if (
    /\b(no|without|missing|lack|zero|none)\b/i.test(trimmed) &&
    /\b(trust|logos?|testimonials?|proof|signals?|social proof|credibility)\b/i.test(trimmed)
  ) {
    return false;
  }

  if (isTrustRecommendation(trimmed)) {
    return false;
  }

  return SOCIAL_PROOF_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function hasHeroSocialProof(texts: string[]): boolean {
  return texts.some((text) => textAffirmsSocialProof(text));
}

export function collectTrustEvidenceTexts(input: TrustCalibrationInput): string[] {
  const texts: string[] = [];
  const copyVariants = input.copyVariants;

  if (copyVariants?.headline?.current) {
    texts.push(copyVariants.headline.current);
  }

  if (copyVariants?.subheadline?.current) {
    texts.push(copyVariants.subheadline.current);
  }

  if (copyVariants?.cta?.current) {
    texts.push(copyVariants.cta.current);
  }

  if (Array.isArray(input.meta?.trust_notes)) {
    for (const note of input.meta.trust_notes) {
      if (typeof note === "string" && note.trim()) {
        texts.push(note);
      }
    }
  }

  if (Array.isArray(input.rawChecklist)) {
    for (const raw of input.rawChecklist) {
      if (!raw || typeof raw !== "object") {
        continue;
      }

      const item = raw as ReportChecklistItem;
      const text = String(item.text ?? "").trim();

      if (text) {
        texts.push(text);
      }
    }
  }

  return texts.filter((text) => text.trim().length > 0);
}

export function shouldSkipTrustMissingGap(evidenceTexts: string[]): boolean {
  return hasHeroSocialProof(evidenceTexts);
}

export function isTrustMissingChipLabel(label: string): boolean {
  const trimmed = label.trim();
  return TRUST_MISSING_CHIP_LABELS.has(trimmed);
}
