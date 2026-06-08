import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { canGenerateReportMetadata, loadReportForPublicMetadata } from "@/lib/report-seo-loader";
import { isDemoReportRouteParam, resolveReportRouteParam } from "@/lib/report-route";
import { previewImageToBuffer } from "@/lib/report-seo";
import { isSupabaseConfigured } from "@/lib/supabase-server";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

async function resolveRouteParam(context: RouteContext) {
  const params = await Promise.resolve(context.params);
  return params.id;
}

async function readPublicAsset(relativePath: string) {
  const filePath = path.join(process.cwd(), "public", relativePath.replace(/^\//, ""));
  return readFile(filePath);
}

export async function GET(req: Request, context: RouteContext) {
  const routeParam = await resolveRouteParam(context);

  if (!canGenerateReportMetadata(routeParam)) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  if (!isDemoReportRouteParam(routeParam) && !isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Report storage is not configured." },
      { status: 503 }
    );
  }

  try {
    const resolved = await resolveReportRouteParam(routeParam);
    const report = await loadReportForPublicMetadata(routeParam);

    if (!resolved || !report?.previewImage) {
      return NextResponse.json({ error: "Preview not found." }, { status: 404 });
    }

    const previewImage = report.previewImage;

    if (previewImage.startsWith("/") && !previewImage.startsWith("/api/")) {
      try {
        const buffer = await readPublicAsset(previewImage);

        return new Response(new Uint8Array(buffer), {
          headers: {
            "Content-Type": "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      } catch {
        return NextResponse.json({ error: "Preview not found." }, { status: 404 });
      }
    }

    const buffer = await previewImageToBuffer(previewImage);

    if (!buffer) {
      return NextResponse.json({ error: "Preview not found." }, { status: 404 });
    }

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[reports preview GET]", error);

    return NextResponse.json(
      { error: "Could not load preview." },
      { status: 500 }
    );
  }
}
