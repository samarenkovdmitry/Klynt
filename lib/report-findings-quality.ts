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
  return `ANALYSIS RULES:
- Find 4 issues that are SPECIFIC to this exact page.
  Each issue must quote a visible text fragment or name an exact UI element.
- Issue #1: must be the single most damaging problem for a first-time visitor.
- Issues must cover at least 3 different areas:
  headline/copy, trust/social proof, CTA/conversion, visual layout, navigation.
- Never write an issue that could apply to any landing page unchanged.

EVIDENCE REQUIRED:
- Every issue title must contain either: a quoted text from the page,
  or a specific element name (e.g. "the 'Contact sales' button",
  "the hero background video", "the pricing table").
- If you cannot name a specific element — skip that issue and find another.

SUGGESTIONS:
- Each suggestion: one concrete action starting with a verb
  (Move, Replace, Add, Remove, Rewrite).
- Max 8 words in suggestion title.
- Never restate the issue as a suggestion.

SCORE:
- 8.5-10: exceptional, almost no issues.
- 7.0-8.4: good, 1-2 minor gaps.
- 5.5-6.9: at risk, multiple issues. Most pages land here.
- 4.0-5.4: weak, visitor confused within 5 seconds.
- Below 4.0: only for completely broken pages without headline or CTA.
- Default assumption: most real pages score 5.5-7.5.

KEY OBSERVATION:
- One insight a junior designer would miss.
- Must not repeat the top issue.
- Must reference something specific and visible on the page.`;
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
