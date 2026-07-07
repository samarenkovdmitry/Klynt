import { NextRequest, NextResponse } from "next/server";

import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase-server";

// Only available in development and preview environments
export async function POST(req: NextRequest) {
  const isProduction =
    process.env.VERCEL_ENV === "production" ||
    (process.env.NODE_ENV === "production" && !process.env.VERCEL_ENV);

  if (isProduction) {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const { reportId } = await req.json().catch(() => ({}));

  if (!reportId || typeof reportId !== "string") {
    return NextResponse.json({ error: "Missing reportId" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }

  const supabase = createServerSupabase();

  const { error } = await supabase
    .from("reports")
    .update({ unlocked_at: new Date().toISOString() })
    .eq("id", reportId);

  if (error) {
    console.error("[payment/test] Supabase update failed:", error.message);
    return NextResponse.json({ error: "DB update failed" }, { status: 500 });
  }

  console.log(`[payment/test] Report ${reportId} unlocked`);

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  void fetch(`${baseUrl}/api/narrative`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reportId }),
  }).catch((err) =>
    console.error("[payment/test] narrative trigger failed:", err)
  );

  return NextResponse.json({ ok: true, reportId, unlockedAt: new Date().toISOString() });
}
