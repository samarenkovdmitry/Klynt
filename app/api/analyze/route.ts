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

  async function attemptScreenshot() {
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

      // Modern user-agent to bypass bot protection
      await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
      );

      await page.setViewport({ width: 1440, height: 1200 });

      // More stable loading strategy
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      // Give page time to render
      await new Promise(res => setTimeout(res, 2000));

      const screenshotBuffer = await page.screenshot({
        type: "jpeg",
        quality: 80,
        fullPage: true,
      });

      return Buffer.from(screenshotBuffer).toString("base64");
    } catch (err) {
      console.error("Screenshot attempt failed:", err);
      return null;
    } finally {
      await browser.close();
    }
  }

  // Try twice
  let result = await attemptScreenshot();
  if (result) return result;

  console.log("Retrying screenshot...");
  result = await attemptScreenshot();
  if (result) return result;

  console.error("❌ Both screenshot attempts failed");
  return null;
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

    // Uploaded screenshot
    if (screenshot) {
      screenshotBase64 = await blobToBase64(screenshot);
      if (!screenshotBase64) {
        console.error("❌ Uploaded screenshot produced empty base64");
      }
    }

    // URL screenshot
    if (!screenshot && url) {
      screenshotBase64 = await captureUrlScreenshot(url);
    }

    console.log("🔥 screenshotBase64 exists:", !!screenshotBase64);

    const basePrompt = `
You are a senior UX auditor. Use the screenshot as the primary source of truth.
Use the URL only for context and semantics.

Return ONLY valid JSON. No markdown, no comments, no extra text.

You MUST return JSON in the following flat structure:

{
  "url": "string",
  "score": number,
  "risk": "low" | "medium" | "high",
  "issues": [...],
  "suggestions": [...],
  "copy": [...],
  "clarity": number,
  "navigation": number,
  "visuals": number,
  "trust": number,
  "conversion": number
}

Rules:
- 3–7 issues, 3–7 suggestions, 2–6 copy items.
- Impact values: negative integers (-20 to -4) for issues, positive (4 to 20) for suggestions and copy.
- If you only have one impact metric, set the second metric to "" and value to 0.
- Bullets: 2–4 items, 2–4 words each, no verbs.
- No markdown. No commentary. Only JSON.
`;

    const inputContent: any[] = [
      {
        type: "text",
        text: basePrompt
      },
      {
        type: "text",
        text: 'Website URL: ${url}'
      }
    ];

    if (screenshotBase64) {
      inputContent.push({
        type: "input_image",
        image_url: `data:image/jpeg;base64,${screenshotBase64}`
      });
    }

    // -----------------------------
    // CORRECT RESPONSES API FORMAT
    // -----------------------------
    const response = await client.responses.create({
      model: "gpt-4.1",
      input: inputContent,
      temperature: 0.2,
    });

    const raw = response.output_text;

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
