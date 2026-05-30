import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";
import sharp from "sharp";

import { isValidReportId } from "@/lib/report-id";
import { previewImageToBuffer } from "@/lib/report-seo";
import { loadReportFromDb } from "@/lib/reports-db";
import { isSupabaseConfigured } from "@/lib/supabase-server";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

async function resolveReportId(context: RouteContext) {
  const params = await Promise.resolve(context.params);
  return params.id;
}

async function loadDefaultOpenGraphImage() {
  const filePath = path.join(process.cwd(), "app", "opengraph-image.jpg");
  return readFile(filePath);
}

const IMAGE_CACHE_HEADERS = {
  "Content-Type": "image/jpeg",
  "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
};

export async function GET(_req: Request, context: RouteContext) {
  const reportId = await resolveReportId(context);

  if (!isValidReportId(reportId) || !isSupabaseConfigured()) {
    const fallback = await loadDefaultOpenGraphImage();

    return new NextResponse(fallback, { headers: IMAGE_CACHE_HEADERS });
  }

  try {
    const report = await loadReportFromDb(reportId);
    const previewBuffer = previewImageToBuffer(report?.previewImage);

    if (!previewBuffer) {
      const fallback = await loadDefaultOpenGraphImage();

      return new NextResponse(fallback, { headers: IMAGE_CACHE_HEADERS });
    }

    const ogImage = await sharp(previewBuffer)
      .resize(1200, 630, {
        fit: "cover",
        position: "top",
      })
      .jpeg({ quality: 86, mozjpeg: true })
      .toBuffer();

    return new NextResponse(new Uint8Array(ogImage), {
      headers: IMAGE_CACHE_HEADERS,
    });
  } catch (error) {
    console.error("[reports opengraph-image GET]", error);

    const fallback = await loadDefaultOpenGraphImage();

    return new NextResponse(fallback, { headers: IMAGE_CACHE_HEADERS });
  }
}
