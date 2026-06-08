import { NextResponse } from "next/server";

import { toReportApiPayload } from "@/lib/report-api-payload";
import { isIndexableReportRouteParam } from "@/lib/report-indexing";
import { canGenerateReportMetadata, loadReportForPublicMetadata } from "@/lib/report-seo-loader";
import { isDemoReportRouteParam, resolveReportRouteParam } from "@/lib/report-route";
import { buildReportPlainText } from "@/lib/report-text-content";
import { isSupabaseConfigured } from "@/lib/supabase-server";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

async function resolveRouteParam(context: RouteContext) {
  const params = await Promise.resolve(context.params);
  return params.id;
}

export async function GET(req: Request, context: RouteContext) {
  const routeParam = await resolveRouteParam(context);
  const wantsText = new URL(req.url).searchParams.get("format") === "text";

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

    if (!resolved || !report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    if (wantsText) {
      if (!isIndexableReportRouteParam(resolved.slug)) {
        return NextResponse.json(
          { error: "Plain-text export is not available for this report." },
          { status: 403 }
        );
      }

      return new Response(buildReportPlainText(report), {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        },
      });
    }

    return NextResponse.json(toReportApiPayload(report), {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("[reports GET]", error);

    return NextResponse.json(
      { error: "Could not load report." },
      { status: 500 }
    );
  }
}
