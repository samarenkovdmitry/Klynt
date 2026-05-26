import OpenAI from "openai";
import {
  ANALYSIS_PROMPT,
  ANALYZE_MODEL,
} from "@/lib/analyze/constants";
import {
  normalizeAnalysisResponse,
  parseAnalysisJson,
} from "@/lib/analyze/normalize-response";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function buildScreenshotContent(screenshotsBase64: string[]) {
  const content: OpenAI.Responses.ResponseInputItem.Message["content"] = [];

  if (screenshotsBase64[0]) {
    content.push(
      {
        type: "input_text",
        text: "Screenshot 1 — Hero section and above-the-fold experience",
      },
      {
        type: "input_image",
        image_url: `data:image/jpeg;base64,${screenshotsBase64[0]}`,
        detail: "auto",
      }
    );
  }

  if (screenshotsBase64[1]) {
    content.push(
      {
        type: "input_text",
        text: "Screenshot 2 — Lower page: features, trust signals, CTAs and footer",
      },
      {
        type: "input_image",
        image_url: `data:image/jpeg;base64,${screenshotsBase64[1]}`,
        detail: "auto",
      }
    );
  }

  return content;
}

export async function runVisionAnalysis(
  url: string,
  screenshotsBase64: string[]
) {
  const response = await client.responses.create({
    model: ANALYZE_MODEL,
    temperature: 0.2,
    max_output_tokens: 2200,
    text: {
      format: { type: "json_object" },
    },
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: ANALYSIS_PROMPT },
          { type: "input_text", text: `Website URL: ${url}` },
          ...buildScreenshotContent(screenshotsBase64),
        ],
      },
    ],
  });

  const json = parseAnalysisJson(response.output_text);
  return normalizeAnalysisResponse(json);
}
