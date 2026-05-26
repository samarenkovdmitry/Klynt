function clampPercent(n: unknown) {
  const v = Number(n ?? 0);
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(100, v));
}

function mapImpact(impactObj: Record<string, number>) {
  if (!impactObj || typeof impactObj !== "object") {
    return {
      impact_metric_1: "",
      impact_value_1: 0,
      impact_metric_2: "",
      impact_value_2: 0,
    };
  }

  const entries = Object.entries(impactObj)
    .filter(([, v]) => typeof v === "number" && v !== 0)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));

  if (entries.length === 0) {
    return {
      impact_metric_1: "",
      impact_value_1: 0,
      impact_metric_2: "",
      impact_value_2: 0,
    };
  }

  const [m1, v1] = entries[0];

  let m2 = "";
  let v2 = 0;

  if (entries.length > 1) {
    const [candM2, candV2] = entries[1];
    if (Math.abs(candV2) >= Math.abs(v1) * 0.15) {
      m2 = candM2;
      v2 = candV2;
    }
  }

  return {
    impact_metric_1: m1,
    impact_value_1: v1,
    impact_metric_2: m2,
    impact_value_2: v2,
  };
}

function normalizeSignals(signals: string[] = []) {
  const tags = new Set<string>();
  const joined = signals.join(" ").toLowerCase();

  if (joined.includes("hierarchy") || joined.includes("visual priority")) {
    tags.add("Weak hierarchy");
  }
  if (
    joined.includes("contrast") ||
    joined.includes("hard to see") ||
    joined.includes("visibility")
  ) {
    tags.add("Low contrast");
  }
  if (
    joined.includes("crowded") ||
    joined.includes("spacing") ||
    joined.includes("layout") ||
    joined.includes("dense")
  ) {
    tags.add("Overloaded layout");
  }
  if (joined.includes("cta") || joined.includes("button")) {
    tags.add("Weak CTA");
  }
  if (
    joined.includes("trust") ||
    joined.includes("testimonial") ||
    joined.includes("social proof")
  ) {
    tags.add("Missing trust signals");
  }
  if (joined.includes("navigation") || joined.includes("menu")) {
    tags.add("Navigation friction");
  }
  if (
    joined.includes("clarity") ||
    joined.includes("unclear") ||
    joined.includes("generic")
  ) {
    tags.add("Low clarity");
  }

  return Array.from(tags).slice(0, 3);
}

function isAbstractIssueTitle(title: string): boolean {
  const t = title.trim();
  if (!t) return true;

  const looksLikeSentence =
    /[.!?]$/.test(t) ||
    /\b(don't|doesn't|can't|cannot|isn't|aren't|because|so users|so visitors|which makes|which means|before they|when they)\b/i.test(
      t
    );

  if (looksLikeSentence && t.split(/\s+/).length >= 8) return false;

  const abstractLabel =
    /^(weak|low|missing|poor|unclear|navigation|messaging|cta|visual|conversion|trust|clarity|overloaded|generic)\b/i.test(
      t
    ) ||
    /\b(issues?|gap|friction|hierarchy|optimization|clarity problems?)\b/i.test(t);

  return abstractLabel || t.split(/\s+/).length <= 6;
}

function normalizeIssueTitle(item: { title?: unknown; why?: unknown }): string {
  const title = String(item.title ?? "").trim();
  const why = String(item.why ?? "").trim();

  if (!isAbstractIssueTitle(title)) return title;
  if (why.length < 20) return title;

  const firstSentence = why.match(/^[^.!?]+[.!?]/)?.[0]?.trim();
  return firstSentence || why;
}

export function parseAnalysisJson(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    let start = raw.indexOf("{");

    while (start !== -1) {
      let end = raw.lastIndexOf("}");

      while (end !== -1 && end > start) {
        const candidate = raw.slice(start, end + 1);

        try {
          return JSON.parse(candidate);
        } catch {
          end = raw.lastIndexOf("}", end - 1);
        }
      }

      start = raw.indexOf("{", start + 1);
    }

    throw new Error("AI analysis failed. Please try again.");
  }
}

export function normalizeAnalysisResponse(json: Record<string, any>) {
  if (
    typeof json.summary !== "string" ||
    json.summary.trim().length < 10
  ) {
    const topIssue = json.issues?.[0]?.title || "conversion clarity";
    json.summary = `Strong visual presentation, but ${String(topIssue).toLowerCase()} reduces overall conversion confidence.`;
  }

  if (typeof json.verdict !== "string" || json.verdict.trim().length < 6) {
    if (json.score >= 80) {
      json.verdict = "Strong UX with minor conversion friction";
    } else if (json.score >= 60) {
      json.verdict = "Clear structure with moderate UX friction";
    } else {
      json.verdict = "Weak clarity and conversion communication";
    }
  }

  if (
    typeof json.key_observation !== "string" ||
    json.key_observation.trim().length < 8
  ) {
    json.key_observation =
      json.issues?.[0]?.title || "Primary messaging lacks clarity";
  }

  json.confidence = Number.isFinite(Number(json.confidence))
    ? Math.max(70, Math.min(98, Number(json.confidence)))
    : 82;

  if (!json.breakdown || typeof json.breakdown !== "object") {
    json.breakdown = {
      clarity: 0,
      navigation: 0,
      visuals: 0,
      trust: 0,
      conversion: 0,
    };
  }

  json.breakdown = {
    clarity: clampPercent(json.breakdown.clarity),
    navigation: clampPercent(json.breakdown.navigation),
    visuals: clampPercent(json.breakdown.visuals),
    trust: clampPercent(json.breakdown.trust),
    conversion: clampPercent(json.breakdown.conversion),
  };

  json.issues = Array.isArray(json.issues) ? json.issues.slice(0, 4) : [];
  json.suggestions = Array.isArray(json.suggestions)
    ? json.suggestions.slice(0, 3)
    : [];
  json.copy = Array.isArray(json.copy) ? json.copy.slice(0, 3) : [];

  json.issues = json.issues.map((item: Record<string, unknown>) => ({
    ...item,
    title: normalizeIssueTitle(item),
    bullets: normalizeSignals((item.bullets as string[]) || []),
    ...mapImpact((item.impact as Record<string, number>) || {}),
  }));

  json.suggestions = json.suggestions.map((item: Record<string, unknown>) => ({
    ...item,
    ...mapImpact((item.impact as Record<string, number>) || {}),
  }));

  json.copy = json.copy.map((item: Record<string, unknown>) => ({
    ...item,
    ...mapImpact((item.impact as Record<string, number>) || {}),
  }));

  return json;
}
