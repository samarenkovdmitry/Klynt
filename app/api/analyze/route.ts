import { NextResponse } from "next/server";
import OpenAI from "openai";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const runtime = "nodejs";
export const maxDuration = 90;

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

async function smoothScroll(page: any, targetY: number) {
  await page.evaluate(async (y: number) => {
    await new Promise<void>((resolve) => {
      const step = () => {
        const current = window.scrollY;
        const diff = y - current;

        if (Math.abs(diff) < 50) {
          window.scrollTo(0, y);
          resolve();
          return;
        }

        window.scrollTo(0, current + diff * 0.2);
        requestAnimationFrame(step);
      };

      step();
    });
  }, targetY);

  await new Promise((resolve) => setTimeout(resolve, 300));
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

function normalizeUrl(input: string) {
  if (!input) return "";
  let url = input.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
}

function normalizeSignals(signals: string[] = []) {
  const tags = new Set<string>();
  const joined = signals.join(" ").toLowerCase();

  if (joined.includes("hierarchy")) tags.add("Weak hierarchy");
  if (joined.includes("contrast")) tags.add("Low contrast");
  if (joined.includes("spacing") || joined.includes("layout"))
    tags.add("Overloaded layout");
  if (joined.includes("cta") || joined.includes("button"))
    tags.add("Weak CTA");
  if (joined.includes("trust") || joined.includes("testimonial"))
    tags.add("Missing trust signals");
  if (joined.includes("navigation")) tags.add("Navigation friction");
  if (joined.includes("clarity")) tags.add("Low clarity");

  return Array.from(tags).slice(0, 3);
}

// -----------------------------
// FAST SCREENSHOT (1 IMAGE)
// -----------------------------
async function captureWebsiteScreenshot(url: string) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: {
      width: 1024,
      height: 900,
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

    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const block = ["image", "stylesheet", "font", "media"];
      block.includes(req.resourceType()) ? req.abort() : req.continue();
    });

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    await new Promise((resolve) => setTimeout(resolve, 800));

    const screenshot = await page.screenshot({
      type: "jpeg",
      quality: 40,
      fullPage: true,
    });

    return Buffer.from(screenshot as Buffer).toString("base64");
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

    let screenshotBase64: string | null = null;

    if (uploadedScreenshot) {
      screenshotBase64 = await blobToBase64(uploadedScreenshot);
    } else if (url) {
      screenshotBase64 = await captureWebsiteScreenshot(url);
    }

    if (!screenshotBase64) {
      return NextResponse.json(
        { error: "Either URL or screenshot is required" },
        { status: 400 }
      );
    }

    // -----------------------------
    // STEP 1 — VISION SUMMARY
    // -----------------------------
    const vision = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_image",
              image_url: `data:image/jpeg;base64,${screenshotBase64}`,
              detail: "low"
            },
            {
              type: "input_text",
              text: `
Ты — UX-аудитор. Дай 5–7 ключевых UX-проблем в формате массива:
[
  { "title": "", "why": "" }
]
              `,
            },
          ],
        },
      ],
    });

    const summary = vision.output_text;

    // -----------------------------
    // STEP 2 — LLM STRUCTURED JSON
    // -----------------------------
    const llm = await client.responses.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      input: `
Ты — UX-аудитор. На основе списка проблем ниже создай JSON по моей схеме.

Проблемы:
${summary}

Верни ТОЛЬКО JSON.
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
      `,
    });

    const raw = llm.output_text;
    const json = extractJSON(raw);

    // -----------------------------
    // POST-PROCESSING
    // -----------------------------
    json.breakdown = {
      clarity: clampPercent(json.breakdown?.clarity),
      navigation: clampPercent(json.breakdown?.navigation),
      visuals: clampPercent(json.breakdown?.visuals),
      trust: clampPercent(json.breakdown?.trust),
      conversion: clampPercent(json.breakdown?.conversion),
    };

    json.issues = (json.issues || []).map((item: any) => ({
      ...item,
      bullets: normalizeSignals(item.bullets || []),
      ...mapImpact(item.impact || {}),
    }));

    json.suggestions = (json.suggestions || []).map((item: any) => ({
      ...item,
      ...mapImpact(item.impact || {}),
    }));

    json.copy = (json.copy || []).map((item: any) => ({
      ...item,
      ...mapImpact(item.impact || {}),
    }));

    json.url = url;

    return NextResponse.json(json);
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      { error: error.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
