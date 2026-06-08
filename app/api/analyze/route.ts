import { NextResponse } from "next/server";
import sharp from "sharp";

import { requestAuditAnalysis } from "@/lib/analyze-openai";
import { captureWebsiteScreenshots } from "@/lib/capture-website-screenshots";

import { isAuditReport, type AuditReport } from "@/lib/audit-report";
import { normalizeMetricObservations } from "@/lib/metric-observations";
import { normalizeReportHeroCopy } from "@/lib/report-hero-copy";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { generateReportId } from "@/lib/report-id";
import { buildReportSlug } from "@/lib/report-slug";
import { buildReportPreviewImage } from "@/lib/report-preview";
import { normalizeReportBreakdown } from "@/lib/normalize-report-breakdown";
import { deriveRiskFromScore } from "@/lib/report-metrics";
import { mapIssueImpact } from "@/lib/report-impact";
import { normalizeReportPriority } from "@/lib/report-priority";
import { saveReportToDb } from "@/lib/reports-db";
import { scheduleReportOgBackfill } from "@/lib/report-og-backfill";
import { buildReportPreviewPath } from "@/lib/report-preview-url";
import {
  buildAuditContextPromptBlock,
  parseAudienceType,
  parseTrafficSource,
} from "@/lib/audit-context";
import {
  buildBrandStagePromptBlock,
  buildHeadlineDirectionsSchemaSnippet,
  normalizeHeadlineDirections,
  parseBrandStage,
  resolveHeadlineBeforeGap,
} from "@/lib/brand-stage";
import {
  buildAnalysisQualityPromptBlock,
  normalizeReportFindings,
} from "@/lib/report-findings-quality";
import { validateAuditUrl } from "@/lib/validate-audit-url";

export const runtime = "nodejs";
export const maxDuration = 90;

const ANALYZE_RATE_LIMIT = Number(process.env.ANALYZE_RATE_LIMIT) || 8;
const ANALYZE_RATE_WINDOW_MS =
  Number(process.env.ANALYZE_RATE_WINDOW_MS) || 60 * 60 * 1000;
const MAX_SCREENSHOT_BYTES = 20 * 1024 * 1024;

// -----------------------------
// HELPERS
// -----------------------------
async function blobToBase64(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}

async function optimizeScreenshotBase64(base64: string) {
  const optimized = await sharp(Buffer.from(base64, "base64"))
    .resize(768, null, { withoutEnlargement: true })
    .jpeg({ quality: 48, mozjpeg: true })
    .toBuffer();

  return optimized.toString("base64");
}

async function optimizeScreenshots(base64List: string[]) {
  return Promise.all(base64List.map((shot) => optimizeScreenshotBase64(shot)));
}

function clampPercent(n: any) {
  const v = Number(n ?? 0);

  if (Number.isNaN(v)) return 0;

  return Math.max(0, Math.min(100, v));
}

function normalizePriorityItem(item: Record<string, unknown>) {
  const {
    impact,
    impact_metric_1,
    impact_value_1,
    impact_metric_2,
    impact_value_2,
    priority,
    ...rest
  } = item;

  const legacyImpact =
    impact && typeof impact === "object"
      ? (impact as Record<string, number>)
      : ({
          impact_metric_1,
          impact_value_1,
          impact_metric_2,
          impact_value_2,
        } as Record<string, unknown>);

  return {
    ...rest,
    priority: normalizeReportPriority(
      priority,
      legacyImpact as Record<string, number>
    ),
  };
}



// -----------------------------
// URL NORMALIZER
// -----------------------------
function normalizeUrl(input: string) {
  if (!input) return "";

  let url = input.trim();

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  return url;
}


// -----------------------------
// SIGNALS -> COMPACT CHIPS
// -----------------------------
function normalizeSignals(signals: string[] = []) {
  const tags = new Set<string>();

  const joined = signals.join(" ").toLowerCase();

  // hierarchy
  if (
    joined.includes("hierarchy") ||
    joined.includes("visual priority")
  ) {
    tags.add("Weak hierarchy");
  }

  // contrast
  if (
    joined.includes("contrast") ||
    joined.includes("hard to see") ||
    joined.includes("visibility")
  ) {
    tags.add("Low contrast");
  }

  // layout
  if (
    joined.includes("crowded") ||
    joined.includes("spacing") ||
    joined.includes("layout") ||
    joined.includes("dense")
  ) {
    tags.add("Overloaded layout");
  }

  // CTA
  if (
    joined.includes("cta") ||
    joined.includes("button")
  ) {
    tags.add("Weak CTA");
  }

  // trust
  if (
    joined.includes("trust") ||
    joined.includes("testimonial") ||
    joined.includes("social proof")
  ) {
    tags.add("Missing trust signals");
  }

  // navigation
  if (
    joined.includes("navigation") ||
    joined.includes("menu")
  ) {
    tags.add("Navigation friction");
  }

  // clarity
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

function normalizeIssueTitle(item: {
  title?: unknown;
  why?: unknown;
}): string {
  const title = String(item.title ?? "").trim();
  const why = String(item.why ?? "").trim();

  if (!isAbstractIssueTitle(title)) return title;
  if (why.length < 20) return title;

  const firstSentence = why.match(/^[^.!?]+[.!?]/)?.[0]?.trim();
  return firstSentence || why;
}



// -----------------------------
// ROUTE
// -----------------------------
export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(
      `analyze:${clientIp}`,
      ANALYZE_RATE_LIMIT,
      ANALYZE_RATE_WINDOW_MS
    );

    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSec),
          },
        }
      );
    }

    const formData = await req.formData();

    const rawUrl = (formData.get("url") as string) ?? "";
    const uploadedScreenshot = formData.get("screenshot") as Blob | null;
    const brandStage = parseBrandStage(formData.get("brandStage"));
    const trafficSource = parseTrafficSource(formData.get("trafficSource"));
    const audienceType = parseAudienceType(formData.get("audienceType"));

    if (rawUrl.trim()) {
      const urlError = validateAuditUrl(rawUrl);
      if (urlError) {
        return NextResponse.json({ error: urlError }, { status: 400 });
      }
    }

    if (uploadedScreenshot && uploadedScreenshot.size > 0) {
      if (uploadedScreenshot.size > MAX_SCREENSHOT_BYTES) {
        return NextResponse.json(
          { error: "Screenshot must be 20 MB or smaller." },
          { status: 400 }
        );
      }

      if (!uploadedScreenshot.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Upload a PNG or JPG screenshot." },
          { status: 400 }
        );
      }
    }

    const url = normalizeUrl(rawUrl);

    let screenshotsBase64: string[] = [];

    // PRIORITY #1 — uploaded screenshot
    if (uploadedScreenshot) {
     const uploadedBase64 = await blobToBase64(uploadedScreenshot);

     screenshotsBase64 = [uploadedBase64];
    }

    // PRIORITY #2 — auto capture from URL
    else if (url) {
      screenshotsBase64 = await captureWebsiteScreenshots(url);
    }

    if (screenshotsBase64.length === 0) {
      return NextResponse.json(
        {
          error: "Either URL or screenshot is required",
        },
        {
          status: 400,
        }
      );
    }

    const rawScreenshotsBase64 = [...screenshotsBase64];
    screenshotsBase64 = await optimizeScreenshots(screenshotsBase64);

    const rawHeroBase64 = rawScreenshotsBase64[0];
    const previewImagePromise = rawHeroBase64
      ? buildReportPreviewImage(rawHeroBase64).catch((previewError) => {
          console.error("[analyze] Failed to build preview image:", previewError);
          return undefined;
        })
      : Promise.resolve(undefined);
    const brandStagePrompt = buildBrandStagePromptBlock(brandStage);
    const auditContextPrompt = buildAuditContextPromptBlock(
      trafficSource,
      audienceType
    );
    const analysisQualityPrompt = buildAnalysisQualityPromptBlock();

    const basePrompt = `You are a senior SaaS UX auditor (clarity, conversion, positioning).

Analyze ONLY what is visible in the screenshot(s). Never invent UI. No generic advice — name the actual element/section.

${auditContextPrompt}

${brandStagePrompt}

${analysisQualityPrompt}

Return ONLY valid JSON (no markdown):

{
  "url": "string",
  "score": number,
  "risk": "low"|"medium"|"high",
  "summary": "string",
  "verdict": "string",
  "key_observation": "string",
  "confidence": number,
  ${buildHeadlineDirectionsSchemaSnippet()}
  "metric_observations": {
    "trust": "string",
    "clarity": "string",
    "friction": "string",
    "overall": "string"
  },
  "issues": [{
    "category": "Clarity"|"Navigation"|"Visuals"|"Trust"|"Conversion",
    "title": "one concrete sentence",
    "bullets": ["2-3 short evidence tags"],
    "why": "string",
    "impact": { "clarity"?: int, "navigation"?: int, "visuals"?: int, "trust"?: int, "conversion"?: int, "cta"?: int }
  }],
  "suggestions": [{
    "category": "Clarity"|"Navigation"|"Visuals"|"Trust"|"Conversion",
    "section": "string",
    "recommendation": "string",
    "why": "string",
    "priority": "quick_win"|"high_impact"|"medium_impact"
  }],
  "copy": [{
    "section": "string",
    "before": "exact visible copy",
    "after": "clearer rewrite",
    "why": "string",
    "priority": "quick_win"|"high_impact"|"medium_impact"
  }],
  "breakdown": { "clarity": int, "navigation": int, "visuals": int, "trust": int, "conversion": int }
}

Counts: exactly 4 issues, 3 suggestions, 3 copy (different sections).
Lengths: summary 14-22 words; verdict 6-10 words; key_observation max 14 words; why fields max 28 words each.

Hero copy — three distinct layers. Never paraphrase one layer as another:
- verdict: auditor diagnosis in 6-10 words. Name the main UX or conversion problem on THIS page.
  Good: "Hero headline hides who the product is for."
  Bad: "Messaging clarity issues"
- summary: visitor first-impression in 14-22 words. Describe what a new visitor likely feels, misunderstands, or fails to decide. Empathy and behavior, not a restated diagnosis.
  Good: "New visitors likely pause because the hero never names the audience or immediate payoff."
  Bad: repeating the verdict with different wording
- key_observation: one non-obvious insight in max 14 words. A second-angle finding (trust gap, expectation mismatch, hierarchy surprise) that is NOT the same point as verdict or summary.
  Good: "Trust badges appear before the value prop, which can feel like marketing noise."
  Bad: another headline-clarity sentence

issues[].title: exactly ONE sentence (12-22 words). State what is wrong on THIS page, what users fail to understand, where friction happens, and why it hurts conversion. Name the visible section/element when possible. NEVER use abstract audit labels (e.g. "Weak visual hierarchy", "Messaging clarity issues", "CTA optimization gap", "Navigation friction", "Low clarity").
Good title: "The hero headline never states who the product is for, so visitors can't judge fit before scrolling."
Bad title: "Weak visual hierarchy"
Impact: REQUIRED on every issue — include issues[].impact with exactly one negative integer from -5 to -25.
Example: "impact": { "clarity": -18 }. Allowed keys: clarity, navigation, visuals, trust, conversion, cta.
Never omit impact. Never use 0.
priority: suggestions[] and copy[] ONLY — required enum, no impact field:
- quick_win: low effort, visible UX payoff (copy tweak, one CTA, small layout fix)
- high_impact: materially improves understanding or conversion; may need more design/dev work
- medium_impact: helpful but secondary, partial gain, or needs validation
confidence: integer 70-98. breakdown: integers 0-100 where higher = stronger (70+ strong, 40-69 at risk, below 40 critical). score: integer 0-100 aligned with breakdown average — never put impact penalties (-5 to -25) into breakdown.
metric_observations: expert UX consultant observations (NOT metric labels). Each field 12-16 words.
- Do NOT repeat category names (Trust, Clarity, Friction, Overall) or the word "metric".
- Describe likely user perception and behavioral impact, like a consultant briefing a team.
- trust: what users likely feel about credibility and professionalism.
- clarity: what users likely understand about value and the next step.
- friction: how much competing UI or copy may slow first-pass understanding.
- overall: holistic read of the page experience; do not repeat verdict verbatim.
Copy: improve clarity (what/who/outcome), not hype. Preserve brand tone.`;

    const json: Record<string, any> = await requestAuditAnalysis({
      basePrompt,
      url,
      screenshotsBase64,
    });

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

    json.issues = json.issues.map((item: any, index: number) => {
      const { impact, ...rest } = item;

      return {
        ...rest,
        title: normalizeIssueTitle(item),
        bullets: normalizeSignals(item.bullets || []),
        ...mapIssueImpact(item, json.breakdown, index),
      };
    });

    json.suggestions = json.suggestions.map((item: any) =>
      normalizePriorityItem(item)
    );

    json.copy = json.copy.map((item: any) => normalizePriorityItem(item));

    Object.assign(json, normalizeReportFindings(json));

    let headlineDirections = normalizeHeadlineDirections(json.headline_directions, brandStage);

    if (headlineDirections && !headlineDirections.gap) {
      const gap = resolveHeadlineBeforeGap(headlineDirections, json.copy);

      if (gap) {
        headlineDirections = { ...headlineDirections, gap };
      }
    }

    json.headline_directions = headlineDirections;

    Object.assign(json, normalizeReportHeroCopy(json));

    const normalizedScores = normalizeReportBreakdown({
      score: Number(json.score) || 0,
      breakdown: json.breakdown,
      issues: json.issues,
    });

    json.score = normalizedScores.score;
    json.breakdown = normalizedScores.breakdown;
    json.risk = deriveRiskFromScore(normalizedScores.score);

    const reportId = generateReportId();
    const auditedUrl =
      typeof json.url === "string" && json.url.trim()
        ? json.url.trim()
        : url;

    const metricObservations = normalizeMetricObservations(json.metric_observations);
    const previewImage = await previewImagePromise;

    const reportPayload: AuditReport = {
      url: auditedUrl,
      score: Number(json.score) || 0,
      risk: deriveRiskFromScore(json.score),
      summary: json.summary,
      verdict: json.verdict,
      key_observation: json.key_observation,
      confidence: json.confidence,
      previewImage,
      metric_observations: metricObservations,
      issues: json.issues,
      suggestions: json.suggestions,
      copy: json.copy,
      brand_stage: brandStage,
      traffic_source: trafficSource,
      audience_type: audienceType,
      headline_directions: headlineDirections,
      breakdown: json.breakdown,
      generatedAt: new Date().toISOString(),
    };

    const reportSlug = buildReportSlug(reportId, auditedUrl);
    const previewImagePath = buildReportPreviewPath(reportSlug);

    if (isAuditReport(reportPayload)) {
      try {
        await saveReportToDb({
          id: reportId,
          auditedUrl,
          report: reportPayload,
        });
      } catch (persistError) {
        console.error("[analyze] Failed to persist report:", persistError);
      }

      scheduleReportOgBackfill(reportId, reportPayload, previewImage);
    }

    return NextResponse.json({
      ...json,
      reportId,
      reportSlug,
      url: auditedUrl,
      brand_stage: brandStage,
      traffic_source: trafficSource,
      audience_type: audienceType,
      headline_directions: headlineDirections,
      generatedAt: reportPayload.generatedAt,
      previewImage: previewImagePath,
      metric_observations: metricObservations,
    });
  } catch (error: any) {
    
    console.error("ANALYZE ERROR:");
    console.error(error);
    console.error(error?.stack);

    return NextResponse.json(
      {
        error:
        error?.message?.includes("timeout")
        ? "Website loading timed out."
        : error.message || "Unknown server error",
      },
      {
        status: 500,
      }
    );
  }
}