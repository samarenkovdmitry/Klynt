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
// ROUTE HANDLER
// -----------------------------
export async function POST(req: Request) {
  try {
    console.log("📥 Incoming request to /api/analyze");

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
    // 🔥 OPTIMIZED PROMPT v4 (UI‑compatible)
    // -----------------------------
    const basePrompt = `
You are a senior UX auditor. Analyze the website using BOTH the screenshot (primary) and the URL (secondary).

Return ONLY valid JSON. No markdown. No comments. No explanations.

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
      "impact_primary": number,
      "impact_secondary": number,
      "bullets": ["string", "string"],
      "why": "string"
    }
  ],

  "suggestions": [
    {
      "category": "Clarity" | "Navigation" | "Visuals" | "Trust" | "Conversion",
      "section": "string",
      "recommendation": "string",
      "impact_primary": number,
      "impact_secondary": number,
      "bullets": ["string", "string"],
      "why": "string"
    }
  ],

  "copy_refinement": [
    {
      "section": "string",
      "before": "string",
      "after": "string",
      "impact_primary": number,
      "impact_secondary": number,
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
- No trailing commas.

Impact rules:
- issues: impact_primary & impact_secondary = negative integers (-20 to -4)
- suggestions: impact_primary & impact_secondary = positive integers (4 to 20)
- copy_refinement: impact_primary & impact_secondary = positive integers (4 to 20)

Bullets:
- 2–4 items
- 2–4 words each
- no verbs
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

    if (!raw) {
      return NextResponse.json(
        { error: "Model returned empty response" },
        { status: 500 }
      );
    }

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

    let json;
    try {
      json = JSON.parse(jsonString);
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid JSON from model", raw: jsonString },
        { status: 500 }
      );
    }

    return NextResponse.json(json);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unknown server error" },
      { status: 500 }
    );
  }
}