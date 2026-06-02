type HeroCopyInput = {
  score?: number;
  summary?: string;
  verdict?: string;
  key_observation?: string;
  metric_observations?: {
    clarity?: string;
    friction?: string;
    overall?: string;
  };
  issues?: Array<{ title?: string; why?: string }>;
};

function normalizeHeroText(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ");
}

function significantWords(text: string) {
  return normalizeHeroText(text)
    .split(" ")
    .filter((word) => word.length > 3);
}

export function heroTextsAreTooSimilar(a: string, b: string, threshold = 0.55) {
  const left = a.trim();
  const right = b.trim();

  if (!left || !right) {
    return false;
  }

  const normalizedLeft = normalizeHeroText(left);
  const normalizedRight = normalizeHeroText(right);

  if (normalizedLeft === normalizedRight) {
    return true;
  }

  if (
    normalizedLeft.includes(normalizedRight) ||
    normalizedRight.includes(normalizedLeft)
  ) {
    return true;
  }

  const wordsLeft = new Set(significantWords(left));
  const wordsRight = new Set(significantWords(right));

  if (wordsLeft.size === 0 || wordsRight.size === 0) {
    return false;
  }

  let shared = 0;

  for (const word of wordsLeft) {
    if (wordsRight.has(word)) {
      shared += 1;
    }
  }

  return shared / Math.min(wordsLeft.size, wordsRight.size) >= threshold;
}

function scoreBasedVerdict(score: number) {
  if (score >= 80) {
    return "Strong UX with minor conversion friction";
  }

  if (score >= 60) {
    return "Clear structure with moderate UX friction";
  }

  return "Weak clarity and conversion communication";
}

function scoreBasedVisitorSummary(score: number) {
  if (score >= 80) {
    return "Visitors likely grasp the offer quickly, though a few details still invite hesitation before they act.";
  }

  if (score >= 60) {
    return "Visitors probably understand the category, but may pause because the first screen does not spell out fit and payoff.";
  }

  return "Visitors likely leave uncertain about who this is for, what they get, and why they should trust it.";
}

function pickDistinctCandidate(
  candidates: Array<string | undefined>,
  ...references: string[]
) {
  for (const candidate of candidates) {
    const trimmed = candidate?.trim();

    if (!trimmed || trimmed.length < 8) {
      continue;
    }

    if (references.every((reference) => !heroTextsAreTooSimilar(trimmed, reference))) {
      return trimmed;
    }
  }

  return undefined;
}

function ensureVerdict(json: HeroCopyInput) {
  const verdict = json.verdict?.trim();

  if (verdict && verdict.length >= 6) {
    return verdict;
  }

  return scoreBasedVerdict(Number(json.score) || 0);
}

function ensureSummary(json: HeroCopyInput, verdict: string) {
  const summary = json.summary?.trim();

  if (summary && summary.length >= 10 && !heroTextsAreTooSimilar(summary, verdict)) {
    return summary;
  }

  const fromMetrics = pickDistinctCandidate(
    [json.metric_observations?.clarity],
    verdict
  );

  if (fromMetrics) {
    return fromMetrics;
  }

  return scoreBasedVisitorSummary(Number(json.score) || 0);
}

function ensureKeyObservation(
  json: HeroCopyInput,
  verdict: string,
  summary: string
) {
  const keyObservation = json.key_observation?.trim();

  if (
    keyObservation &&
    keyObservation.length >= 8 &&
    !heroTextsAreTooSimilar(keyObservation, verdict) &&
    !heroTextsAreTooSimilar(keyObservation, summary)
  ) {
    return keyObservation;
  }

  return (
    pickDistinctCandidate(
      [
        json.metric_observations?.overall,
        json.metric_observations?.friction,
        json.issues?.[1]?.why,
        json.issues?.[1]?.title,
      ],
      verdict,
      summary
    ) ?? ""
  );
}

export function normalizeReportHeroCopy<T extends HeroCopyInput>(json: T): T {
  const verdict = ensureVerdict(json);
  const summary = ensureSummary(json, verdict);
  const keyObservation = ensureKeyObservation(json, verdict, summary);

  return {
    ...json,
    verdict,
    summary,
    key_observation: keyObservation,
  };
}
