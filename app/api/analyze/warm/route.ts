import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";

export const runtime = "nodejs";

/** Pre-extract Chromium on /analyze visit so the first audit starts faster. */
export async function GET() {
  try {
    await chromium.executablePath();

    return NextResponse.json(
      { ok: true },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("[analyze warm]", error);

    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
