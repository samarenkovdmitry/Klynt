import { NextResponse } from "next/server";
import { captureWebsiteScreenshots } from "@/lib/analyze/capture-screenshots";
import { optimizeScreenshots } from "@/lib/analyze/optimize-image";
import { runVisionAnalysis } from "@/lib/analyze/run-analysis";

export const runtime = "nodejs";
export const maxDuration = 90;

async function blobToBase64(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}

function normalizeUrl(input: string) {
  if (!input) return "";

  let url = input.trim();

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  return url;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const rawUrl = (formData.get("url") as string) ?? "";
    const url = normalizeUrl(rawUrl);
    const uploadedScreenshot = formData.get("screenshot") as Blob | null;

    let screenshotsBase64: string[] = [];

    if (uploadedScreenshot) {
      screenshotsBase64 = [await blobToBase64(uploadedScreenshot)];
    } else if (url) {
      screenshotsBase64 = await captureWebsiteScreenshots(url);
    }

    if (screenshotsBase64.length === 0) {
      return NextResponse.json(
        { error: "Either URL or screenshot is required" },
        { status: 400 }
      );
    }

    screenshotsBase64 = await optimizeScreenshots(screenshotsBase64);

    const report = await runVisionAnalysis(url, screenshotsBase64);

    return NextResponse.json(report);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    console.error("ANALYZE ERROR:", error);

    return NextResponse.json(
      {
        error: message.includes("timeout")
          ? "Website loading timed out."
          : message || "Unknown server error",
      },
      { status: 500 }
    );
  }
}
