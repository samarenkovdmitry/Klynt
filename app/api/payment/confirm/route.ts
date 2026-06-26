import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  const secret = process.env.LEMONSQUEEZY_SIGNING_SECRET;
  if (!secret) {
    console.error("[payment] LEMONSQUEEZY_SIGNING_SECRET not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const hmac = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (hmac !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.meta?.event_name !== "order_created") {
    return NextResponse.json({ ok: true });
  }

  // Only unlock on paid orders (guard against refunds / pending)
  const orderStatus = event.data?.attributes?.status;
  if (orderStatus !== "paid") {
    return NextResponse.json({ ok: true });
  }

  const reportId = event.meta?.custom_data?.report_id;
  if (!reportId) {
    console.error("[payment] No report_id in custom_data");
    return NextResponse.json({ error: "Missing report_id" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    console.error("[payment] Supabase not configured");
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }

  const supabase = createServerSupabase();

  const { error } = await supabase
    .from("reports")
    .update({ unlocked_at: new Date().toISOString() })
    .eq("id", reportId);

  if (error) {
    console.error("[payment] Supabase update failed:", error.message);
    return NextResponse.json({ error: "DB update failed" }, { status: 500 });
  }

  console.log(`[payment] Report ${reportId} unlocked`);

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  void fetch(`${baseUrl}/api/narrative`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reportId }),
  }).catch((err) =>
    console.error("[payment] narrative trigger failed:", err)
  );

  return NextResponse.json({ ok: true });
}
