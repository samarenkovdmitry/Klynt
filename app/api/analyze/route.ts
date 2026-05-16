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

    console.log("📌 URL:", url);
    console.log("📌 Screenshot uploaded:", !!screenshot);

    if (!screenshot) {
      return NextResponse.json(
        { error: "Upload screenshot is required (URL screenshots disabled on Vercel)" },
        { status: 400 }
      );
    }

    const screenshotBase64 = await blobToBase64(screenshot);
    console.log("📸 Uploaded screenshot size:", screenshotBase64.length);

    // -----------------------------
    // 🔥 OPTIMIZED PROMPT (shorter, cleaner, full structure)
    // -----------------------------
    const basePrompt = `
You are a senior UX auditor. Analyze the website using BOTH the screenshot (primary) and the URL (secondary).

Your goals:
- Identify clarity, navigation, visuals, trust, and conversion issues.
- Use screenshot for layout, spacing, hierarchy, contrast, readability, CTA prominence, trust signals.
- Use URL for messaging, semantics, structure, navigation intent.

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

RULES:
- 3–7 issues, 3–7 suggestions, 2–6 copy_refinement items.
- All numbers must be integers.
- No trailing commas.
- Issues: impact values = negative integers (-20 to -4).
- Suggestions & copy_refinement: impact values = positive integers (4 to 20).
- Impact must include 1–2 metrics.
- Bullets: 2–4 items, 2–4 words each, no verbs.
- Each item must include a "why" explanation.
`;

    console.log("🧠 Prompt length:", basePrompt.length);

    console.log("📤 Sending to OpenAI (Responses API)...");

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

    console.log("📥 Raw OpenAI response:", response);

    const raw = response.output_text;

    console.log("📥 Raw content:", raw);

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

    console.log("🧹 Cleaned content:", cleaned);

    const match = cleaned.match(/\{[\s\S]*\}/);

    if (!match) {
      return NextResponse.json(
        { error: "Model did not return JSON", raw },
        { status: 500 }
      );
    }

    const jsonString = match[0];

    console.log("📦 JSON string:", jsonString);

    let json;
    try {
      json = JSON.parse(jsonString);
    } catch (err) {
      console.error("❌ JSON parse error:", err);
      return NextResponse.json(
        { error: "Invalid JSON from model", raw: jsonString },
        { status: 500 }
      );
    }

    console.log("✅ Final JSON:", json);

    return NextResponse.json(json);
  } catch (error: any) {
    console.error("🔥 ROUTE ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
