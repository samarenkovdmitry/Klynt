import { readFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

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
  path.join(process.cwd(), "app", "opengraph-image.jpg"),
  path.join(process.cwd(), ".next", "server", "app", "opengraph-image.jpg"),
];

const PREVIEW_OG_WIDTH = 520;
const PREVIEW_OG_HEIGHT = 400;

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

function withOgHeaders(response: Response) {
  response.headers.set(
    "Cache-Control",
    "public, max-age=86400, stale-while-revalidate=604800"
  );

  return response;
}

function defaultOgResponse(buffer: Buffer) {
  return new Response(new Uint8Array(buffer), {
    headers: {
      ...REPORT_OG_IMAGE_HEADERS,
      "Content-Type": "image/jpeg",
    },
  });
}

async function normalizePreviewForOg(buffer: Buffer | null) {
  if (!buffer) {
    return null;
  }

  try {
    return await sharp(buffer)
      .resize(PREVIEW_OG_WIDTH, PREVIEW_OG_HEIGHT, {
        fit: "cover",
        position: "top",
      })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
  } catch (error) {
    console.error("[report opengraph-image] preview normalize failed", error);
    return null;
  }
}

const COMPOSE_ATTEMPTS = [
  { includePattern: true, includePreview: true },
  { includePattern: false, includePreview: true },
  { includePattern: true, includePreview: false },
  { includePattern: false, includePreview: false },
] as const;

export async function buildReportOpenGraphResponse(reportId: string) {
  if (!canGenerateReportMetadata(reportId)) {
    return defaultOgResponse(await loadDefaultOpenGraphImage());
  }

  if (!isDemoReportId(reportId) && !isSupabaseConfigured()) {
    return defaultOgResponse(await loadDefaultOpenGraphImage());
  }

  let report;

  try {
    report = await loadReportForPublicMetadata(reportId);
  } catch (error) {
    console.error("[report opengraph-image] report load failed", error);
    return defaultOgResponse(await loadDefaultOpenGraphImage());
  }

  if (!report) {
    return defaultOgResponse(await loadDefaultOpenGraphImage());
  }

  const rawPreview =
    (await previewImageToBuffer(report.previewImage)) ??
    (await previewImageToBuffer(report.ogPreviewImage));
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

  console.error("[report opengraph-image] all compose attempts failed", reportId);
  return defaultOgResponse(await loadDefaultOpenGraphImage());
}

/** @deprecated Use buildReportOpenGraphResponse instead. */
export async function buildReportOpenGraphJpeg(reportId: string) {
  const response = await buildReportOpenGraphResponse(reportId);
  return Buffer.from(await response.arrayBuffer());
}
