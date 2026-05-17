import { NextResponse } from "next/server";
import OpenAI from "openai";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const runtime = "nodejs";
export const maxDuration = 300;

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
// SIGNALS -> COMPACT CHIPS
// -----------------------------
function normalizeSignals(signals: string[] = []) {
  const tags = new Set<string>();

  const joined = signals.join(" ").toLowerCase();

  // hierarchy
  if (
    joined.includes("hierarchy") ||
    joined.includes("visual priority")
  ) {
    tags.add("Weak hierarchy");
  }

  // contrast
  if (
    joined.includes("contrast") ||
    joined.includes("hard to see") ||
    joined.includes("visibility")
  ) {
    tags.add("Low contrast");
  }

  // layout
  if (
    joined.includes("crowded") ||
    joined.includes("spacing") ||
    joined.includes("layout") ||
    joined.includes("dense")
  ) {
    tags.add("Overloaded layout");
  }

  // CTA
  if (
    joined.includes("cta") ||
    joined.includes("button")
  ) {
    tags.add("Weak CTA");
  }

  // trust
  if (
    joined.includes("trust") ||
    joined.includes("testimonial") ||
    joined.includes("social proof")
  ) {
    tags.add("Missing trust signals");
  }

  // navigation
  if (
    joined.includes("navigation") ||
    joined.includes("menu")
  ) {
    tags.add("Navigation friction");
  }

  // clarity
  if (
    joined.includes("clarity") ||
    joined.includes("unclear") ||
    joined.includes("generic")
  ) {
    tags.add("Low clarity");
  }

  return Array.from(tags).slice(0, 3);
}





// -----------------------------
// FULL PAGE SCREENSHOT
// -----------------------------
async function captureWebsiteScreenshots(url: string) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: {
      width: 1440,
      height: 1400,
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
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const screenshots: string[] = [];

    // HERO
    await page.screenshot({
      path: "/tmp/hero.jpg",
      type: "jpeg",
      quality: 55,
      clip: {
        x: 0,
        y: 0,
        width: 1440,
        height: 1400,
      },
    });

    // MID PAGE
    await page.evaluate(() => {
      window.scrollTo(0, 1200);
    });

    await new Promise((resolve) => setTimeout(resolve, 600));

    await page.screenshot({
      path: "/tmp/mid.jpg",
      type: "jpeg",
      quality: 35,
      clip: {
        x: 0,
        y: 1200,
        width: 1440,
        height: 1400,
      },
    });

    // FOOTER
    const bodyHeight = await page.evaluate(() => {
      return document.body.scrollHeight;
    });

    const footerY = Math.max(bodyHeight - 1600, 0);

    await page.evaluate((y) => {
      window.scrollTo(0, y);
    }, footerY);

    await new Promise((resolve) => setTimeout(resolve, 600));

    const hero = await page.screenshot({
     type: "jpeg",
     quality: 35,
     clip: {
       x: 0,
       y: 0,
       width: 1440,
       height: 1400,
      },
    });

     screenshots.push(Buffer.from(hero).toString("base64"));

    const mid = await page.screenshot({
     type: "jpeg",
     quality: 35,
     clip: {
       x: 0,
       y: 1200,
       width: 1440,
       height: 1400,
      },
    });

    const footer = await page.screenshot({
     type: "jpeg",
     quality: 35,
     clip: {
       x: 0,
       y: footerY,
       width: 1440,
       height: 1400,
      },
    });

screenshots.push(Buffer.from(mid).toString("base64"));

    return screenshots;
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

    let screenshotsBase64: string[] = [];

    // PRIORITY #1 — uploaded screenshot
    if (uploadedScreenshot) {
     const uploadedBase64 = await blobToBase64(uploadedScreenshot);

     screenshotsBase64 = [uploadedBase64];
    }

    // PRIORITY #2 — auto capture from URL
    else if (url) {
      screenshotsBase64 = await captureWebsiteScreenshots(url);
    }

    if (screenshotsBase64.length === 0) {
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
You are an elite SaaS conversion optimization expert.

Evaluate the interface using these UX criteria:

1. Message clarity
- Is the value proposition instantly understandable?
- Is the headline concrete and outcome-oriented?
- Is jargon reducing clarity?

2. Visual hierarchy
- Are primary actions visually dominant?
- Is the reading flow obvious?
- Is spacing helping comprehension?

3. Conversion optimization
- Are CTAs specific and confidence-building?
- Are trust signals placed near decision points?
- Is friction minimized?

4. Information architecture
- Are sections logically ordered?
- Is content chunked correctly?
- Are feature explanations scannable?

5. SaaS landing page effectiveness
- Does the page communicate:
  - who it's for
  - what problem it solves
  - why it's better
  - why users should trust it
  - what action to take next

Avoid generic UX advice.
Every issue and recommendation must reference specific visible interface elements.

Analyze the FULL webpage screenshot very carefully.

Analyze the interface ONLY from the provided screenshots.
Do not invent elements that are not visible.
Base every issue and recommendation on observable UI evidence.

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

Copy requirements:
- Generate EXACTLY 6 copy improvements.
- Each improvement MUST target a DIFFERENT section.
- Never repeat the same section twice.
- Prioritize the most conversion-critical sections first.

Allowed sections:
Hero Headline,
Hero Subheadline,
Primary CTA,
Feature Section,
Feature Highlights,
Benefits Section,
Trust Section,
Testimonials,
Social Proof,
Pricing Section,
Navigation,
Footer CTA,
About Section,
Onboarding Section,
Value Proposition,
Integration Section.

If a section is already strong, do not invent weak UX problems.

Prioritize:
- high-confidence issues
- conversion-critical weaknesses
- specific friction points

Avoid filler recommendations.

`;

const screenshotContent: any[] = [];

// HERO
if (screenshotsBase64[0]) {
  screenshotContent.push(
    {
      type: "input_text",
      text: "Screenshot 1 — Hero section and above-the-fold experience",
    },
    {
      type: "input_image",
      image_url: `data:image/jpeg;base64,${screenshotsBase64[0]}`,
    }
  );
}

// MID
if (screenshotsBase64[1]) {
  screenshotContent.push(
    {
      type: "input_text",
      text: "Screenshot 2 — Mid-page features, product explanation and content hierarchy",
    },
    {
      type: "input_image",
      image_url: `data:image/jpeg;base64,${screenshotsBase64[1]}`,
    }
  );
}

// FOOTER
if (screenshotsBase64[2]) {
  screenshotContent.push(
    {
      type: "input_text",
      text: "Screenshot 3 — Bottom sections, trust signals, CTA repetition and footer",
    },
    {
      type: "input_image",
      image_url: `data:image/jpeg;base64,${screenshotsBase64[2]}`,
    }
  );
}

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      max_output_tokens: 1800,
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

        ...screenshotContent,
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
     bullets: normalizeSignals(item.bullets || []),
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