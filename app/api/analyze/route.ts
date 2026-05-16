import { NextResponse } from "next/server";
import OpenAI from "openai";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const runtime = "nodejs";
export const maxDuration = 30;

// -----------------------------
// HELPERS
// -----------------------------
async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(new Uint8Array(arrayBuffer));
  return buffer.toString("base64");
}

function extractJSON(text: string) {
  let start = text.indexOf("{");
  while (start !== -1) {
    let end = text.lastIndexOf("}");
    while (end !== -1 && end > start) {
      const candidate = text.slice(start, end + 1);
      try {
        return JSON.parse(candidate);
      } catch (e) {
        end = text.lastIndexOf("}", end - 1);
      }
    }
    start = text.indexOf("{", start + 1);
  }
  throw new Error("Valid JSON not found");
}

function clampPercent(n: any) {
  const v = Number(n ?? 0);
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(100, v));
}

function mapImpact(impactObj: Record<string, number>) {
  if (!impactObj || typeof impactObj !== "object") {
    return {
      impact_metric_1: "",
      impact_value_1: 0,
      impact_metric_2: "",
      impact_value_2: 0,
    };
  }

  const entries = Object.entries(impactObj)
    .filter(([_, v]) => typeof v === "number" && v !== 0)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));

  if (entries.length === 0) {
    return {
      impact_metric_1: "",
      impact_value_1: 0,
      impact_metric_2: "",
      impact_value_2: 0,
    };
  }

  const [m1, v1] = entries[0];

  let m2 = "";
  let v2 = 0;

  if (entries.length > 1) {
    const [candM2, candV2] = entries[1];
    if (Math.abs(candV2) >= Math.abs(v1) * 0.15) {
      m2 = candM2;
      v2 = candV2;
    }
  }

  return {
    impact_metric_1: m1,
    impact_value_1: v1,
    impact_metric_2: m2,
    impact_value_2: v2,
  };
}

// -----------------------------
// SERVER-SIDE SCREENSHOT
// -----------------------------
async function captureUrlScreenshot(url: string): Promise<string> {
  const executablePath = await chromium.executablePath();

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath,
    headless: true,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });

  const screenshotBuffer = (await page.screenshot({
    type: "png",
    fullPage: true,
  })) as Buffer;

  await browser.close();

  return screenshotBuffer.toString("base64");
}

// -----------------------------
// ROUTE HANDLER
// -----------------------------
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const url = (formData.get("url") as string) ?? "";
    const uploadedScreenshot = formData.get("screenshot") as Blob | null;

    let screenshotBase64 = "";

    if (uploadedScreenshot) {
      screenshotBase64 = await blobToBase64(uploadedScreenshot);
    } else if (url) {
      screenshotBase64 = await captureUrlScreenshot(url);
    } else {
      return NextResponse.json(
        { error: "Provide either URL or screenshot" },
        { status: 400 }
      );
    }

    const prompt = `
You are a senior UX auditor. Analyze the website using the screenshot (primary) and the URL (secondary).

Return ONLY valid JSON. No markdown. No comments.

JSON FORMAT:
{
  "url": "string",
  "score": number,
  "risk": "low" | "medium" | "high",

  "issues": [...],
  "suggestions": [...],
  "copy": [...],

  "breakdown": {
    "clarity": number,
    "navigation": number,
    "visuals": number,
    "trust": number,
    "conversion": number
  }
}

RULES:
- 3–7 issues, 3–7 suggestions.
- Copy: 2–6 sections.
- All numbers must be integers.
- Issues: negative impact (-20 to -4).
- Suggestions & copy: positive impact (4 to 20).
- Breakdown MUST be percentages (0–100).
`;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const response = await client.responses.create({
      model: "gpt-4.1",
      temperature: 0.2,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_text", text: `Website URL: ${url}` },
            {
              type: "input_image",
              image_url: `data:image/png;base64,${screenshotBase64}`,
            },
          ],
        },
      ],
    } as any);

    const raw = response.output_text;
    const json = extractJSON(raw);

    json.breakdown = {
      clarity: clampPercent(json.breakdown?.clarity),
      navigation: clampPercent(json.breakdown?.navigation),
      visuals: clampPercent(json.breakdown?.visuals),
      trust: clampPercent(json.breakdown?.trust),
      conversion: clampPercent(json.breakdown?.conversion),
    };

    json.issues = (json.issues || []).map((i: any) => ({
      ...i,
      ...mapImpact(i.impact || {}),
    }));

    json.suggestions = (json.suggestions || []).map((i: any) => ({
      ...i,
      ...mapImpact(i.impact || {}),
    }));

    json.copy = (json.copy || []).map((i: any) => ({
      ...i,
      ...mapImpact(i.impact || {}),
    }));

    return NextResponse.json(json);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unknown server error" },
      { status: 500 }
    );
  }
}