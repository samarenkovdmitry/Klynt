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
    // 🔥 FULL FINAL PROMPT v3
    // -----------------------------
    const basePrompt = `
You are a senior UX auditor. Use the screenshot as the primary source of truth. Use the URL only for context and semantics.

Your task is to produce a structured UX audit in strict JSON format.

Return ONLY valid JSON. No markdown, no comments, no explanations, no extra text.

You MUST return JSON in the following flat structure:

{
  "url": "string",
  "score": number,
  "risk": "low" | "medium" | "high",
  "issues": [
    {
      "title": "string",
      "description": "string",
      "impact_primary": number,
      "impact_secondary": number,
      "bullets": ["...", "..."]
    }
  ],
  "suggestions": [
    {
      "title": "string",
      "description": "string",
      "impact_primary": number,
      "impact_secondary": number,
      "bullets": ["...", "..."]
    }
  ],
  "copy": [
    {
      "title": "string",
      "description": "string",
      "impact_primary": number,
      "impact_secondary": number,
      "bullets": ["...", "..."]
    }
  ],
  "clarity": number,
  "navigation": number,
  "visuals": number,
  "trust": number,
  "conversion": number
}

Rules:
- 3–7 issues, 3–7 suggestions, 2–6 copy items.
- Impact values:
  - issues: negative integers (-20 to -4)
  - suggestions: positive integers (4 to 20)
  - copy: positive integers (4 to 20)
- If only one impact metric is relevant, set the second to "" and value to 0.
- Bullets: 2–4 items, 2–4 words each, no verbs.
- No markdown. No commentary. Only JSON.
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
