import { readFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import type { AuditReport } from "@/lib/audit-report";
import { composeReportOpenGraphImage } from "@/lib/report-og-image";
import { previewImageToBuffer } from "@/lib/report-seo";
import {
  canGenerateReportMetadata,
  isDemoReportId,
  loadReportForPublicMetadata,
} from "@/lib/report-seo-loader";
import { isSupabaseConfigured } from "@/lib/supabase-server";

export const REPORT_OG_IMAGE_HEADERS = {
  "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
} as const;

const FALLBACK_IMAGE_PATHS = [
  path.join(process.cwd(), "public", "og-fallback.jpg"),
  path.join(process.cwd(), ".next", "standalone", "public", "og-fallback.jpg"),
  path.join(process.cwd(), "app", "opengraph-image.jpg"),
  path.join(process.cwd(), ".next", "server", "app", "opengraph-image.jpg"),
];

import {
  REPORT_OG_PREVIEW_HEIGHT,
  REPORT_OG_PREVIEW_WIDTH,
} from "@/lib/report-preview-size";

const COMPOSE_ATTEMPTS = [
  { includeGrid: true, includePreview: true },
  { includeGrid: false, includePreview: true },
  { includeGrid: true, includePreview: false },
  { includeGrid: false, includePreview: false },
] as const;

async function loadDefaultOpenGraphImage() {
  for (const filePath of FALLBACK_IMAGE_PATHS) {
    try {
      return await readFile(filePath);
    } catch {
      continue;
    }
  }

  throw new Error("Default Open Graph image not found");
}

function pngOgResponse(buffer: Buffer) {
  return new Response(new Uint8Array(buffer), {
    headers: {
      ...REPORT_OG_IMAGE_HEADERS,
      "Content-Type": "image/png",
    },
  });
}

async function defaultOgResponse() {
  const fallback = await loadDefaultOpenGraphImage();

  try {
    const png = await sharp(fallback).png({ compressionLevel: 8 }).toBuffer();
    return pngOgResponse(png);
  } catch (error) {
    console.error("[report opengraph-image] fallback png convert failed", error);
    return pngOgResponse(fallback);
  }
}

function withOgHeaders(response: Response) {
  response.headers.set(
    "Cache-Control",
    "public, max-age=86400, stale-while-revalidate=604800"
  );
  response.headers.set("Content-Type", "image/png");

  return response;
}

async function normalizePreviewForOg(buffer: Buffer | null) {
  if (!buffer) {
    return null;
  }

  try {
    return await sharp(buffer)
      .resize(REPORT_OG_PREVIEW_WIDTH, REPORT_OG_PREVIEW_HEIGHT, {
        fit: "cover",
        position: "top",
      })
      .jpeg({ quality: 84, mozjpeg: true })
      .toBuffer();
  } catch (error) {
    console.error("[report opengraph-image] preview normalize failed", error);
    return null;
  }
}

async function resolvePreviewImageBuffer(previewImage?: string) {
  if (!previewImage) {
    return null;
  }

  const fromDataOrRemote = await previewImageToBuffer(previewImage);

  if (fromDataOrRemote) {
    return fromDataOrRemote;
  }

  if (previewImage.startsWith("/")) {
    const relativePath = previewImage.replace(/^\//, "");
    const candidatePaths = [
      path.join(process.cwd(), "public", relativePath),
      path.join(process.cwd(), ".next", "standalone", "public", relativePath),
    ];

    for (const filePath of candidatePaths) {
      try {
        return await readFile(filePath);
      } catch {
        continue;
      }
    }
  }

  return null;
}

async function composeOgResponse(
  report: AuditReport,
  previewImage?: string
) {
  const rawPreview =
    (previewImage ? await resolvePreviewImageBuffer(previewImage) : null) ??
    (await resolvePreviewImageBuffer(report.previewImage)) ??
    (await resolvePreviewImageBuffer(report.ogPreviewImage));
  const previewBuffer = await normalizePreviewForOg(rawPreview);

  for (const options of COMPOSE_ATTEMPTS) {
    try {
      const preview =
        options.includePreview && previewBuffer ? previewBuffer : null;

      return withOgHeaders(
        await composeReportOpenGraphImage(report, preview, options)
      );
    } catch (error) {
      console.error("[report opengraph-image] compose attempt failed", options, error);
    }
  }

  return null;
}

/** Pre-render a 1200×630 PNG data URL when a report is created. */
export async function generateReportOgPreviewDataUrl(
  report: AuditReport,
  previewImage?: string
): Promise<string | undefined> {
  const response = await composeOgResponse(report, previewImage);

  if (!response) {
    return undefined;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

export async function buildReportOpenGraphResponse(reportId: string) {
  if (!canGenerateReportMetadata(reportId)) {
    return defaultOgResponse();
  }

  if (!isDemoReportId(reportId) && !isSupabaseConfigured()) {
    return defaultOgResponse();
  }

  let report: AuditReport | null;

  try {
    report = await loadReportForPublicMetadata(reportId);
  } catch (error) {
    console.error("[report opengraph-image] report load failed", error);
    return defaultOgResponse();
  }

  if (!report) {
    return defaultOgResponse();
  }

  if (report.ogPreviewImage) {
    const stored = await resolvePreviewImageBuffer(report.ogPreviewImage);

    if (stored) {
      return pngOgResponse(stored);
    }
  }

  const composed = await composeOgResponse(report);

  if (composed) {
    return composed;
  }

  console.error("[report opengraph-image] all compose attempts failed", reportId);
  return defaultOgResponse();
}

/** @deprecated Use buildReportOpenGraphResponse instead. */
export async function buildReportOpenGraphJpeg(reportId: string) {
  const response = await buildReportOpenGraphResponse(reportId);
  return Buffer.from(await response.arrayBuffer());
}
