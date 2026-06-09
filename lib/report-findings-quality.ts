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
      recommendation: `${next.recommendation} Focus on implementation in ${next.section || "this section"}, not repeating the diagnosis.`,
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

ISSUE DIVERSITY RULES:
- issues[] must cover at minimum 3 different dimensions from: [messaging clarity, visual hierarchy, trust signals, CTA mechanics, navigation friction, social proof placement].
- If headline clarity is flagged as issue #1, it must reference the SPECIFIC visible headline text verbatim, not a general observation.
- Each issue must name the exact visible element, section, or copy it refers to — never a generic UI pattern.

IMPACT SCORE RULES:
- impact percentages must vary across all 4 issues in one report. Never assign the same percentage to two issues.
- Top issue range: 15-25%. Other issues: 8-18%. No two issues may share the same value.

SUGGESTION QUALITY RULES:
- Each suggestion must describe a SPECIFIC actionable change, not restate the issue title.
- suggestion.title must start with an action verb: Move, Replace, Add, Remove, Reduce, Rewrite, Simplify, Consolidate.
- Banned openers: "Consider", "Think about", "Ensure", "Make sure", "Try to".
- Each suggestion must reference a different page section from the others.

KEY OBSERVATION RULE:
- key_observation must be one counter-intuitive or non-obvious insight that a junior designer would miss.
- Must NOT restate the top issue, summary, or verdict.
- Good example: "The pricing anchor is missing, making the free tier feel risky rather than safe."
- Bad example: "The headline lacks clarity for new visitors."

SCORE CALIBRATION:
- Use the full scoring range — do not default to 6.x.
- 9-10: Nearly perfect — clear headline, trust above fold, single prominent CTA, strong visual hierarchy.
- 7-8: Good with minor gaps — one or two weak areas, strong overall impression.
- 5-6: At risk — multiple issues affecting first impression, visitor may leave before scrolling.
- 3-4: Critical — visitor likely confused within 5 seconds, core message unclear.
- 1-2: Broken — no clear value prop or CTA visible above the fold.`;
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
