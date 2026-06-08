import OpenAI from "openai";

import { isAuditReport, isHeroAuditReport } from "@/lib/audit-report";
import { retryAsync } from "@/lib/retry-async";

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

function extractJSON(text: string) {
  let start = text.indexOf("{");

  while (start !== -1) {
    let end = text.lastIndexOf("}");

    while (end !== -1 && end > start) {
      const candidate = text.slice(start, end + 1);

      try {
        return JSON.parse(candidate);
      } catch {
        end = text.lastIndexOf("}", end - 1);
      }
    }

    start = text.indexOf("{", start + 1);
  }

  throw new Error("AI analysis failed. Please try again.");
}

function buildScreenshotContent(
  screenshotsBase64: string[],
  options?: { heroOnly?: boolean }
) {
  const screenshotContent: Array<Record<string, string>> = [];
  const shots = options?.heroOnly ? screenshotsBase64.slice(0, 1) : screenshotsBase64;

  if (shots[0]) {
    screenshotContent.push(
      {
        type: "input_text",
        text: "Screenshot 1 — Hero section and above-the-fold experience",
      },
      {
        type: "input_image",
        image_url: `data:image/jpeg;base64,${shots[0]}`,
      }
    );
  }

  if (!options?.heroOnly && shots[1]) {
    screenshotContent.push(
      {
        type: "input_text",
        text: "Screenshot 2 — Lower page: features, trust signals, CTAs and footer",
      },
      {
        type: "input_image",
        image_url: `data:image/jpeg;base64,${shots[1]}`,
      }
    );
  }

  return screenshotContent;
}

async function createAuditResponse(params: {
  basePrompt: string;
  url: string;
  screenshotsBase64: string[];
  heroOnly?: boolean;
  maxOutputTokens: number;
}) {
  const screenshotContent = buildScreenshotContent(params.screenshotsBase64, {
    heroOnly: params.heroOnly,
  });

  const response = await getOpenAIClient().responses.create({
    model: "gpt-4.1-nano",
    temperature: 0.2,
    max_output_tokens: params.maxOutputTokens,
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: params.basePrompt,
          },
          {
            type: "input_text",
            text: `Website URL: ${params.url}`,
          },
          ...screenshotContent,
        ],
      },
    ],
  } as any);

  const raw = response.output_text;

  if (!raw?.trim()) {
    throw new Error("AI analysis returned an empty response.");
  }

  return extractJSON(raw) as Record<string, unknown>;
}

async function requestHeroAuditAnalysisOnce(params: {
  basePrompt: string;
  url: string;
  screenshotsBase64: string[];
}): Promise<Record<string, unknown>> {
  const json = await createAuditResponse({
    ...params,
    heroOnly: true,
    maxOutputTokens: 1000,
  });

  if (!isHeroAuditReport(json)) {
    throw new Error("AI analysis returned an incomplete hero summary.");
  }

  return json;
}

async function requestAuditAnalysisOnce(params: {
  basePrompt: string;
  url: string;
  screenshotsBase64: string[];
}): Promise<Record<string, unknown>> {
  const json = await createAuditResponse({
    ...params,
    maxOutputTokens: 2800,
  });

  if (!isAuditReport(json)) {
    throw new Error("AI analysis returned an incomplete report.");
  }

  return json;
}

export async function requestHeroAuditAnalysis(params: {
  basePrompt: string;
  url: string;
  screenshotsBase64: string[];
}): Promise<Record<string, unknown>> {
  return retryAsync(() => requestHeroAuditAnalysisOnce(params), {
    attempts: 2,
    delayMs: 900,
    label: "openai-hero-audit",
  });
}

export async function requestAuditAnalysis(params: {
  basePrompt: string;
  url: string;
  screenshotsBase64: string[];
}): Promise<Record<string, unknown>> {
  return retryAsync(() => requestAuditAnalysisOnce(params), {
    attempts: 2,
    delayMs: 900,
    label: "openai-audit",
  });
}
