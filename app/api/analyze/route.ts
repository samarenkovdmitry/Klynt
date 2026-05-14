import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const url = (formData.get("url") as string) ?? "";
    const screenshot = (formData.get("screenshot") as string) ?? "";

    const prompt = `
You are a strict JSON generator.

Analyze the website: ${url}

Return ONLY valid JSON.  
No commentary.  
No markdown.  
No backticks.  
No explanations.  
No text outside JSON.

JSON FORMAT (MANDATORY):

{
  "url": "string",
  "score": number,
  "risk": "low" | "medium" | "high",
  "issues": [
    {
      "severity": "low" | "medium" | "high",
      "description": "string",
      "impact": { "clarity": number, "cta": number },
      "bullets": ["string"]
    }
  ],
  "suggestions": [
    {
      "section": "string",
      "before": "string",
      "after": "string",
      "impact": "Low" | "Medium" | "High"
    }
  ],
  "breakdown": {
    "clarity": number,
    "navigation": number,
    "visuals": number,
    "trust": number
  }
}

Rules:
- All numbers must be integers.
- Always include at least 3 issues.
- Always include all fields.
- Do NOT invent new fields.
- Do NOT wrap JSON in quotes.
- Do NOT add trailing commas.
- Do NOT add comments.
`;

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: prompt,
      temperature: 0.2,
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
