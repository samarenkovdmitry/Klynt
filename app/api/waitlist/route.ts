import { NextResponse } from "next/server";

import { isPreLaunchWaitlistActive } from "@/lib/pre-launch";
import {
  isValidReportUrl,
  sendWaitlistEmail,
} from "@/lib/send-waitlist-email";
import {
  getSupabaseConfigError,
  isSupabaseConfigured,
} from "@/lib/supabase-server";
import {
  getReportIdFromReportUrl,
  isValidReportId,
  saveWaitlistEmail,
} from "@/lib/waitlist-emails";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function POST(req: Request) {
  if (!isPreLaunchWaitlistActive()) {
    return NextResponse.json({ ok: true });
  }

  if (!isSupabaseConfigured()) {
    const configError = getSupabaseConfigError();
    console.error("[waitlist]", configError);

    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development" && configError
            ? configError
            : "Waitlist is temporarily unavailable. Please try again later.",
      },
      { status: 503 }
    );
  }

  try {
    const body = (await req.json()) as {
      email?: string;
      reportUrl?: string;
      reportId?: string;
    };
    const email = String(body.email ?? "").trim();
    const reportUrl = String(body.reportUrl ?? "").trim();
    const reportIdFromBody = String(body.reportId ?? "").trim();

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

    const reportIdFromUrl = await getReportIdFromReportUrl(reportUrl);
    const reportId = reportIdFromBody || reportIdFromUrl || "";

    if (!isValidReportId(reportId)) {
      return NextResponse.json(
        { error: "Invalid report." },
        { status: 400 }
      );
    }

    if (reportIdFromUrl && reportIdFromUrl !== reportId) {
      return NextResponse.json(
        { error: "Report does not match the link." },
        { status: 400 }
      );
    }

    await saveWaitlistEmail({ email, reportId });
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
