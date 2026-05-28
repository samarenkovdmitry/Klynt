import { NextResponse } from "next/server";

import { isPreLaunchWaitlistActive } from "@/lib/pre-launch";
import {
  isValidReportUrl,
  sendWaitlistEmail,
} from "@/lib/send-waitlist-email";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function POST(req: Request) {
  if (!isPreLaunchWaitlistActive()) {
    return NextResponse.json({ ok: true });
  }

  try {
    const body = (await req.json()) as { email?: string; reportUrl?: string };
    const email = String(body.email ?? "").trim();
    const reportUrl = String(body.reportUrl ?? "").trim();

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (!reportUrl || !isValidReportUrl(reportUrl)) {
      return NextResponse.json(
        { error: "Invalid report link." },
        { status: 400 }
      );
    }

    await sendWaitlistEmail({ email, reportUrl });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";

    console.error("[waitlist]", error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
