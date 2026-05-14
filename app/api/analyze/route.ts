export const runtime = "edge";

import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// очень простой, но рабочий "очиститель" HTML → текста
function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/(div|section|article|main|header|footer)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// вытаскиваем ключевые куски: title, meta description, h1–h3, кнопки
function extractKeySnippets(html: string) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;

  const metaDescMatch = html.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i
  );
  const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : null;

  const headings = Array.from(
    html.matchAll(/<(h1|h2|h3)[^>]*>([\s\S]*?)<\/\1>/gi)
  )
    .map((m) => stripHtml(m[2]))
    .filter(Boolean)
    .slice(0, 10);

  const buttons = Array.from(
    html.matchAll(/<(button|a)[^>]*(role=["']button["'][^>]*)?[^>]*>([\s\S]*?)<\/(button|a)>/gi)
  )
    .map((m) => stripHtml(m[3]))
    .filter((t) => t && t.length <= 80)
    .slice(0, 15);

  return {
    title,
    metaDescription,
    headings,
    buttons,
  };
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // 1) Фетчим HTML
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

    const MAX_HTML_LENGTH = 40000;
    if (html.length > MAX_HTML_LENGTH) {
      html = html.slice(0, MAX_HTML_LENGTH);
    }

    const key = extractKeySnippets(html);
    const plainText = stripHtml(html).slice(0, 12000);

    const prompt = `
You are a senior UX auditor for marketing and product websites.

You are given:
- The website URL
- Key extracted content (title, meta description, headings, buttons)
- A truncated plain-text version of the page

Your job:
- Understand what this page is trying to do.
- Evaluate clarity, hierarchy, trust, and CTA strength.
- Identify concrete UX issues.
- Propose specific, copy-ready improvements.

WEBSITE URL:
${url}

KEY CONTENT (parsed from HTML):
- Title: ${key.title ?? "N/A"}
- Meta description: ${key.metaDescription ?? "N/A"}
- Headings: ${key.headings.join(" | ") || "N/A"}
- Buttons / CTAs: ${key.buttons.join(" | ") || "N/A"}

PLAIN TEXT (truncated):
"""
${plainText}
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

STRICT RULES:

- All numbers must be integers.
- Always include at least 3 issues.
- Always include at least 2 suggestions.
- "section" should refer to a real area (e.g. "Hero headline", "Primary CTA", "Pricing section").
- "before" MUST be based on real or very plausible text from the headings, buttons, or plain text.
- "after" MUST be a concrete, improved version of that text, optimized for clarity, hierarchy, or conversion.
- "impact" MUST be realistic and tied to UX principles (e.g. "Improves scannability of hero", "Reduces friction in signup CTA").
- Avoid generic advice like "make it clearer" without specifying HOW.
- Do NOT invent new fields.
- Do NOT wrap JSON in quotes.
- Do NOT add trailing commas.
- Do NOT add comments.
- Do NOT output anything outside the JSON.
`;

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
      temperature: 0.25,
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