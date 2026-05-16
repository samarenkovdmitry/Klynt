import { NextResponse } from "next/server";
import OpenAI from "openai";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const runtime = "nodejs";
export const maxDuration = 60;

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

function extractJSON(text: string) {
  let start = text.indexOf("{");

  while (start !== -1) {
    let end = text.lastIndexOf("}");

    while (end !== -1 && end > start) {
      const candidate = text.slice(start, end + 1);

      try {
        return JSON.parse(candidate);
      } catch {
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
// URL NORMALIZER
// -----------------------------
function normalizeUrl(input: string) {
  if (!input) return "";

  let url = input.trim();

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  return url;
}

// -----------------------------
// FULL PAGE SCREENSHOT
// -----------------------------
async function captureWebsiteScreenshot(url: string) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: {
      width: 1440,
      height: 2200,
      deviceScaleFactor: 1,
    },
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    );

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 45000,
    });

    // allow lazy sections to render
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 500;

        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;

          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 120);
      });
    });

    // back to top
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const screenshot = await page.screenshot({
      type: "png",
      fullPage: true,
    });

    return Buffer.from(screenshot).toString("base64");
  } finally {
    await browser.close();
  }
}

// -----------------------------
// ROUTE
// -----------------------------
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const rawUrl = (formData.get("url") as string) ?? "";
    const url = normalizeUrl(rawUrl);

    const uploadedScreenshot = formData.get("screenshot") as Blob | null;

    let screenshotBase64 = "";

    // PRIORITY #1 — uploaded screenshot
    if (uploadedScreenshot) {
      screenshotBase64 = await blobToBase64(uploadedScreenshot);
    }

    // PRIORITY #2 — auto capture from URL
    else if (url) {
      screenshotBase64 = await captureWebsiteScreenshot(url);
    }

    if (!screenshotBase64) {
      return NextResponse.json(
        {
          error: "Either URL or screenshot is required",
        },
        {
          status: 400,
        }
      );
    }

    const basePrompt = `
You are a senior UX auditor.

Analyze the FULL webpage screenshot very carefully.

The screenshot is the PRIMARY source of truth.
The URL is secondary context only.

Return ONLY valid JSON.
No markdown.
No comments.

JSON FORMAT:
{
  "url": "string",
  "score": number,
  "risk": "low" | "medium" | "high",

  "issues": [
    {
      "category": "Clarity" | "Navigation" | "Visuals" | "Trust" | "Conversion",
      "title": "string",
      "description": "string",
      "impact": {
        "clarity"?: number,
        "navigation"?: number,
        "visuals"?: number,
        "trust"?: number,
        "conversion"?: number,
        "cta"?: number
      },
      "bullets": ["string"],
      "why": "string"
    }
  ],

  "suggestions": [
    {
      "category": "Clarity" | "Navigation" | "Visuals" | "Trust" | "Conversion",
      "section": "string",
      "recommendation": "string",
      "impact": {
        "clarity"?: number,
        "navigation"?: number,
        "visuals"?: number,
        "trust"?: number,
        "conversion"?: number,
        "cta"?: number
      },
      "bullets": ["string"],
      "why": "string"
    }
  ],

  "copy": [
    {
      "section": "string",
      "before": "string",
      "after": "string",
      "impact": {
        "clarity"?: number,
        "navigation"?: number,
        "visuals"?: number,
        "trust"?: number,
        "conversion"?: number,
        "cta"?: number
      },
      "why": "string"
    }
  ],

  "breakdown": {
    "clarity": number,
    "navigation": number,
    "visuals": number,
    "trust": number,
    "conversion": number
  }
}

RULES:
- Analyze REAL visible UI.
- Detect UX hierarchy problems.
- Detect CTA visibility problems.
- Detect spacing/layout inconsistencies.
- Detect trust signal weaknesses.
- Detect readability issues.
- Detect conversion blockers.
- 3–7 issues.
- 3–7 suggestions.
- Use concise UX language.
- All numbers must be integers.
- Issues use NEGATIVE impacts.
- Suggestions use POSITIVE impacts.
- Breakdown values must be 0–100.
`;

    const response = await client.responses.create({
      model: "gpt-4.1",
      temperature: 0.2,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: basePrompt,
            },
            {
              type: "input_text",
              text: `Website URL: ${url}`,
            },
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

    if (!json.breakdown || typeof json.breakdown !== "object") {
      json.breakdown = {
        clarity: 0,
        navigation: 0,
        visuals: 0,
        trust: 0,
        conversion: 0,
      };
    }

    json.breakdown = {
      clarity: clampPercent(json.breakdown.clarity),
      navigation: clampPercent(json.breakdown.navigation),
      visuals: clampPercent(json.breakdown.visuals),
      trust: clampPercent(json.breakdown.trust),
      conversion: clampPercent(json.breakdown.conversion),
    };

    json.issues = Array.isArray(json.issues) ? json.issues : [];
    json.suggestions = Array.isArray(json.suggestions)
      ? json.suggestions
      : [];
    json.copy = Array.isArray(json.copy) ? json.copy : [];

    json.issues = json.issues.map((item: any) => ({
      ...item,
      ...mapImpact(item.impact || {}),
    }));

    json.suggestions = json.suggestions.map((item: any) => ({
      ...item,
      ...mapImpact(item.impact || {}),
    }));

    json.copy = json.copy.map((item: any) => ({
      ...item,
      ...mapImpact(item.impact || {}),
    }));

    return NextResponse.json(json);
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message || "Unknown server error",
      },
      {
        status: 500,
      }
    );
  }
}