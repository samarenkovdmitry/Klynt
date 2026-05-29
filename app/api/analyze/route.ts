import { NextResponse } from "next/server";
import OpenAI from "openai";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import sharp from "sharp";

import { isAuditReport, type AuditReport } from "@/lib/audit-report";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { generateReportId } from "@/lib/report-id";
import { saveReportToDb } from "@/lib/reports-db";
import { validateAuditUrl } from "@/lib/validate-audit-url";

export const runtime = "nodejs";
export const maxDuration = 90;

const ANALYZE_RATE_LIMIT = Number(process.env.ANALYZE_RATE_LIMIT) || 8;
const ANALYZE_RATE_WINDOW_MS =
  Number(process.env.ANALYZE_RATE_WINDOW_MS) || 60 * 60 * 1000;
const MAX_SCREENSHOT_BYTES = 20 * 1024 * 1024;

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }

  return openaiClient;
}

// -----------------------------
// HELPERS
// -----------------------------
async function blobToBase64(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}

async function jumpTo(page: any, y: number) {
  await page.evaluate((scrollY: number) => {
    window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
  }, y);

  await new Promise((r) => setTimeout(r, 80));
}

const TRACKER_PATTERN =
  /google-analytics|googletagmanager|facebook\.net|hotjar|segment\.(com|io)|intercom|clarity\.ms|doubleclick|sentry\.io|mixpanel|amplitude/i;

async function optimizeScreenshotBase64(base64: string) {
  const optimized = await sharp(Buffer.from(base64, "base64"))
    .resize(768, null, { withoutEnlargement: true })
    .jpeg({ quality: 48, mozjpeg: true })
    .toBuffer();

  return optimized.toString("base64");
}

async function optimizeScreenshots(base64List: string[]) {
  return Promise.all(base64List.map((shot) => optimizeScreenshotBase64(shot)));
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

  throw new Error(
  "AI analysis failed. Please try again."
);
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

function isAbstractIssueTitle(title: string): boolean {
  const t = title.trim();
  if (!t) return true;

  const looksLikeSentence =
    /[.!?]$/.test(t) ||
    /\b(don't|doesn't|can't|cannot|isn't|aren't|because|so users|so visitors|which makes|which means|before they|when they)\b/i.test(
      t
    );

  if (looksLikeSentence && t.split(/\s+/).length >= 8) return false;

  const abstractLabel =
    /^(weak|low|missing|poor|unclear|navigation|messaging|cta|visual|conversion|trust|clarity|overloaded|generic)\b/i.test(
      t
    ) ||
    /\b(issues?|gap|friction|hierarchy|optimization|clarity problems?)\b/i.test(t);

  return abstractLabel || t.split(/\s+/).length <= 6;
}

function normalizeIssueTitle(item: {
  title?: unknown;
  why?: unknown;
}): string {
  const title = String(item.title ?? "").trim();
  const why = String(item.why ?? "").trim();

  if (!isAbstractIssueTitle(title)) return title;
  if (why.length < 20) return title;

  const firstSentence = why.match(/^[^.!?]+[.!?]/)?.[0]?.trim();
  return firstSentence || why;
}



// -----------------------------
// FULL PAGE SCREENSHOT
// -----------------------------
async function captureWebsiteScreenshots(url: string) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: {
      width: 800,
      height: 700,
      deviceScaleFactor: 1,
    },
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();

    await page.setRequestInterception(true);

page.on("request", (req) => {
  const type = req.resourceType();
  const requestUrl = req.url();

  if (
    type === "font" ||
    type === "media" ||
    type === "websocket" ||
    TRACKER_PATTERN.test(requestUrl)
  ) {
    req.abort();
    return;
  }

  req.continue();
});

    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    );

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 8000,
    });

    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);

    const heroY = 0;
    const lowerY =
      bodyHeight <= 900
        ? Math.max(0, bodyHeight - 650)
        : Math.max(Math.floor(bodyHeight * 0.52), bodyHeight - 1300);

    const shotOptions = { type: "jpeg" as const, quality: 48 };

    await jumpTo(page, heroY);
    const hero = await page.screenshot(shotOptions);

    await jumpTo(page, lowerY);
    const lower = await page.screenshot(shotOptions);

    return [
      Buffer.from(hero as Buffer).toString("base64"),
      Buffer.from(lower as Buffer).toString("base64"),
    ];
  } finally {
    await browser.close();
  }
}



// -----------------------------
// ROUTE
// -----------------------------
export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(
      `analyze:${clientIp}`,
      ANALYZE_RATE_LIMIT,
      ANALYZE_RATE_WINDOW_MS
    );

    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSec),
          },
        }
      );
    }

    const formData = await req.formData();

    const rawUrl = (formData.get("url") as string) ?? "";
    const uploadedScreenshot = formData.get("screenshot") as Blob | null;

    if (rawUrl.trim()) {
      const urlError = validateAuditUrl(rawUrl);
      if (urlError) {
        return NextResponse.json({ error: urlError }, { status: 400 });
      }
    }

    if (uploadedScreenshot && uploadedScreenshot.size > 0) {
      if (uploadedScreenshot.size > MAX_SCREENSHOT_BYTES) {
        return NextResponse.json(
          { error: "Screenshot must be 20 MB or smaller." },
          { status: 400 }
        );
      }

      if (!uploadedScreenshot.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Upload a PNG or JPG screenshot." },
          { status: 400 }
        );
      }
    }

    const url = normalizeUrl(rawUrl);

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

    screenshotsBase64 = await optimizeScreenshots(screenshotsBase64);

    const basePrompt = `You are a senior SaaS UX auditor (clarity, conversion, positioning).

Analyze ONLY what is visible in the screenshot(s). Never invent UI. No generic advice — name the actual element/section.

Return ONLY valid JSON (no markdown):

{
  "url": "string",
  "score": number,
  "risk": "low"|"medium"|"high",
  "summary": "string",
  "verdict": "string",
  "key_observation": "string",
  "confidence": number,
  "issues": [{
    "category": "Clarity"|"Navigation"|"Visuals"|"Trust"|"Conversion",
    "title": "one concrete sentence",
    "bullets": ["2-3 short evidence tags"],
    "why": "string",
    "impact": { "clarity"?: int, "navigation"?: int, "visuals"?: int, "trust"?: int, "conversion"?: int, "cta"?: int }
  }],
  "suggestions": [{
    "category": "Clarity"|"Navigation"|"Visuals"|"Trust"|"Conversion",
    "section": "string",
    "recommendation": "string",
    "why": "string",
    "impact": { ...same keys, positive ints only }
  }],
  "copy": [{
    "section": "string",
    "before": "exact visible copy",
    "after": "clearer rewrite",
    "why": "string",
    "impact": { ...same keys, positive ints only }
  }],
  "breakdown": { "clarity": int, "navigation": int, "visuals": int, "trust": int, "conversion": int }
}

Counts: exactly 4 issues, 3 suggestions, 3 copy (different sections).
Lengths: summary 14-22 words; verdict 6-10 words; key_observation max 14 words; why fields max 28 words each.
issues[].title: exactly ONE sentence (12-22 words). State what is wrong on THIS page, what users fail to understand, where friction happens, and why it hurts conversion. Name the visible section/element when possible. NEVER use abstract audit labels (e.g. "Weak visual hierarchy", "Messaging clarity issues", "CTA optimization gap", "Navigation friction", "Low clarity").
Good title: "The hero headline never states who the product is for, so visitors can't judge fit before scrolling."
Bad title: "Weak visual hierarchy"
Impact: issues use negative ints (-5 to -25); suggestions/copy use positive (5-20). Pick top 1-2 impact keys per item.
confidence: integer 70-98. breakdown: integers 0-100. score: integer 0-100 aligned with breakdown.
Copy: improve clarity (what/who/outcome), not hype. Preserve brand tone.`;

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

// LOWER PAGE
if (screenshotsBase64[1]) {
  screenshotContent.push(
    {
      type: "input_text",
      text: "Screenshot 2 — Lower page: features, trust signals, CTAs and footer",
    },
    {
      type: "input_image",
      image_url: `data:image/jpeg;base64,${screenshotsBase64[1]}`,
    }
  );
}

    const response = await getOpenAIClient().responses.create({
      model: "gpt-4.1-nano",
      temperature: 0.2,
      max_output_tokens: 2200,
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

// -----------------------------
// FALLBACKS
// -----------------------------

if (
  typeof json.summary !== "string" ||
  json.summary.trim().length < 10
) {
  const topIssue = json.issues?.[0]?.title || "conversion clarity";

  json.summary =
    `Strong visual presentation, but ${topIssue.toLowerCase()} reduces overall conversion confidence.`;
}

if (
  typeof json.verdict !== "string" ||
  json.verdict.trim().length < 6
) {
  if (json.score >= 80) {
    json.verdict =
      "Strong UX with minor conversion friction";
  } else if (json.score >= 60) {
    json.verdict =
      "Clear structure with moderate UX friction";
  } else {
    json.verdict =
      "Weak clarity and conversion communication";
  }
}

if (
  typeof json.key_observation !== "string" ||
  json.key_observation.trim().length < 8
) {
  const topIssue =
    json.issues?.[0]?.title ||
    "Primary messaging lacks clarity";

  json.key_observation = topIssue;
}

json.confidence = Number.isFinite(Number(json.confidence))
  ? Math.max(70, Math.min(98, Number(json.confidence)))
  : 82;


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

    json.issues = Array.isArray(json.issues) ? json.issues.slice(0, 4) : [];
    json.suggestions = Array.isArray(json.suggestions)
      ? json.suggestions.slice(0, 3)
      : [];
    json.copy = Array.isArray(json.copy) ? json.copy.slice(0, 3) : [];

    json.issues = json.issues.map((item: any) => ({
     ...item,
     title: normalizeIssueTitle(item),
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

    const reportId = generateReportId();
    const auditedUrl =
      typeof json.url === "string" && json.url.trim()
        ? json.url.trim()
        : url;

    const reportPayload: AuditReport = {
      url: auditedUrl,
      score: Number(json.score) || 0,
      risk:
        json.risk === "medium" || json.risk === "high" ? json.risk : "low",
      summary: json.summary,
      verdict: json.verdict,
      key_observation: json.key_observation,
      confidence: json.confidence,
      issues: json.issues,
      suggestions: json.suggestions,
      copy: json.copy,
      breakdown: json.breakdown,
      generatedAt: new Date().toISOString(),
    };

    if (isAuditReport(reportPayload)) {
      try {
        await saveReportToDb({
          id: reportId,
          auditedUrl,
          report: reportPayload,
        });
      } catch (persistError) {
        console.error("[analyze] Failed to persist report:", persistError);
      }
    }

    return NextResponse.json({
      ...json,
      reportId,
      url: auditedUrl,
      generatedAt: reportPayload.generatedAt,
    });
  } catch (error: any) {
    
    console.error("ANALYZE ERROR:");
    console.error(error);
    console.error(error?.stack);

    return NextResponse.json(
      {
        error:
        error?.message?.includes("timeout")
        ? "Website loading timed out."
        : error.message || "Unknown server error",
      },
      {
        status: 500,
      }
    );
  }
}