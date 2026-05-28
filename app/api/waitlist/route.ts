import { NextResponse } from "next/server";

import { isPreLaunchWaitlistActive } from "@/lib/pre-launch";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function POST(req: Request) {
  if (!isPreLaunchWaitlistActive()) {
    return NextResponse.json({ ok: true });
  }

  try {
    const body = (await req.json()) as { email?: string };
    const email = String(body.email ?? "").trim();

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    console.info("[waitlist]", email);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
