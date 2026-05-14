export const runtime = "edge";

import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // 1) Фетчим HTML страницы
    let html = "";
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; KlyntUXBot/1.0; +https://klynt-three.vercel.app)",
        },
      });

      html = await res.text();
    } catch (e) {
      console.error("HTML FETCH ERROR:", e);
    }

    // 2) Ограничиваем размер HTML, чтобы не взорвать контекст
    const MAX_HTML_LENGTH = 15000;
    if (html.length > MAX_HTML_LENGTH) {
      html = html.slice(0, MAX_HTML_LENGTH);
    }

    const prompt = `
You are a senior UX auditor.

You are given:
- The website URL
- The raw HTML of the page (possibly truncated)

Your job:
- Analyze the UX of the page based on structure, copy, hierarchy, clarity, trust, and calls to action.
- Use BOTH the URL and the HTML to infer what the page is about and how it behaves.

IMPORTANT:
- Focus on concrete, actionable UX insights.
- Avoid generic advice like "improve clarity" or "make it more modern".
- Use real text from the HTML when suggesting improvements.

WEBSITE URL:
${url}

PAGE HTML (may be truncated):
"""
${html}
"""

Return ONLY valid JSON in this exact format:

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
- "before" MUST use real or very plausible text from the HTML or inferred copy.
- "after" MUST be a concrete, improved version of that text.
- "impact" MUST be realistic and tied to UX principles (clarity, hierarchy, trust, CTA strength).
- Do NOT invent new fields.
- Do NOT wrap JSON in quotes.
- Do NOT add trailing commas.
- Do NOT add comments.
- Do NOT output anything outside the JSON.
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
