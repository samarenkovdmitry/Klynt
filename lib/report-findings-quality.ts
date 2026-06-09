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
- Each of the 4 issues MUST target a different visible section or user moment. Max 2 issues may focus on hero/above-the-fold.
- At least 1 issue MUST come from Screenshot 2 (lower page: features, trust, pricing, footer, secondary CTAs).
- issues[].bullets: 2-3 tags; when visible text exists, include one short quoted phrase from the page (3-8 words) in a bullet.
- suggestions[]: each must reference a different section string; do NOT restate an issue title as the recommendation.
- copy[]: use 3 different sections (hero headline, supporting line/subtext, primary CTA or closest equivalent).
- Never repeat the same root cause across verdict, summary, key_observation, and multiple issue titles.
- Prefer page-specific findings over generic landing-page advice. Name the element, block, or copy you see.

INSIGHT DEPTH RULES:
- Before writing each issue, ask: would this observation apply to 80% of SaaS
  landing pages? If yes — go deeper or find a different issue.
- Good issue: specific to this page, references visible element, explains
  the UX consequence for this particular product/audience.
- Bad issue: could be copied to any landing page report unchanged.
- Each issue must answer: what specifically did you see, why does it matter
  for THIS product, what does a visitor think or feel because of it.
- Forbidden generic findings (do not use these as issue #1 or #2):
  "headline doesn't say who it's for"
  "trust signals are missing"
  "CTA lacks context"
  "visual hierarchy could be improved"
  These may appear only as issue #3 or #4, and only if truly the most
  notable remaining problem on the page.

EVIDENCE REQUIREMENT:
- Every issue title must contain at least one of:
  a quoted text fragment from the page, a specific section name,
  or a specific UI element name.
- Example good: "The subheadline 'built for teams' contradicts the solo
  pricing shown below the fold"
- Example bad: "The messaging lacks clarity about the target audience"
- If you cannot name a specific element — the issue is too generic, find another.

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
  4.0-5.4:  Weak — visitor likely confused within 5 seconds,
             core message unclear or buried.
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
