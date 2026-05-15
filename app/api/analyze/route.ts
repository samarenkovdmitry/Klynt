import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// -----------------------------
// HELPERS
// -----------------------------
async function fileToBase64(file: File) {
  const buffer = await file.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

async function captureUrlScreenshot(url: string): Promise<string | null> {
  try {
    const puppeteer = await import("puppeteer");

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    const screenshotBuffer = await page.screenshot({
      type: "png",
      fullPage: true,
    });

    await browser.close();

    return Buffer.from(screenshotBuffer).toString("base64");
  } catch (err) {
    console.error("Puppeteer screenshot failed:", err);
    return null;
  }
}

// -----------------------------
// ROUTE HANDLER
// -----------------------------
export async function POST(req: Request) {
  console.log("🔥 API ROUTE HIT");

  try {
    const formData = await req.formData();

    const url = (formData.get("url") as string) ?? "";
    const screenshot = formData.get("screenshot") as File | null;

    let screenshotBase64: string | null = null;

    if (screenshot) {
      screenshotBase64 = await fileToBase64(screenshot);
    } else if (url) {
      screenshotBase64 = await captureUrlScreenshot(url);
    }

    console.log("[analyze] url:", url);
    console.log("[analyze] screenshot from upload:", !!screenshot);
    console.log("[analyze] screenshot from puppeteer:", screenshot ? "skip" : screenshotBase64 ? "OK" : "NULL");

    // -----------------------------
    // PROMPT (ВОТ ОН)
    // -----------------------------
    const prompt = `
You are an expert UX auditor. Analyze the website screenshot and URL.
Return ONLY valid JSON with the following structure:

{
  "url": string,
  "score": number (0-100),
  "risk": "low" | "medium" | "high",
  "issues": [
    {
      "title": string,
      "severity": "low" | "medium" | "high",
      "bullets": string[],
      "why": string,
      "impact": {
        "clarity": number,
        "cta": number,
        "trust": number,
        "navigation": number
      }
    }
  ],
  "suggestions": [
    {
      "section": string,
      "recommendation": string,
      "why": string,
      "impact": {
        "clarity": number,
        "cta": number,
        "trust": number,
        "navigation": number
      }
    }
  ],
  "copy_refinement": [
    {
      "section": string,
      "before": string,
      "after": string,
      "why": string,
      "impact": {
        "clarity": number,
        "cta": number,
        "trust": number,
        "navigation": number
      }
    }
  ],
  "breakdown": {
    "clarity": number,
    "trust": number,
    "hierarchy": number,
    "conversion": number
  }
}

Rules:
- Output MUST be valid JSON.
- No markdown.
- No commentary.
- No explanations.
- If unsure, make reasonable assumptions.
`;

    // -----------------------------
    // BUILD INPUT FOR MODEL
    // -----------------------------
    const inputContent: any[] = [
      { type: "input_text", text: prompt },
      { type: "input_text", text: `Website URL: ${url}` }
    ];

    if (screenshotBase64) {
      inputContent.push({
        type: "input_image",
        image_url: `data:image/png;base64,${screenshotBase64}`
      });
    }

    // -----------------------------
    // CALL OPENAI
    // -----------------------------
    const response = await client.responses.create({
      model: "gpt-4.1",
      input: [{ role: "user", content: inputContent }],
      temperature: 0.2,
    });

    const raw = response.output_text;

    let json;
    try {
      json = JSON.parse(raw);
    } catch (err) {
      console.error("❌ JSON parse error:", raw);
      return NextResponse.json(
        { error: "Invalid JSON from model", raw },
        { status: 500 }
      );
    }

    return NextResponse.json(json);
  } catch (error: any) {
    console.error("❌ SERVER ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
