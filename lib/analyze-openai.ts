import OpenAI from "openai";

import { isAuditReport } from "@/lib/audit-report";
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

function buildScreenshotContent(screenshotsBase64: string[]) {
  const screenshotContent: Array<Record<string, string>> = [];

  if (screenshotsBase64[0]) {
    screenshotContent.push(
      {
        type: "input_text",
        text: "Screenshot 1 — Hero section and above-the-fold experience",
      },
      {
        type: "input_image",
        image_url: `data:image/jpeg;base64,${screenshotsBase64[0]}`,
      }
    );
  }

  if (screenshotsBase64[1]) {
    screenshotContent.push(
      {
        type: "input_text",
        text: "Screenshot 2 — Lower page: features, trust signals, CTAs and footer",
      },
      {
        type: "input_image",
        image_url: `data:image/jpeg;base64,${screenshotsBase64[1]}`,
      }
    );
  }

  return screenshotContent;
}

async function requestAuditAnalysisOnce(params: {
  basePrompt: string;
  url: string;
  screenshotsBase64: string[];
}): Promise<Record<string, unknown>> {
  const screenshotContent = buildScreenshotContent(params.screenshotsBase64);

  const response = await getOpenAIClient().responses.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    max_output_tokens: 3200,
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

  const json = extractJSON(raw);

  if (!isAuditReport(json)) {
    throw new Error("AI analysis returned an incomplete report.");
  }

  return json as Record<string, unknown>;
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
