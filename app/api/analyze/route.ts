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

async function jumpTo(page: any, y: number) {
  await page.evaluate((scrollY: number) => {
    window.scrollTo(0, scrollY);
  }, y);

  await new Promise((r) => setTimeout(r, 250));
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



// -----------------------------
// FULL PAGE SCREENSHOT
// -----------------------------
async function captureWebsiteScreenshots(url: string) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: {
      width: 900,
      height: 760,
    },
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();

    await page.setRequestInterception(true);

page.on("request", (req) => {
  const type = req.resourceType();

  if (
    type === "font" ||
    type === "media" ||
    type === "websocket"
  ) {
    req.abort();
  } else {
    req.continue();
  }
});

    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    );

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    });


    const screenshots: string[] = [];

    // 1) Считаем высоту страницы
    const bodyHeight = await page.evaluate(() => {
      return document.body.scrollHeight;
    });

    const heroY = 0;
    const midY = 1200;
    const footerY = Math.max(bodyHeight - 1600, 0);

    // 2) Скроллим последовательно в нужные зоны (быстро)
    console.log("START SCREENSHOTS");
    await jumpTo(page, heroY);
    await jumpTo(page, midY);
    await jumpTo(page, footerY);


    // 3) Делаем три скриншота ПАРАЛЛЕЛЬНО
await jumpTo(page, heroY);

const hero = await page.screenshot({
  type: "jpeg",
  quality: 55,
});

await jumpTo(page, midY);

const mid = await page.screenshot({
  type: "jpeg",
  quality: 55,
});

await jumpTo(page, footerY);

const footer = await page.screenshot({
  type: "jpeg",
  quality: 55,
});

screenshots.push(Buffer.from(hero as Buffer).toString("base64"));
screenshots.push(Buffer.from(mid as Buffer).toString("base64"));
screenshots.push(Buffer.from(footer as Buffer).toString("base64"));
console.log("SCREENSHOTS DONE");

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
You are a senior SaaS UX auditor and conversion strategist.

Your job is to identify:
- clarity problems
- conversion friction
- weak positioning
- poor visual hierarchy
- weak CTA communication
- trust gaps
- cognitive overload

You analyze interfaces like a senior product designer, UX strategist and SaaS copywriter.

IMPORTANT:
- Analyze ONLY visible UI from screenshots.
- Never invent sections or interface elements.
- Every issue must reference observable interface evidence.
- Avoid generic UX advice.
- Avoid filler recommendations.
- Prioritize clarity over aesthetics.
- Prioritize specificity over persuasion.

A strong interface:
- explains what the product is
- explains who it is for
- explains why it matters
- reduces cognitive load
- makes next actions obvious

A weak interface:
- relies on vague marketing language
- hides important actions
- overloads users with competing elements
- lacks visual hierarchy
- creates ambiguity or friction

Analyze the FULL webpage screenshots carefully.

Return ONLY valid JSON.
No markdown.
No explanations.
No comments.

JSON FORMAT:
{
  "url": "string",

  "score": number,

  "risk": "low" | "medium" | "high",

  "summary": "string",

  "verdict": "string",

  "key_observation": "string",

  "confidence": number,

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
      "problem": "string",
      "reasoning": "string",
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

SUMMARY RULES:
- summary MUST describe the REAL interface quality.
- summary MUST reference actual observed UX patterns.
- summary should feel like a senior UX audit conclusion.
- summary length: 14-24 words.
- avoid generic wording.
- avoid repeating issue titles.
- mention the strongest friction point.

Examples:
GOOD:
- "Strong visual polish and hierarchy, but vague product messaging weakens first-screen conversion clarity."
- "Clean SaaS presentation with solid structure, though CTA intent and differentiation remain unclear."
- "Clear navigation and modern UI improve usability, but dense content blocks create scanning friction."

BAD:
- "The interface has some good and bad UX decisions."
- "Modern design with room for improvement."

VERDICT RULES:
- verdict MUST summarize overall UX quality.
- verdict should sound concise and strategic.
- verdict length: 6-12 words.
- avoid generic scoring language.

GOOD:
- "Strong visual UX with moderate conversion friction"
- "Clear structure but weak positioning clarity"
- "Polished interface with low CTA confidence"

BAD:
- "Good website overall"
- "Average UX"

KEY OBSERVATION RULES:
- key_observation MUST describe the SINGLE most important UX insight.
- focus on the main conversion or clarity bottleneck.
- max 16 words.
- must feel sharp and high-signal.

GOOD:
- "Users may struggle to understand the product value within the first 5 seconds."
- "Primary CTA lacks specificity and reduces interaction confidence."
- "Visual hierarchy prioritizes aesthetics over conversion guidance."

CONFIDENCE RULES:
- confidence must be integer from 70 to 98.
- higher confidence only if screenshots clearly expose structure and messaging.
- lower confidence if UI visibility is limited or ambiguous.

GLOBAL RULES:
- Analyze REAL visible UI only.
- Detect hierarchy problems.
- Detect unclear messaging.
- Detect CTA weaknesses.
- Detect layout inconsistencies.
- Detect readability problems.
- Detect trust weaknesses.
- Detect conversion friction.
- Detect cognitive overload.
- Use concise product/UX language.
- Use high-confidence observations only.
- Avoid generic recommendations.
- Avoid repeating the same issue in different wording.
- All numbers must be integers.
- Breakdown values must be between 0 and 100.

ISSUE RULES:
- Generate 3–5 issues.
- Issues must be specific and evidence-based.
- Issues must explain WHY the problem matters.
- Issues use NEGATIVE impact values.

SUGGESTION RULES:
- Generate 3–5 suggestions.
- Suggestions must feel actionable and product-specific.
- Suggestions use POSITIVE impact values.
- Avoid generic advice like:
  - "improve spacing"
  - "make CTA stronger"
  - "enhance readability"

- Explain WHAT should change and WHY.
- Reference real visible UI elements whenever possible.

COPY EVALUATION LOGIC:

Treat vague marketing language as a UX problem.

Low-clarity copy usually:
- uses abstract business language
- sounds interchangeable with competitors
- hides what the product actually does
- relies on emotional persuasion instead of specificity

Examples of weak copy:
- "Innovate. Differentiate. Grow."
- "Empower your business"
- "Transform your workflow"
- "Unlock smarter growth"

Strong copy:
- explains the product concretely
- identifies the target audience
- communicates a specific outcome
- reduces ambiguity within 3 seconds

When rewriting copy:
- prefer clarity over cleverness
- prefer specificity over emotional language
- prefer product positioning over slogans

COPY RULES:
- Generate EXACTLY 3 copy improvements.
- Every improvement MUST target a different section.
- Never repeat the same section twice.
- Prioritize conversion-critical sections first.

IMPORTANT:
Copy must improve CLARITY, not sound more "marketing".

Avoid vague marketing language like:
- innovative
- smarter
- seamless
- powerful
- revolutionary
- next-generation
- cutting-edge
- world-class
- transform
- elevate
- empower

Do NOT generate vague B2B slogans.

Bad examples:
- "Transform your workflow"
- "Empower your business"
- "Unlock smarter growth"

Good copy:
- clearly explains what the product does
- clearly explains who it is for
- clearly explains the outcome
- reduces ambiguity
- sounds concrete and product-specific

Do not rewrite strong, clear or already effective copy.

Only suggest rewrites when:
- clarity is weak
- positioning is vague
- the value proposition is ambiguous
- CTA intent is unclear

Preserve the brand tone and market positioning.

Do not turn premium brands into generic startup copy.

Improve clarity while maintaining the perceived sophistication of the brand.

For every copy rewrite:
- identify WHY the original copy is weak
- explain what ambiguity was reduced
- explain what became more concrete

Headline rewrites should follow this structure whenever possible:

[what the product is]
+
[who it is for]
+
[main outcome/value]

Example:
"Banking infrastructure for fintech teams"

NOT:
"Empower smarter financial growth"

CTA RULES:
- CTA buttons must be concrete and action-oriented.
- Avoid weak CTA copy like:
  - Learn more
  - Get started today
  - Discover more

Prefer:
- See the platform
- View live demo
- Explore reports
- Start free audit
- See how it works

CTA copy should:
- reduce ambiguity
- communicate clear intent
- increase confidence before click

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

If a section is already strong, do not invent problems.

Prioritize:
- clarity
- specificity
- usability
- conversion confidence
- reduced cognitive load
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
      model: "gpt-4.1-nano",
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

json.confidence = Math.max(
  70,
  Math.min(98, Number(json.confidence ?? 82))
);


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