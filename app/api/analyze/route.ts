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
// IMPACT MAPPING (20% RULE)
// -----------------------------
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

    if (Math.abs(candV2) >= Math.abs(v1) * 0.2) {
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
// ROUTE HANDLER
// -----------------------------
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const url = (formData.get("url") as string) ?? "";
    const screenshot = formData.get("screenshot") as Blob | null;

    if (!screenshot) {
      return NextResponse.json(
        { error: "Upload screenshot is required" },
        { status: 400 }
      );
    }

    const screenshotBase64 = await blobToBase64(screenshot);

    // -----------------------------
    // PROMPT v5 (UI-COMPATIBLE)
    // -----------------------------
    const basePrompt = `
You are a senior UX auditor. Analyze the website using BOTH the screenshot (primary) and the URL (secondary).

Return ONLY valid JSON. No markdown. No comments.

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

  "copy_refinement": [
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
- 3–7 issues, 3–7 suggestions, 2–6 copy_refinement items.
- All numbers must be integers.
- Issues: negative impact values (-20 to -4).
- Suggestions & copy_refinement: positive impact values (4 to 20).
- Bullets: 2–4 items, 2–4 words each, no verbs.
`;

    const response = await client.responses.create(
      {
        model: "gpt-4.1",
        temperature: 0.2,
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: basePrompt },
              { type: "input_text", text: `Website URL: ${url}` },
              {
                type: "input_image",
                image_url: `data:image/jpeg;base64,${screenshotBase64}`,
              },
            ],
          },
        ],
      } as any
    );

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

    const json = JSON.parse(match[0]);

    // -----------------------------
    // MAP IMPACTS FOR FRONTEND
    // -----------------------------
    json.issues = json.issues?.map((item: any) => ({
      ...item,
      ...mapImpact(item.impact || {}),
    }));

    json.suggestions = json.suggestions?.map((item: any) => ({
      ...item,
      ...mapImpact(item.impact || {}),
    }));

    json.copy_refinement = json.copy_refinement?.map((item: any) => ({
      ...item,
      ...mapImpact(item.impact || {}),
    }));

    return NextResponse.json(json);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
