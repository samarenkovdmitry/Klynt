export const runtime = "edge";

import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// JSON REPAIR
function extractJson(text: string): string {
  if (!text) throw new Error("Empty model output");

  text = text.replace(/```json/gi, "").replace(/```/g, "");

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in model output");
  }

  return text.slice(start, end + 1);
}

// HTML CLEANING
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

    // Normalize URL
    let normalizedUrl = url.trim();
    if (
      !normalizedUrl.startsWith("http://") &&
      !normalizedUrl.startsWith("https://")
    ) {
      normalizedUrl = "https://" + normalizedUrl;
    }

    // FETCH HTML
    let html = "";
    try {
      const res = await fetch(normalizedUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (KlyntUXBot/2.0)",
        },
      });
      html = await res.text();
    } catch (e) {
      console.error("HTML FETCH ERROR:", e);
      html = "";
    }

    html = html.slice(0, 40000);
    const key = extractKeySnippets(html);
    const plainText = stripHtml(html).slice(0, 15000);

    // STEP 1 — STRUCTURAL ANALYSIS
    const step1Prompt = `
You are a senior UX architect.

Analyze the structure of this webpage.

URL: ${normalizedUrl}

TITLE: ${key.title}
META: ${key.metaDescription}
HEADINGS: ${key.headings.join(" | ")}
BUTTONS: ${key.buttons.join(" | ")}

PLAIN TEXT:
"""
${plainText}
"""

Return ONLY JSON:

{
  "page_goal": "string",
  "sections": ["string"],
  "headlines": ["string"],
  "ctas": ["string"],
  "problems": ["string"]
}
`;

    const step1 = await client.responses.create({
      model: "gpt-4o-mini",
      input: step1Prompt,
      temperature: 0.2,
    });

    const structure = JSON.parse(extractJson(step1.output_text));

    // STEP 2 — UX REPORT
    const step2Prompt = `
You are a senior UX auditor.

Using this structural analysis:

${JSON.stringify(structure, null, 2)}

Generate a UX report.

Return ONLY JSON:

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
- Use ONLY real text from structure.headlines, structure.ctas, or inferred copy.
- Suggestions must be specific and copy-ready.
- No generic advice.
- All numbers must be integers.
`;

    const step2 = await client.responses.create({
      model: "gpt-4o-mini",
      input: step2Prompt,
      temperature: 0.25,
    });

    const report = JSON.parse(extractJson(step2.output_text));

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    console.error("FULL ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}