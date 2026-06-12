import { NextResponse } from "next/server";
import sharp from "sharp";

import { requestAuditAnalysis } from "@/lib/analyze-openai";
import { buildFullAuditPrompt } from "@/lib/analyze-prompts";
import { captureWebsiteScreenshots } from "@/lib/capture-website-screenshots";

import { isAuditReport, type AuditReport } from "@/lib/audit-report";
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
} from "@/lib/normalize-report-checklist";
import { normalizeReportCopyVariants } from "@/lib/normalize-report-copy-variants";
import { normalizeVisualSection } from "@/lib/report-visual-fixes";
import { sanitizeLlmVisibleText } from "@/lib/llm-placeholder-text";
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

    // PRIORITY #1 — uploaded screenshot
    if (uploadedScreenshot) {
      captureMode = "upload";
      const uploadedBase64 = await timing.measure("upload_ms", () =>
        blobToBase64(uploadedScreenshot)
      );

      screenshotsBase64 = [uploadedBase64];
    }

    // PRIORITY #2 — auto capture from URL
    else if (url) {
      captureMode = "url";
      screenshotsBase64 = await timing.measure("capture_ms", () =>
        captureWebsiteScreenshots(url)
      );
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
    screenshotsBase64 = await timing.measure("optimize_ms", () =>
      optimizeScreenshots(screenshotsBase64)
    );

    const rawHeroBase64 = rawScreenshotsBase64[0];
    const previewImagePromise = rawHeroBase64
      ? buildReportPreviewImage(rawHeroBase64).catch((previewError) => {
          console.error("[analyze] Failed to build preview image:", previewError);
          return undefined;
        })
      : Promise.resolve(undefined);
    const basePrompt = buildFullAuditPrompt(brandStage, trafficSource, audienceType);

    const json: Record<string, any> = await timing.measure("openai_ms", () =>
      requestAuditAnalysis({
        basePrompt,
        url,
        screenshotsBase64,
      })
    );

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

    const finalized = finalizeReportChecklist(
      rawChecklist,
      Number(json.score) || 0,
      json.score_potential as
        | { target: number; chips: { label: string; delta: string }[] }
        | undefined
    );
    json.checklist = finalized.checklist;
    json.score_potential = finalized.scorePotential;

    const visualSection = normalizeVisualSection(
      json.visual_fixes,
      json.visual_passes,
      json.checklist,
      undefined,
      Number(json.score) || 0,
      rawChecklist
    );
    json.visual_fixes = visualSection.fixes;
    json.visual_passes = visualSection.passes;

    if (json.copy_variants && typeof json.copy_variants === "object") {
      json.copy_variants = normalizeReportCopyVariants(
        json.copy_variants as import("@/lib/audit-report").ReportCopyVariants,
        parseBrandStage(json.brand_stage ?? brandStage)
      );
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

    const { breakdown: normalizedBreakdown } = normalizeReportBreakdown({
      score: Number(json.score) || 0,
      breakdown: json.breakdown,
      issues: json.issues,
    });

    json.breakdown = normalizedBreakdown;
    json.risk = deriveRiskFromScore(Number(json.score) || 0);
    });

    const reportId = generateReportId();
    const auditedUrl =
      typeof json.url === "string" && json.url.trim()
        ? json.url.trim()
        : url;

    const metricObservations = normalizeMetricObservations(json.metric_observations);
    const previewImage = await timing.measure("preview_ms", () => previewImagePromise);

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
      copy_variants: json.copy_variants,
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
      generatedAt: new Date().toISOString(),
    };

    const reportSlug = buildReportSlug(reportId, auditedUrl);
    const previewImagePath = buildReportPreviewPath(reportSlug);

    if (isAuditReport(reportPayload)) {
      try {
        await timing.measure("db_ms", () =>
          saveReportToDb({
            id: reportId,
            auditedUrl,
            report: reportPayload,
          })
        );
      } catch (persistError) {
        console.error("[analyze] Failed to persist report:", persistError);
      }

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