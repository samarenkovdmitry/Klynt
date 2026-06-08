import { NextResponse } from "next/server";
import sharp from "sharp";

import { scheduleFullAnalyzeBackfill } from "@/lib/analyze-full-backfill";
import { normalizeHeroAuditJson } from "@/lib/analyze-normalize";
import { requestHeroAuditAnalysis } from "@/lib/analyze-openai";
import { buildHeroAuditPrompt } from "@/lib/analyze-prompts";
import { isHeroAuditReport, type AuditReport } from "@/lib/audit-report";
import { captureWebsiteScreenshots } from "@/lib/capture-website-screenshots";
import {
  parseAudienceType,
  parseTrafficSource,
} from "@/lib/audit-context";
import { parseBrandStage } from "@/lib/brand-stage";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { generateReportId } from "@/lib/report-id";
import { buildReportSlug } from "@/lib/report-slug";
import { buildReportPreviewImage } from "@/lib/report-preview";
import { buildReportPreviewPath } from "@/lib/report-preview-url";
import { saveReportToDb } from "@/lib/reports-db";
import { validateAuditUrl } from "@/lib/validate-audit-url";

export const runtime = "nodejs";
export const maxDuration = 90;

const ANALYZE_RATE_LIMIT = Number(process.env.ANALYZE_RATE_LIMIT) || 8;
const ANALYZE_RATE_WINDOW_MS =
  Number(process.env.ANALYZE_RATE_WINDOW_MS) || 60 * 60 * 1000;
const MAX_SCREENSHOT_BYTES = 20 * 1024 * 1024;

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

function normalizeUrl(input: string) {
  if (!input) return "";

  let url = input.trim();

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  return url;
}

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

    if (uploadedScreenshot) {
      const uploadedBase64 = await blobToBase64(uploadedScreenshot);
      screenshotsBase64 = [uploadedBase64];
    } else if (url) {
      screenshotsBase64 = await captureWebsiteScreenshots(url);
    }

    if (screenshotsBase64.length === 0) {
      return NextResponse.json(
        { error: "Either URL or screenshot is required" },
        { status: 400 }
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

    const heroPrompt = buildHeroAuditPrompt(brandStage, trafficSource, audienceType);

    const heroRaw = await requestHeroAuditAnalysis({
      basePrompt: heroPrompt,
      url,
      screenshotsBase64,
    });

    const reportId = generateReportId();
    const generatedAt = new Date().toISOString();
    const previewImage = await previewImagePromise;

    const partialReport = normalizeHeroAuditJson(heroRaw, {
      url,
      brandStage,
      trafficSource,
      audienceType,
      previewImage,
      generatedAt,
    });

    const auditedUrl = partialReport.url?.trim() || url;
    const reportSlug = buildReportSlug(reportId, auditedUrl);
    const previewImagePath = buildReportPreviewPath(reportSlug);

    if (isHeroAuditReport(partialReport)) {
      try {
        await saveReportToDb({
          id: reportId,
          auditedUrl,
          report: partialReport,
        });
      } catch (persistError) {
        console.error("[analyze] Failed to persist partial report:", persistError);
      }

      scheduleFullAnalyzeBackfill({
        reportId,
        auditedUrl,
        url,
        screenshotsBase64,
        brandStage,
        trafficSource,
        audienceType,
        previewImage,
        generatedAt,
      });
    }

    return NextResponse.json({
      ...heroRaw,
      reportId,
      reportSlug,
      url: auditedUrl,
      brand_stage: brandStage,
      traffic_source: trafficSource,
      audience_type: audienceType,
      generatedAt,
      previewImage: previewImagePath,
      analysis_status: "partial" satisfies AuditReport["analysis_status"],
      issues: [],
      suggestions: [],
      copy: [],
      metric_observations: partialReport.metric_observations,
      score: partialReport.score,
      risk: partialReport.risk,
      summary: partialReport.summary,
      verdict: partialReport.verdict,
      key_observation: partialReport.key_observation,
      confidence: partialReport.confidence,
      breakdown: partialReport.breakdown,
    });
  } catch (error: any) {
    console.error("ANALYZE ERROR:");
    console.error(error);
    console.error(error?.stack);

    return NextResponse.json(
      {
        error: error?.message?.includes("timeout")
          ? "Website loading timed out."
          : error.message || "Unknown server error",
      },
      {
        status: 500,
      }
    );
  }
}
