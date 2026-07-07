import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { reportId } = await req.json().catch(() => ({}));

  if (!reportId || typeof reportId !== "string") {
    return NextResponse.json({ error: "Missing reportId" }, { status: 400 });
  }

  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) {
    console.error("[payment/create] NOWPAYMENTS_API_KEY not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const res = await fetch("https://api.nowpayments.io/v1/invoice", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price_amount: 12,
      price_currency: "usd",
      pay_currency: "usdterc20",
      order_description: reportId,
      ipn_callback_url: `${baseUrl}/api/payment/confirm`,
      success_url: `${baseUrl}/report/${reportId}?unlocked=true`,
      cancel_url: `${baseUrl}/report/${reportId}`,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[payment/create] NOWPayments error:", res.status, text);
    return NextResponse.json({ error: "Payment provider error" }, { status: 502 });
  }

  const data = await res.json();
  const payment_url = data.invoice_url;

  if (!payment_url) {
    console.error("[payment/create] No invoice_url in response:", data);
    return NextResponse.json({ error: "No payment URL returned" }, { status: 502 });
  }

  return NextResponse.json({ payment_url });
}
