import { readFile } from "node:fs/promises";
import path from "node:path";

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

export async function buildReportOpenGraphResponse(reportId: string) {
  if (!canGenerateReportMetadata(reportId)) {
    const fallback = await loadDefaultOpenGraphImage();
    return new Response(fallback, {
      headers: {
        ...REPORT_OG_IMAGE_HEADERS,
        "Content-Type": "image/jpeg",
      },
    });
  }

  if (!isDemoReportId(reportId) && !isSupabaseConfigured()) {
    const fallback = await loadDefaultOpenGraphImage();
    return new Response(fallback, {
      headers: {
        ...REPORT_OG_IMAGE_HEADERS,
        "Content-Type": "image/jpeg",
      },
    });
  }

  try {
    const report = await loadReportForPublicMetadata(reportId);

    if (!report) {
      const fallback = await loadDefaultOpenGraphImage();
      return new Response(fallback, {
        headers: {
          ...REPORT_OG_IMAGE_HEADERS,
          "Content-Type": "image/jpeg",
        },
      });
    }

    const previewBuffer =
      (await previewImageToBuffer(report.previewImage)) ??
      (await previewImageToBuffer(report.ogPreviewImage));

    return withOgHeaders(await composeReportOpenGraphImage(report, previewBuffer));
  } catch (error) {
    console.error("[report opengraph-image]", error);

    const fallback = await loadDefaultOpenGraphImage();
    return new Response(fallback, {
      headers: {
        ...REPORT_OG_IMAGE_HEADERS,
        "Content-Type": "image/jpeg",
      },
    });
  }
}

/** @deprecated Use buildReportOpenGraphResponse instead. */
export async function buildReportOpenGraphJpeg(reportId: string) {
  const response = await buildReportOpenGraphResponse(reportId);
  return Buffer.from(await response.arrayBuffer());
}
