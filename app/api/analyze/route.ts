import { NextResponse } from "next/server";
import sharp from "sharp";

import { runAnalysisPipeline } from "@/lib/analysis/pipeline";
import type { PageData, NarrativeResult, ExtractionResult } from "@/lib/analysis/pipeline";
import type { HeroSlot } from "@/components/report-v2/ReportHero";
import { captureWebsiteScreenshots } from "@/lib/capture-website-screenshots";

import { isAuditReport, type AuditReport, type ReportCopyVariants, type CopyVariantBlock } from "@/lib/audit-report";
import type { CopyVariant as NarrativeCopyVariant } from "@/lib/analysis/narrative";
import { normalizeMetricObservations } from "@/lib/metric-observations";
import { normalizeReportHeroCopy } from "@/lib/report-hero-copy";
import { createAnalyzeTiming } from "@/lib/analyze-timing";
import {
  buildRateLimitHeaders,
  checkRateLimit,
  getClientIp,
} from "@/lib/rate-limit";
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
  parseAudienceType,
  parseTrafficSource,
} from "@/lib/audit-context";
import {
  normalizeHeadlineDirections,
  parseBrandStage,
  resolveHeadlineBeforeGap,
} from "@/lib/brand-stage";
import { normalizeReportFindings } from "@/lib/report-findings-quality";
import {
  finalizeReportChecklist,
  normalizeScorePotential,
} from "@/lib/normalize-report-checklist";
import {
  calibrateReportScore,
  deriveScoreFromBreakdown,
} from "@/lib/normalize-report-score";
import { normalizeReportCopyVariants } from "@/lib/normalize-report-copy-variants";
import { normalizeVisualSection, willDeriveCtaFix } from "@/lib/report-visual-fixes";
import { sanitizeLlmVisibleText } from "@/lib/llm-placeholder-text";
import { logRepeatingGapPatterns } from "@/lib/report-gap-patterns";
import {
  formatIssueTitleDisplay,
  normalizeReportCopyLengths,
} from "@/lib/report-copy-limits";
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

  if (!isAbstractIssueTitle(title)) {
    return formatIssueTitleDisplay(title) || title;
  }
  if (why.length < 20) return title;

  const firstSentence = why.match(/^[^.!?]+[.!?]/)?.[0]?.trim();
  const resolved = firstSentence || why;

  return formatIssueTitleDisplay(resolved) || resolved;
}



// -----------------------------
// PIPELINE HERO ADAPTER
// -----------------------------
function adaptHeroSlot(
  hero: NarrativeResult["hero"],
  extraction: ExtractionResult
): HeroSlot {
  const { format, topIssue, score, lift, headline, subheadline } = hero;

  switch (format) {
    case "D_textual":
      return {
        type: "headline_textual",
        issue_title: topIssue.title,
        quote: extraction.headline,
        explanation: topIssue.body,
        before_text: extraction.headline,
        after_text: topIssue.fix,
        section_label: "HEADLINE, BEFORE & AFTER",
      };

    case "B_before_after":
      return {
        type: "cta_statistic",
        title: topIssue.title,
        stat: "70%",
        stat_label: "of visitors ignore generic CTAs",
        stat_source: "CXL Institute",
        description: topIssue.body,
        before_text: extraction.primaryCta.text || "Get Started",
        after_text: topIssue.fix,
      };

    case "C_count_trust": {
      const ABSENT_MAP: Record<string, string> = {
        logos: "Customer logos",
        testimonials: "Testimonials",
        numbers: "Ratings",
        badges: "Guarantees",
      };
      const present = new Set(
        extraction.socialProofTypes.filter((t) => t !== "none")
      );
      const absent = (["logos", "testimonials", "numbers", "badges"] as const)
        .filter((t) => !present.has(t))
        .map((t) => ABSENT_MAP[t])
        .slice(0, 4);

      return {
        type: "trust_count",
        title: topIssue.title,
        description: topIssue.body,
        count: extraction.trustedByCount,
        label: "trust signals detected above the fold",
        absent_items:
          absent.length > 0
            ? absent
            : ["Customer logos", "Testimonials", "Ratings", "Guarantees"],
      };
    }

    case "A_numeric":
    default:
      return {
        type: "opportunity",
        score: Math.round((score / 10) * 10) / 10,
        score_label: `${lift}-point conversion lift possible`,
        title: headline,
        description: subheadline,
        before_text: topIssue.body,
        after_text: topIssue.fix,
        section_label: "BEFORE & AFTER",
      };
  }
}

// -----------------------------
// NARRATIVE COPY ADAPTER
// -----------------------------
function adaptCopyVariants(raw: NarrativeCopyVariant[]): ReportCopyVariants | null {
  if (!raw?.length) return null;

  const bySection = Object.fromEntries(
    ["headline", "cta", "subheadline"].map((s) => [
      s,
      raw.filter((v) => v.section === s),
    ])
  ) as Record<string, NarrativeCopyVariant[]>;

  const toBlock = (items: NarrativeCopyVariant[]): CopyVariantBlock => ({
    current: items[0]?.before_text ?? "",
    variants: items.map((v) => ({ label: v.label, text: v.after_text })),
  });

  return {
    headline:    toBlock(bySection.headline    ?? []),
    cta:         toBlock(bySection.cta         ?? []),
    subheadline: toBlock(bySection.subheadline ?? []),
  };
}

// -----------------------------
// ROUTE
// -----------------------------
export async function POST(req: Request) {
  const timing = createAnalyzeTiming();
  let captureMode: "upload" | "url" | "none" = "none";

  try {
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(
      `analyze:${clientIp}`,
      ANALYZE_RATE_LIMIT,
      ANALYZE_RATE_WINDOW_MS
    );

    if (!rateLimit.ok) {
      timing.log({ outcome: "rate_limited", clientIp });

      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: buildRateLimitHeaders(rateLimit),
        }
      );
    }

    const rateLimitHeaders = buildRateLimitHeaders(rateLimit);

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
    let computedValues: import("@/lib/audit-report").PageComputedValues | null = null;
    let bodyText = "";

    // PRIORITY #1 — uploaded screenshot
    if (uploadedScreenshot) {
      captureMode = "upload";
      const uploadedBase64 = await timing.measure("upload_ms", () =>
        blobToBase64(uploadedScreenshot)
      );

      screenshotsBase64 = [uploadedBase64];
    }

    // PRIORITY #2 — auto capture from URL (skipped in mock mode)
    else if (url && process.env.USE_MOCK_REPORT !== "true") {
      captureMode = "url";
      const captureResult = await timing.measure("capture_ms", () =>
        captureWebsiteScreenshots(url)
      );
      screenshotsBase64 = captureResult.screenshots;
      computedValues = captureResult.computedValues;
      bodyText = captureResult.bodyText;
    }

    if (screenshotsBase64.length === 0 && process.env.USE_MOCK_REPORT !== "true") {
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
    const rawHeroBase64 = rawScreenshotsBase64[0];
    const previewImagePromise = rawHeroBase64
      ? buildReportPreviewImage(rawHeroBase64).catch((previewError) => {
          console.error("[analyze] Failed to build preview image:", previewError);
          return undefined;
        })
      : Promise.resolve(undefined);

    screenshotsBase64 = await timing.measure("optimize_ms", () =>
      optimizeScreenshots(screenshotsBase64)
    );

    // Derive page context from audienceType for CTA trigger softening.
    const pageContext: import("@/lib/audit-report").PageContext | undefined =
      audienceType === "b2b" ? "b2b" : audienceType === "b2c" ? "consumer" : undefined;

    const pageData: PageData = {
      url,
      html: bodyText,
      screenshot: rawHeroBase64 ?? "",
      meta: { title: "", description: "" },
      puppeteerExtracted: {
        ctaText: computedValues?.cta_text ? [computedValues.cta_text] : [],
        headlineText: computedValues?.h1_text ?? "",
        subheadlineText: computedValues?.sub_text ?? "",
        socialProofAboveFold: computedValues?.social_proof_above_fold ?? false,
        loadTimeMs: 0,
        mobileViewportWidth: computedValues?.viewport_width ?? 390,
      },
    };

    const pipelineResult = await timing.measure("pipeline_ms", () =>
      runAnalysisPipeline(pageData)
    );

    const hero_slot = adaptHeroSlot(
      pipelineResult.narrative.hero,
      pipelineResult.extraction
    );

    const json: Record<string, any> = {
      hero_slot,
      score: pipelineResult.narrative.hero.score / 10,
      summary: pipelineResult.narrative.summary,
      verdict: pipelineResult.narrative.hero.topIssue?.title ?? "",
      key_observation: pipelineResult.narrative.hero.subheadline ?? "",
      confidence: 88,
      breakdown: {
        clarity: pipelineResult.narrative.findings.some((f) => f.type === "clarity") ? 55 : 80,
        trust: pipelineResult.narrative.findings.some((f) => f.type === "trust") ? 55 : 80,
        friction: pipelineResult.narrative.findings.some((f) => f.type === "friction") ? 55 : 80,
        visuals: 75,
      },
      issues: pipelineResult.narrative.findings.map((f) => ({
        category: f.type,
        title: f.title,
        why: f.body,
        severity: f.severity,
        bullets: [] as string[],
      })),
      suggestions: pipelineResult.narrative.quickWins.slice(0, 3).map((qw) => ({
        recommendation: qw,
        priority: "quick_win",
      })),
      copy: [] as unknown[],
      checklist: [] as unknown[],
      copy_variants: null,
      headline_directions: null,
      visual_fixes: [] as unknown[],
      visual_passes: [] as unknown[],
      score_potential: {
        target: pipelineResult.narrative.hero.scorePotential / 10,
        chips: [{ label: "Fix top issues", delta: `+${pipelineResult.narrative.hero.lift / 10}` }],
      },
      pipeline_meta: pipelineResult.meta,
    };

    timing.measureSync("normalize_ms", () => {
      json.confidence = Number.isFinite(Number(json.confidence))
        ? Math.max(70, Math.min(98, Number(json.confidence)))
        : 82;

    if (!json.breakdown || typeof json.breakdown !== "object") {
      json.breakdown = {
        clarity: 0,
        trust: 0,
        friction: 0,
        visuals: 0,
      };
    }

    json.breakdown = {
      clarity: clampPercent(json.breakdown.clarity),
      trust: clampPercent(json.breakdown.trust),
      friction: clampPercent(json.breakdown.friction),
      visuals: clampPercent(json.breakdown.visuals),
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

    json.issues = json.issues.map((item: any) => ({
      ...item,
      title: formatIssueTitleDisplay(item.title) || item.title,
    }));

    json.suggestions = json.suggestions.map((item: any) =>
      normalizePriorityItem(item)
    );

    json.copy = json.copy.map((item: any) => normalizePriorityItem(item));

    Object.assign(json, normalizeReportFindings(json));

    Object.assign(json, normalizeReportCopyLengths(json));

    let headlineDirections = normalizeHeadlineDirections(json.headline_directions, brandStage);

    if (headlineDirections && !headlineDirections.gap) {
      const gap = resolveHeadlineBeforeGap(headlineDirections, json.copy);

      if (gap) {
        headlineDirections = { ...headlineDirections, gap };
      }
    }

    json.headline_directions = headlineDirections;

    Object.assign(json, normalizeReportHeroCopy(json));

    const rawChecklist = json.checklist as import("@/lib/audit-report").ReportChecklistItem[];

    const { breakdown: normalizedBreakdown } = normalizeReportBreakdown({
      score: Number(json.score) || 0,
      breakdown: json.breakdown,
      issues: json.issues,
    });

    json.breakdown = normalizedBreakdown;

    const llmScore = Number(json.score) || 0;
    const derivedScore = deriveScoreFromBreakdown(normalizedBreakdown);
    const workingScore =
      llmScore > 0
        ? Math.round((derivedScore * 0.7 + llmScore * 0.3) * 10) / 10
        : derivedScore;

    const finalized = finalizeReportChecklist(
      rawChecklist,
      workingScore,
      json.score_potential as
        | { target: number; chips: { label: string; delta: string }[] }
        | undefined,
      {
        copyVariants: json.copy_variants as import("@/lib/audit-report").ReportCopyVariants,
        meta: json.meta as import("@/lib/audit-report").ReportMeta,
        rawChecklist,
      }
    );
    json.checklist = finalized.checklist;

    // If social proof was detected within 1.5× viewport, trust cannot be the top critical issue
    if (computedValues?.social_proof_above_fold === true) {
      json.checklist = (json.checklist as import("@/lib/audit-report").ReportChecklistItem[]).map(
        (item) =>
          item.link_to === "trust" && item.status === "missing"
            ? { ...item, status: "weak" as const }
            : item
      );
    }

    json.score = calibrateReportScore(
      llmScore,
      normalizedBreakdown,
      json.checklist
    );
    json.score_potential = normalizeScorePotential(
      finalized.scorePotential,
      json.checklist,
      json.score
    );

    if (json.copy_variants && typeof json.copy_variants === "object") {
      json.copy_variants = normalizeReportCopyVariants(
        json.copy_variants as import("@/lib/audit-report").ReportCopyVariants,
        parseBrandStage(json.brand_stage ?? brandStage)
      );
    }

    // Anchor cta.current to Puppeteer ground truth for URL captures.
    // If Puppeteer returned null (CTA undetected), force "" so the Before block
    // shows "CTA not detected" rather than a hallucinated LLM value.
    if (computedValues !== null && json.copy_variants && typeof json.copy_variants === "object") {
      const cv = json.copy_variants as import("@/lib/audit-report").ReportCopyVariants;
      if (cv.cta && typeof cv.cta === "object") {
        cv.cta.current = computedValues.cta_text ?? "";
      }
    }

    if (json.meta && typeof json.meta === "object") {
      const meta = json.meta as Record<string, unknown>;
      if (typeof meta.title_suggestion === "string") {
        meta.title_suggestion = sanitizeLlmVisibleText(meta.title_suggestion).slice(0, 120);
      }
      if (typeof meta.description_suggestion === "string") {
        meta.description_suggestion = sanitizeLlmVisibleText(meta.description_suggestion).slice(
          0,
          200
        );
      }
      if (typeof meta.proof_suggestion === "string") {
        meta.proof_suggestion = sanitizeLlmVisibleText(meta.proof_suggestion).slice(0, 80);
      }
      if (Array.isArray(meta.trust_notes)) {
        meta.trust_notes = meta.trust_notes
          .filter((note): note is string => typeof note === "string")
          .map((note) => sanitizeLlmVisibleText(note).slice(0, 120))
          .filter(Boolean)
          .slice(0, 2);
      }
    }

    const visualSection = normalizeVisualSection(
      json.visual_fixes,
      json.visual_passes,
      json.checklist,
      undefined,
      json.score,
      rawChecklist,
      normalizedBreakdown,
      {
        copyVariants: json.copy_variants as import("@/lib/audit-report").ReportCopyVariants | undefined,
        meta: json.meta as import("@/lib/audit-report").ReportMeta | undefined,
        checklist: json.checklist,
        audienceType,
        trafficSource,
        computedValues,
        pageContext,
      }
    );
    json.visual_fixes = visualSection.fixes;
    json.visual_passes = visualSection.passes;

    json.risk = deriveRiskFromScore(json.score);
    });

    const currentGapTexts = ((json.checklist as import("@/lib/audit-report").ReportChecklistItem[]) ?? [])
      .filter((item) => item.status !== "pass")
      .map((item) => item.text)
      .filter(Boolean);

    if (currentGapTexts.length > 0) {
      logRepeatingGapPatterns(currentGapTexts).catch((patternErr) => {
        console.error("[analyze] Gap pattern check failed:", patternErr);
      });
    }

    const reportId = generateReportId();
    const auditedUrl =
      typeof json.url === "string" && json.url.trim()
        ? json.url.trim()
        : url;

    const metricObservations = normalizeMetricObservations(json.metric_observations);
    const previewImage = await timing.measure("preview_ms", () => previewImagePromise);

    const adaptedCopy = adaptCopyVariants(pipelineResult.narrative.copy_variants ?? []);
    const copyVariants = adaptedCopy
      ? normalizeReportCopyVariants(adaptedCopy, parseBrandStage(brandStage))
      : (json.copy_variants as ReportCopyVariants | null) ?? null;

    const rawVisualFixes = (pipelineResult.narrative.visual_fixes ?? []).map((f) => ({
      ...f,
      dimension: f.category,
    }));
    const visualFixes = rawVisualFixes.length
      ? normalizeVisualSection(rawVisualFixes).fixes
      : (json.visual_fixes as import("@/lib/audit-report").ReportVisualFix[]) ?? [];

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
      checklist: json.checklist,
      copy_variants: copyVariants ?? undefined,
      score_potential: json.score_potential,
      meta: json.meta,
      issues: json.issues,
      suggestions: json.suggestions,
      copy: json.copy,
      brand_stage: brandStage,
      traffic_source: trafficSource,
      audience_type: audienceType,
      headline_directions: json.headline_directions,
      breakdown: json.breakdown,
      visual_fixes: visualFixes,
      visual_passes: json.visual_passes ?? [],
      hero_slot,
      generatedAt: new Date().toISOString(),
    };

    const reportSlug = buildReportSlug(reportId, auditedUrl);
    const previewImagePath = buildReportPreviewPath(reportSlug);

    if (isAuditReport(reportPayload)) {
      saveReportToDb({
        id: reportId,
        auditedUrl,
        report: reportPayload,
      }).catch((persistError) => {
        console.error("[analyze] Failed to persist report:", persistError);
      });

      scheduleReportOgBackfill(reportId, reportPayload, previewImage);
    }

    timing.log({
      outcome: "success",
      captureMode,
      reportId,
    });

    return NextResponse.json({
      ...json,
      reportId,
      reportSlug,
      url: auditedUrl,
      brand_stage: brandStage,
      traffic_source: trafficSource,
      audience_type: audienceType,
      headline_directions: json.headline_directions,
      generatedAt: reportPayload.generatedAt,
      previewImage: previewImagePath,
      metric_observations: metricObservations,
    }, { headers: rateLimitHeaders });
  } catch (error: any) {
    timing.log({
      outcome: "error",
      captureMode,
      message: error?.message || "Unknown server error",
    });

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