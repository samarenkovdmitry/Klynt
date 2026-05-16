import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// -----------------------------
// HELPERS
// -----------------------------
async function blobToBase64(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}

// -----------------------------
// SERVER-SIDE SCREENSHOT
// -----------------------------
async function captureUrlScreenshot(url: string): Promise<string | null> {
  const puppeteer = await import("puppeteer");

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  async function attempt() {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
      ],
    });

    try {
      const page = await browser.newPage();

      await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
      );

      await page.setViewport({ width: 1440, height: 1200 });

      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      await new Promise(res => setTimeout(res, 2000));

      const buffer = await page.screenshot({
        type: "jpeg",
        quality: 80,
        fullPage: true,
      });

      return Buffer.from(buffer).toString("base64");
    } catch (e) {
      console.error("Screenshot attempt failed:", e);
      return null;
    } finally {
      await browser.close();
    }
  }

  let result = await attempt();
  if (result) return result;

  console.log("Retrying screenshot...");
  result = await attempt();
  return result;
}

// -----------------------------
// ROUTE HANDLER
// -----------------------------
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const url = (formData.get("url") as string) ?? "";
    const screenshot = formData.get("screenshot") as Blob | null;

    let screenshotBase64: string | null = null;

    if (screenshot) {
      screenshotBase64 = await blobToBase64(screenshot);
    }

    if (!screenshot && url) {
      screenshotBase64 = await captureUrlScreenshot(url);
    }

    console.log("🔥 screenshotBase64 exists:", !!screenshotBase64);

    if (!screenshotBase64) {
      return NextResponse.json(
        { error: "Failed to capture screenshot" },
        { status: 500 }
      );
    }

    const basePrompt = `
You are a senior UX auditor. Use the screenshot as the primary source of truth.
Use the URL only for context and semantics.

Return ONLY valid JSON. No markdown, no comments, no extra text.
`;

    // -----------------------------
    // VISION CHAT COMPLETIONS (рабочий мультимодальный API)
    // -----------------------------
    const response = await client.chat.completions.create(
      {
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: basePrompt,
          },
          {
            role: "user",
            content: [
              {
                type: "input_image",
                image_url: `data:image/jpeg;base64,${screenshotBase64}`,
              },
              {
                type: "text",
                text: `Website URL: ${url}`,
              },
            ],
          },
        ],
      } as any // <‑‑ обязательно
    );

    const raw = response.choices[0].message.content;

    if (!raw) {
      return NextResponse.json(
        { error: "Model returned empty response" },
        { status: 500 }
      );
    }

    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json(
        { error: "Model did not return JSON", raw },
        { status: 500 }
      );
    }

    const jsonString = match[0];

    let json;
    try {
      json = JSON.parse(jsonString);
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid JSON from model", raw: jsonString },
        { status: 500 }
      );
    }

    return NextResponse.json(json);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
