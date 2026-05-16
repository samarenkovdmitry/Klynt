import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// -----------------------------
// TYPES
// -----------------------------
type FlatIssue = {
  category: "Clarity" | "Navigation" | "Visuals" | "Trust" | "Conversion";
  title: string;
  severity: "low" | "medium" | "high";
  impact_metric_1: string;
  impact_value_1: number;
  impact_metric_2: string;
  impact_value_2: number;
  bullets: string[];
  why: string;
};

type FlatSuggestion = {
  category: "Clarity" | "Navigation" | "Visuals" | "Trust" | "Conversion";
  section: string;
  recommendation: string;
  impact_metric_1: string;
  impact_value_1: number;
  impact_metric_2: string;
  impact_value_2: number;
  why: string;
};

type FlatCopy = {
  section: string;
  before: string;
  after: string;
  impact_metric_1: string;
  impact_value_1: number;
  impact_metric_2: string;
  impact_value_2: number;
  why: string;
};

type AuditResponseFlat = {
  url: string;
  score: number;
  risk: "low" | "medium" | "high";
  issues: FlatIssue[];
  suggestions: FlatSuggestion[];
  copy: FlatCopy[];
  clarity: number;
  navigation: number;
  visuals: number;
  trust: number;
  conversion: number;
};

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
  try {
    const puppeteer = await import("puppeteer");

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

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

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1200 });

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    await new Promise(res => setTimeout(res, 1500));

    const screenshotBuffer = await page.screenshot({
      type: "jpeg",
      quality: 80,
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
      { type: "input_text", text: basePrompt },
      { type: "input_text", text: `Website URL: ${url}` },
    ];

    if (screenshotBase64) {
      inputContent.push({
        type: "input_image",
        image: {
          base64: screenshotBase64,
        },
      });
    }

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "user",
          content: inputContent,
        },
      ],
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

    let json: AuditResponseFlat;
    try {
      json = JSON.parse(jsonString) as AuditResponseFlat;
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid JSON from model", raw: jsonString },
        { status: 500 }
      );
    }

    json.issues = Array.isArray(json.issues) ? json.issues : [];
    json.suggestions = Array.isArray(json.suggestions) ? json.suggestions : [];
    json.copy = Array.isArray(json.copy) ? json.copy : [];

    return NextResponse.json(json);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
