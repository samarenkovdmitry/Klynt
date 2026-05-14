export const runtime = "edge";

import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

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
      "title": "string",
      "severity": "low" | "medium" | "high",
      "description": "string",
      "bullets": ["string"]
    }
  ],
  "breakdown": {
    "clarity": number,
    "hierarchy": number,
    "trust": number,
    "cta": number
  },
  "suggestions": [
    {
      "section": "string",
      "before": "string",
      "after": "string",
      "impact": "string"
    }
  ]
}

Rules:
- All numbers must be integers.
- Always include at least 3 issues.
- Always include at least 2 suggestions.
- Always include all fields.
- Do NOT invent new fields.
- Do NOT wrap JSON in quotes.
- Do NOT add trailing commas.
- Do NOT add comments.
`;



    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
      temperature: 0.2,
    });

    const raw = response.output_text;
    if (!raw) {
      return NextResponse.json({ error: "No output from model" }, { status: 500 });
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error("JSON PARSE ERROR:", raw);
      return NextResponse.json(
        { error: "Model returned invalid JSON", raw },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    console.error("FULL ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
