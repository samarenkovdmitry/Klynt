import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-nowpayments-sig");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!secret) {
    console.error("[payment/confirm] NOWPAYMENTS_IPN_SECRET not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // NOWPayments IPN: HMAC-SHA-512 of JSON body with keys sorted alphabetically
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sortedBody = JSON.stringify(
    Object.keys(parsed)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => { acc[key] = parsed[key]; return acc; }, {})
  );

  const hmac = crypto.createHmac("sha512", secret).update(sortedBody).digest("hex");

  if (hmac !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { payment_status, order_description } = parsed as {
    payment_status?: string;
    order_description?: string;
  };

  if (payment_status !== "finished") {
    return NextResponse.json({ ok: true });
  }

  const reportId = order_description?.trim();
  if (!reportId) {
    console.error("[payment/confirm] No reportId in order_description");
    return NextResponse.json({ error: "Missing reportId" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    console.error("[payment/confirm] Supabase not configured");
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }

  const supabase = createServerSupabase();

  const { error } = await supabase
    .from("reports")
    .update({ unlocked_at: new Date().toISOString() })
    .eq("id", reportId);

  if (error) {
    console.error("[payment/confirm] Supabase update failed:", error.message);
    return NextResponse.json({ error: "DB update failed" }, { status: 500 });
  }

  console.log(`[payment/confirm] Report ${reportId} unlocked`);

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  void fetch(`${baseUrl}/api/narrative`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reportId }),
  }).catch((err) =>
    console.error("[payment/confirm] narrative trigger failed:", err)
  );

  return NextResponse.json({ ok: true });
}
