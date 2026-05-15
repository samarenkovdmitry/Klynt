import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// -----------------------------
// TYPES
// -----------------------------
type ImpactMetrics = {
  clarity?: number;
  cta?: number;
  trust?: number;
  navigation?: number;
  visuals?: number;
  conversion?: number;
};

type UXIssue = {
  category: "Clarity" | "Navigation" | "Visuals" | "Trust" | "Conversion";
  title: string;
  severity: "low" | "medium" | "high";
  impact: ImpactMetrics;
  bullets: string[];
  why: string;
};

type Suggestion = {
  category: "Clarity" | "Navigation" | "Visuals" | "Trust" | "Conversion";
  section: string;
  recommendation: string;
  impact: ImpactMetrics;
  why: string;
};

type CopyRefinement = {
  section: string;
  before: string;
  after: string;
  impact: ImpactMetrics;
  why: string;
};

type AuditResponse = {
  url: string;
  score: number;
  risk: "low" | "medium" | "high";
  issues: UXIssue[];
  suggestions: Suggestion[];
  copy_refinement: CopyRefinement[];
  breakdown: {
    clarity: number;
    navigation: number;
    visuals: number;
    trust: number;
    conversion: number;
  };
};

// -----------------------------
// HELPERS
// -----------------------------
async function fileToBase64(file: File) {
  const buffer = await file.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

// -----------------------------
// SERVER-SIDE SCREENSHOT (PUPPETEER)
// -----------------------------
async function captureUrlScreenshot(url: string): Promise<string | null> {
  try {
    const puppeteer = await import("puppeteer");

    const browser = await puppeteer.launch({
      headless: true, // ← исправлено
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

    return Buffer.from(screenshotBuffer).toString("base64"); // ← исправлено
  } catch (err) {
    console.error("Puppeteer screenshot failed:", err);
    return null;
  }
}


// -----------------------------
// NORMALIZATION HELPERS
// -----------------------------
function normalizeImpact(
  obj: ImpactMetrics | undefined,
  allowed: (keyof ImpactMetrics)[]
): ImpactMetrics {
  const entries = Object.entries(obj ?? {})
    .filter(([k, v]) => allowed.includes(k as keyof ImpactMetrics) && typeof v === "number")
    .slice(0, 2);

  const out: ImpactMetrics = {};
  for (const [k, v] of entries) {
    (out as any)[k] = v;
  }
  return out;
}

// -----------------------------
// ROUTE HANDLER
// -----------------------------
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const url = (formData.get("url") as string) ?? "";
    const screenshot = formData.get("screenshot") as File | null;

    // -----------------------------
    // Decide which screenshot to use
    // -----------------------------
    let screenshotBase64: string | null = null;

    if (screenshot) {
      screenshotBase64 = await fileToBase64(screenshot);
    }

    if (!screenshot && url) {
      screenshotBase64 = await captureUrlScreenshot(url);
    }

    const basePrompt = `
You are a senior UX auditor. Analyze the website using BOTH the URL and the screenshot if provided.

Your goal:
- Perform a deep UX audit.
- Detect structural, visual, interaction, clarity, trust, and conversion issues.
- Use screenshot for layout, spacing, hierarchy, visual density, readability, contrast, CTA prominence, and trust signals.
- Use URL for content, messaging, semantics, navigation, and intent.

Return ONLY valid JSON. No markdown. No commentary.

JSON FORMAT:

{
  "url": "string",
  "score": number,
  "risk": "low" | "medium" | "high",

  "issues": [
    {
      "category": "Clarity" | "Navigation" | "Visuals" | "Trust" | "Conversion",
      "title": "string",
      "severity": "low" | "medium" | "high",
      "impact": { "clarity"?: number, "cta"?: number, "trust"?: number, "navigation"?: number },
      "bullets": ["string"],
      "why": "string"
    }
  ],

  "suggestions": [
    {
      "category": "Clarity" | "Navigation" | "Visuals" | "Trust" | "Conversion",
      "section": "string",
      "recommendation": "string",
      "impact": { "clarity"?: number, "trust"?: number, "navigation"?: number, "visuals"?: number, "conversion"?: number },
      "why": "string"
    }
  ],

  "copy_refinement": [
    {
      "section": "string",
      "before": "string",
      "after": "string",
      "impact": { "clarity"?: number, "conversion"?: number, "trust"?: number },
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

Rules:
- Generate between 3 and 7 UX issues.
- Generate between 3 and 7 improvement suggestions.
- Generate between 2 and 6 copy refinement items.
- All numbers must be integers.
- Do NOT wrap JSON in quotes.
- Do NOT add trailing commas.

Rules for issues:
- "impact" must include 1–2 metrics chosen from: clarity, cta, trust, navigation.
- Impact numbers must be negative integers between -20 and -4.
- "bullets" must be 2–4 short UX signals (2–4 words each), not full sentences.
  Examples: "Low contrast", "Weak hierarchy", "Overloaded layout".
- Bullets must NEVER contain verbs ("is", "are", "has", "should", "needs").
- Bullets must be noun‑phrases only.
- Must include a "why" explanation.

Rules for suggestions:
- Must include a "why" explanation.
- "impact" must include 1–2 positive integer metrics between 4 and 20.
- Allowed metrics: clarity, trust, navigation, visuals, conversion.

Rules for copy_refinement:
- Must include a "why" explanation.
- "impact" must include 1–2 positive integer metrics between 4 and 20.
- Allowed metrics: clarity, conversion, trust.
`;

    const inputContent: any[] = [
      { type: "input_text", text: basePrompt },
      { type: "input_text", text: `Website URL: ${url}` }
    ];

    if (screenshotBase64) {
      inputContent.push({
        type: "input_image",
        image_url: `data:image/png;base64,${screenshotBase64}`
      });
    }

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "user",
          content: inputContent
        }
      ],
      temperature: 0.2
    });

    const raw = response.output_text;

    let json: AuditResponse;
    try {
      json = JSON.parse(raw) as AuditResponse;
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid JSON from model", raw },
        { status: 500 }
      );
    }

    // NORMALIZE IMPACTS
    json.issues = json.issues.map((issue) => ({
      ...issue,
      impact: normalizeImpact(issue.impact, ["clarity", "cta", "trust", "navigation"])
    }));

    json.suggestions = json.suggestions.map((s) => ({
      ...s,
      impact: normalizeImpact(s.impact, ["clarity", "trust", "navigation", "visuals", "conversion"])
    }));

    json.copy_refinement = json.copy_refinement.map((c) => ({
      ...c,
      impact: normalizeImpact(c.impact, ["clarity", "conversion", "trust"])
    }));

    return NextResponse.json(json);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unknown server error" },
      { status: 500 }
    );
  }
}