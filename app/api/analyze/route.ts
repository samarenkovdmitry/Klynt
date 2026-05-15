import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Convert File → base64
async function fileToBase64(file: File) {
  const buffer = await file.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const url = (formData.get("url") as string) ?? "";
    const screenshot = formData.get("screenshot") as File | null;

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
      "impact": { "clarity": number, "cta": number },
      "bullets": ["string"]
    }
  ],

  "suggestions": [
    {
      "category": "Clarity" | "Navigation" | "Visuals" | "Trust" | "Conversion",
      "section": "string",
      "recommendation": "string",
      "impact": {
        "trust": number,
        "clarity": number
      },
      "why": "string"
    }
  ],

  "copy_refinement": [
    {
      "section": "string",
      "before": "string",
      "after": "string",
      "impact": {
        "conversion": number,
        "clarity": number
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

Rules:
- Generate between 3 and 7 UX issues.
- Generate between 3 and 7 improvement suggestions.
- Generate between 2 and 6 copy refinement items.
- All numbers must be integers.
- Do NOT wrap JSON in quotes.
- Do NOT add trailing commas.

Rules for issues:
- Use "title" instead of "description".
- "title" must be a single concise sentence describing the UX problem.
- Do NOT generate any body text above the bullets.
- "impact" numbers must be negative (representing loss), e.g. -12.
- "bullets" must be 2–4 short, concrete observations.
- Do NOT include "expected result" or predicted improvements.

Rules for suggestions:
- Suggestions must NOT include before/after text.
- Suggestions must contain only UX recommendations (structure, clarity, navigation, trust, visuals).
- Must include a "why" explanation (1 short sentence).
- Impact must include numeric "trust" and "clarity" improvements.

Rules for copy_refinement:
- Only include textual improvements (before/after).
- "before" must be the original text from the page.
- "after" must be a clearer, more persuasive rewrite.
- Impact must include numeric "conversion" and "clarity" improvements.
- Must include a "why" explanation (1 short sentence).
`;

    const inputContent: any[] = [
      { type: "input_text", text: basePrompt },
      { type: "input_text", text: `Website URL: ${url}` }
    ];

    if (screenshot) {
      const base64 = await fileToBase64(screenshot);
      inputContent.push({
        type: "input_image",
        image_url: `data:${screenshot.type};base64,${base64}`
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

    let json;
    try {
      json = JSON.parse(raw);
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid JSON from model", raw },
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
