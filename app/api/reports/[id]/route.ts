import { NextResponse } from "next/server";

import { isIndexableReportId } from "@/lib/report-indexing";
import { buildReportPlainText } from "@/lib/report-text-content";
import {
  isDemoReportId,
  loadReportForPublicMetadata,
} from "@/lib/report-seo-loader";
import { isValidReportId } from "@/lib/report-id";
import { isSupabaseConfigured } from "@/lib/supabase-server";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

async function resolveReportId(context: RouteContext) {
  const params = await Promise.resolve(context.params);
  return params.id;
}

export async function GET(req: Request, context: RouteContext) {
  const reportId = await resolveReportId(context);
  const wantsText = new URL(req.url).searchParams.get("format") === "text";

  if (!isValidReportId(reportId)) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  if (!isDemoReportId(reportId) && !isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Report storage is not configured." },
      { status: 503 }
    );
  }

  try {
    const report = await loadReportForPublicMetadata(reportId);

    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    if (wantsText) {
      if (!isIndexableReportId(reportId)) {
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

    return NextResponse.json(report, {
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
