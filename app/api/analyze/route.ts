import { NextResponse } from "next/server";
import sharp from "sharp";

import { extractPageData, isExtractionEmpty } from "@/lib/analysis/extraction";
import type { PageData, PageMetaSnapshot, StoredExtraction } from "@/lib/analysis/extraction";
import { applyDomGroundTruth } from "@/lib/analysis/report-enrichment";
import { captureWebsiteScreenshots } from "@/lib/capture-website-screenshots";
import { buildReportPreviewImage } from "@/lib/report-preview";

import { createAnalyzeTiming } from "@/lib/analyze-timing";
import {
  buildRateLimitHeaders,
  checkRateLimit,
  getClientIp,
} from "@/lib/rate-limit";
import { generateReportId } from "@/lib/report-id";
import { buildReportSlug } from "@/lib/report-slug";
import {
  parseAudienceType,
  parseTrafficSource,
} from "@/lib/audit-context";
import { parseBrandStage } from "@/lib/brand-stage";
import { validateAuditUrl } from "@/lib/validate-audit-url";
import {
  createServerSupabase,
  isSupabaseConfigured,
} from "@/lib/supabase-server";

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
    let pageMeta: PageMetaSnapshot | undefined;
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
      pageMeta = captureResult.pageMeta;
      bodyText = captureResult.bodyText;
    }

    if (screenshotsBase64.length === 0 && process.env.USE_MOCK_REPORT !== "true") {
      return NextResponse.json(
        { error: "Either URL or screenshot is required" },
        { status: 400 }
      );
    }

    const rawHeroBase64 = screenshotsBase64[0];

    const previewImage = rawHeroBase64
      ? await timing.measure("preview_ms", () => buildReportPreviewImage(rawHeroBase64))
      : undefined;

    screenshotsBase64 = await timing.measure("optimize_ms", () =>
      optimizeScreenshots(screenshotsBase64)
    );

    const pageData: PageData = {
      url,
      html: bodyText,
      screenshot: rawHeroBase64 ?? "",
      meta: {
        title: pageMeta?.title ?? "",
        description: pageMeta?.description ?? "",
      },
      puppeteerExtracted: {
        ctaText: computedValues?.cta_text ? [computedValues.cta_text] : [],
        headlineText: computedValues?.h1_text ?? "",
        subheadlineText: computedValues?.sub_text ?? "",
        socialProofAboveFold: computedValues?.social_proof_above_fold ?? false,
        loadTimeMs: 0,
        mobileViewportWidth: pageMeta?.hasMobileViewportMeta ? 390 : 0,
      },
    };

    const { result: extraction, usage: extractionUsage } = await timing.measure(
      "extraction_ms",
      () => extractPageData(pageData)
    );

    const enrichedExtraction = applyDomGroundTruth(extraction, computedValues, pageMeta);

    if (isExtractionEmpty(enrichedExtraction)) {
      timing.log({ outcome: "empty_extraction", captureMode });

      return NextResponse.json(
        {
          error:
            captureMode === "upload"
              ? "Could not read text from the screenshot. Try a clearer hero capture or analyze by URL."
              : "Could not extract page content. The site may block automated access — try uploading a screenshot.",
        },
        { status: 422, headers: rateLimitHeaders }
      );
    }

    console.log(
      `[analyze] Extraction done: ${enrichedExtraction.issues.length} issues, $${extractionUsage.estimatedCostUsd.toFixed(5)}`
    );

    const reportId = generateReportId();
    const auditedUrl = url;
    const reportSlug = buildReportSlug(reportId, auditedUrl);

    const storedExtraction: StoredExtraction = {
      ...enrichedExtraction,
      viewport_width: computedValues?.viewport_width ?? 1280,
      computed_values: computedValues,
      ...(pageMeta ? { page_meta: pageMeta } : {}),
      ...(previewImage ? { previewImage } : {}),
    };

    if (isSupabaseConfigured()) {
      const supabase = createServerSupabase();
      const { error } = await supabase.from("reports").insert({
        id: reportId,
        audited_url: auditedUrl,
        payload: {},
        extraction: storedExtraction,
        status: "processing",
        brand_stage: brandStage,
        traffic_source: trafficSource,
        audience_type: audienceType,
      });

      if (error) {
        console.error("[analyze] Failed to save extraction to DB:", error.message);
      }
    }

    timing.log({ outcome: "success", captureMode, reportId });

    return NextResponse.json(
      {
        reportId,
        reportSlug,
        status: "processing",
        brand_stage: brandStage,
        traffic_source: trafficSource,
        audience_type: audienceType,
      },
      { headers: rateLimitHeaders }
    );
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
      { status: 500 }
    );
  }
}
