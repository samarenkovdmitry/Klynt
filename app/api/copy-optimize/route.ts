import { NextResponse } from "next/server";
import OpenAI from "openai";

import { captureHeroScreenshotBase64 } from "@/lib/capture-hero-screenshot";
import {
  hasCopyOptimizerContent,
  normalizeCopyOptimizerResponse,
} from "@/lib/copy-optimize";
import { extractJSON } from "@/lib/extract-json";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { validateAuditUrl } from "@/lib/validate-audit-url";

export const runtime = "nodejs";
export const maxDuration = 60;

const COPY_OPTIMIZE_RATE_LIMIT = Number(process.env.COPY_OPTIMIZE_RATE_LIMIT) || 12;
const COPY_OPTIMIZE_RATE_WINDOW_MS =
  Number(process.env.COPY_OPTIMIZE_RATE_WINDOW_MS) || 60 * 60 * 1000;

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }

  return openaiClient;
}

function normalizeUrl(input: string) {
  if (!input) return "";

  let url = input.trim();

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  return url;
}

const COPY_PROMPT = `You are a senior SaaS landing-page copywriter.

Analyze ONLY the hero / above-the-fold copy visible in the screenshot. Never invent UI. Quote exact visible text for "before" fields.

Return ONLY valid JSON (no markdown):

{
  "url": "string",
  "copy": [
    {
      "layer": "headline",
      "before": "exact visible hero headline",
      "after": "clearer rewrite",
      "why": "max 24 words"
    },
    {
      "layer": "subheadline",
      "before": "exact visible supporting line under the headline",
      "after": "clearer rewrite",
      "why": "max 24 words"
    },
    {
      "layer": "cta",
      "before": "exact visible primary CTA label",
      "after": "clearer rewrite",
      "why": "max 24 words"
    }
  ]
}

Rules:
- Exactly 3 items: headline, subheadline, cta — different layers, never duplicate the same text across layers.
- headline = main hero H1 or largest promise line above the fold.
- subheadline = the next supporting paragraph or subtext directly under the headline (NOT the CTA).
- cta = primary button label above the fold.
- If a layer is missing on the page, set before to "" and still propose a sensible after based on what is visible.
- Improve clarity (what/who/outcome), not hype. Preserve brand tone.`;

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(
      `copy-optimize:${clientIp}`,
      COPY_OPTIMIZE_RATE_LIMIT,
      COPY_OPTIMIZE_RATE_WINDOW_MS
    );

    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSec),
          },
        }
      );
    }

    const body = (await req.json()) as { url?: string };
    const rawUrl = String(body.url ?? "").trim();

    if (!rawUrl) {
      return NextResponse.json({ error: "Website URL is required." }, { status: 400 });
    }

    const urlError = validateAuditUrl(rawUrl);
    if (urlError) {
      return NextResponse.json({ error: urlError }, { status: 400 });
    }

    const url = normalizeUrl(rawUrl);
    let screenshotBase64: string;

    try {
      screenshotBase64 = await captureHeroScreenshotBase64(url);
    } catch (captureError) {
      console.error("[copy-optimize] Screenshot capture failed:", captureError);
      return NextResponse.json(
        {
          error:
            "We couldn't capture this page. The site may block automated access, require login, or load too slowly.",
        },
        { status: 422 }
      );
    }

    const response = await getOpenAIClient().responses.create({
      model: "gpt-4.1-nano",
      temperature: 0.2,
      max_output_tokens: 900,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: COPY_PROMPT },
            { type: "input_text", text: `Website URL: ${url}` },
            {
              type: "input_text",
              text: "Screenshot — Hero section and above-the-fold experience",
            },
            {
              type: "input_image",
              image_url: `data:image/jpeg;base64,${screenshotBase64}`,
            },
          ],
        },
      ],
    } as any);

    const raw = (response as { output_text?: string }).output_text ?? "";
    const json = extractJSON(raw);
    const auditedUrl =
      typeof json.url === "string" && json.url.trim() ? json.url.trim() : url;
    const rawCopy = Array.isArray(json.copy) ? json.copy : [];
    const result = normalizeCopyOptimizerResponse(auditedUrl, rawCopy);

    if (!hasCopyOptimizerContent(result)) {
      return NextResponse.json(
        { error: "We couldn't read hero copy from this page. Try another URL." },
        { status: 422 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[copy-optimize] Failed:", error);
    return NextResponse.json(
      { error: "Copy optimization failed. Please try again." },
      { status: 500 }
    );
  }
}
