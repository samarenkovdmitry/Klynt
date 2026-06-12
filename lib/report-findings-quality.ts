import type { ReportCopyItem, ReportIssue, ReportSuggestion } from "@/lib/audit-report";
import { heroTextsAreTooSimilar } from "@/lib/report-hero-copy";

const HERO_FOCUS_PATTERN =
  /\b(hero|headline|h1|above the fold|first screen|top of page)\b/i;

const GENERIC_SUGGESTION_PATTERNS = [
  /^improve (the )?headline/i,
  /^clarify (the )?value proposition/i,
  /^add (more )?social proof/i,
  /^strengthen (the )?cta/i,
  /^improve (the )?cta/i,
  /^enhance trust/i,
  /^improve navigation/i,
];

function normalizeWords(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ");
}

function textsAreSimilar(a: string, b: string, threshold = 0.5) {
  return heroTextsAreTooSimilar(a, b, threshold);
}

function countHeroFocusedIssues(issues: ReportIssue[]) {
  return issues.filter((issue) =>
    HERO_FOCUS_PATTERN.test(`${issue.title ?? ""} ${issue.why ?? ""}`)
  ).length;
}

function ensureIssueBullets(issue: ReportIssue) {
  const bullets = Array.isArray(issue.bullets)
    ? issue.bullets.map((bullet) => String(bullet).trim()).filter(Boolean).slice(0, 3)
    : [];

  if (bullets.length > 0) {
    return {
      ...issue,
      bullets,
    };
  }

  const title = String(issue.title ?? "").trim();

  if (!title) {
    return issue;
  }

  return {
    ...issue,
    bullets: [title.length > 72 ? `${title.slice(0, 69).trimEnd()}…` : title],
  };
}

function diversifyIssueTitles(issues: ReportIssue[]) {
  const seenThemes = new Set<string>();

  return issues.map((issue, index) => {
    const title = String(issue.title ?? "").trim();
    const theme = normalizeWords(title).split(" ").slice(0, 4).join(" ");

    if (!theme || !seenThemes.has(theme)) {
      if (theme) {
        seenThemes.add(theme);
      }

      return issue;
    }

    const why = String(issue.why ?? "").trim();
    const fallbackSentence = why.match(/^[^.!?]+[.!?]/)?.[0]?.trim();

    if (
      fallbackSentence &&
      fallbackSentence.length >= 20 &&
      !textsAreSimilar(fallbackSentence, title)
    ) {
      seenThemes.add(normalizeWords(fallbackSentence).split(" ").slice(0, 4).join(" "));
      return {
        ...issue,
        title: fallbackSentence,
      };
    }

    if (index > 0 && why) {
      return issue;
    }

    return issue;
  });
}

function normalizeSuggestion(
  suggestion: ReportSuggestion,
  issues: ReportIssue[],
  usedSections: Set<string>
) {
  const recommendation = String(suggestion.recommendation ?? "").trim();
  const section = String(suggestion.section ?? "").trim();
  let next = { ...suggestion, recommendation, section };

  const isGeneric = GENERIC_SUGGESTION_PATTERNS.some((pattern) =>
    pattern.test(recommendation)
  );

  if (isGeneric && section) {
    next = {
      ...next,
      recommendation: `In ${section}, make the visible promise more specific about who it helps and what changes for them.`,
    };
  }

  const duplicateIssue = issues.find((issue) =>
    textsAreSimilar(String(issue.title ?? ""), next.recommendation ?? "")
  );

  if (duplicateIssue && next.why) {
    next = {
      ...next,
      recommendation: next.recommendation,
    };
  }

  const sectionKey = normalizeWords(next.section || next.recommendation);

  if (sectionKey && usedSections.has(sectionKey) && next.section) {
    next = {
      ...next,
      section: `${next.section} (secondary)`,
    };
  }

  if (sectionKey) {
    usedSections.add(sectionKey);
  }

  return next;
}

function normalizeCopySections(copy: ReportCopyItem[]) {
  const seenSections = new Set<string>();

  return copy.map((item) => {
    const section = String(item.section ?? "").trim();
    const sectionKey = normalizeWords(section);

    if (!sectionKey || !seenSections.has(sectionKey)) {
      if (sectionKey) {
        seenSections.add(sectionKey);
      }

      return item;
    }

    return {
      ...item,
      section: section ? `${section} (alt)` : item.section,
    };
  });
}

export function buildAnalysisQualityPromptBlock() {
  return `UNIQUENESS AND EVIDENCE RULES:
- Each checklist gap (missing/weak) MUST reference a specific, visible element or section on the page.
- At least 1 copy or trust gap MUST come from below the fold (features, trust, pricing, or footer).
- copy_variants.current for each element MUST be the exact visible text — never a paraphrase or invented copy.
- Never repeat the same root cause across verdict, summary, key_observation, and checklist items.
- Prefer page-specific findings over generic landing-page advice. Name the element, block, or copy you see.

INSIGHT DEPTH RULES:
- Before writing each checklist item, ask: would this observation apply to 80% of SaaS
  landing pages? If yes — go deeper or pick a different gap.
- Good item: specific to this page, references a visible element, explains the UX consequence.
- Bad item: could be copied to any landing page report unchanged.
- Forbidden generic checklist items (do not use as missing/weak):
  "headline doesn't say who it's for"
  "trust signals are missing"
  "CTA lacks context"
  "visual hierarchy could be improved"
  These may appear only as pass items, or as context-specific gaps with the exact visible element named.
- Never output two missing gaps for the same element (headline category + hero title clarity = one gap).
- gap_label must be 2-4 words and different from text — short badge only, never a sentence.
- NEVER use placeholder phrases like "No content available to assess" in checklist text, copy_variants, or meta fields.

SCORE CALIBRATION:
- Most real-world landing pages score between 5.0 and 8.0.
  Scores below 4.0 are rare and reserved for genuinely broken pages.
- Score is a float with one decimal (e.g. 6.4, 7.1, 5.8). Never an integer.
- Anchor points:
  8.5-10.0: Exceptional — clear targeted headline, trust signals above fold,
             single prominent CTA, strong visual hierarchy. Rare.
  7.0-8.4:  Good — one or two fixable gaps, strong overall first impression.
  5.5-6.9:  At risk — multiple clarity or trust issues, visitor may leave
             before understanding the product. Most pages land here.
             Checklist MUST include at least 3 gaps (missing + weak).
  4.0-5.4:  Weak — visitor likely confused within 5 seconds,
             core message unclear or buried. At least 3 missing + 1 weak typography.
  2.0-3.9:  Critical — no clear value prop, broken hierarchy,
             or completely missing trust signals. Very rare.
  0.0-1.9:  Do not use — reserved for empty or placeholder pages only.
- When in doubt, score higher rather than lower.
  A page with good visuals but weak copy is 6.x, not 4.x.
- Never score a page below 4.0 unless it has no visible headline,
  no CTA, and no recognizable product description.`;
}

export function normalizeReportFindings<
  T extends {
    issues?: ReportIssue[];
    suggestions?: ReportSuggestion[];
    copy?: ReportCopyItem[];
  },
>(findings: T): T {
  const issues = diversifyIssueTitles(
    (findings.issues ?? []).map((issue) => ensureIssueBullets(issue))
  );

  const usedSections = new Set<string>();
  const suggestions = (findings.suggestions ?? []).map((item) =>
    normalizeSuggestion(item, issues, usedSections)
  );

  const copy = normalizeCopySections(findings.copy ?? []);

  if (countHeroFocusedIssues(issues) > 2 && issues[3]) {
    issues[3] = {
      ...issues[3],
      title:
        issues[3].title &&
        !HERO_FOCUS_PATTERN.test(issues[3].title)
          ? issues[3].title
          : "Lower-page content does not reinforce the hero promise, so visitors who scroll still lack a clear reason to act.",
    };
  }

  return {
    ...findings,
    issues,
    suggestions,
    copy,
  };
}
