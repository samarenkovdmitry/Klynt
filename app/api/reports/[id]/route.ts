import { NextResponse } from "next/server";

import { loadReportFromDb } from "@/lib/reports-db";
import { isValidReportId } from "@/lib/report-id";
import { isSupabaseConfigured } from "@/lib/supabase-server";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

async function resolveReportId(context: RouteContext) {
  const params = await Promise.resolve(context.params);
  return params.id;
}

export async function GET(_req: Request, context: RouteContext) {
  const reportId = await resolveReportId(context);

  if (!isValidReportId(reportId)) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Report storage is not configured." },
      { status: 503 }
    );
  }

  try {
    const report = await loadReportFromDb(reportId);

    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
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
