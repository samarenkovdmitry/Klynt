import Anthropic from "@anthropic-ai/sdk";
import { getModel, COST_PER_1K, type ModelRole } from "./config";

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface LLMCallOptions {
  role: ModelRole;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  cacheSystem?: boolean;
}

export interface LLMCallWithImageOptions extends LLMCallOptions {
  imageBase64: string;
  imageMediaType?: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
}

export interface LLMResult {
  text: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens: number;
    cacheWriteTokens: number;
    estimatedCostUsd: number;
  };
}

export async function callLLM(opts: LLMCallOptions): Promise<LLMResult> {
  const { role, systemPrompt, userPrompt, maxTokens = 1024, cacheSystem = false } = opts;
  const model = getModel(role);

  const systemContent = cacheSystem
    ? [{ type: "text" as const, text: systemPrompt, cache_control: { type: "ephemeral" } }]
    : systemPrompt;

  const response = await anthropic.messages.create(
    {
      model,
      max_tokens: maxTokens,
      system: systemContent as string,
      messages: [{ role: "user", content: userPrompt }],
    },
    { headers: { "anthropic-beta": "prompt-caching-2024-07-31" } }
  );

  return buildUsageResult(response, role);
}

function buildUsageResult(
  response: Anthropic.Messages.Message,
  role: ModelRole
): LLMResult {
  const text = response.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const u = response.usage as Anthropic.Messages.Usage & {
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  };

  const costs = COST_PER_1K[role];
  const inputTokens = u.input_tokens ?? 0;
  const outputTokens = u.output_tokens ?? 0;
  const cacheReadTokens = u.cache_read_input_tokens ?? 0;
  const cacheWriteTokens = u.cache_creation_input_tokens ?? 0;
  const uncachedInput = inputTokens - cacheReadTokens;

  const estimatedCostUsd =
    (uncachedInput / 1000) * costs.input +
    (cacheReadTokens / 1000) * costs.cachedInput +
    (cacheWriteTokens / 1000) * costs.input * 1.25 +
    (outputTokens / 1000) * costs.output;

  return {
    text,
    usage: {
      inputTokens,
      outputTokens,
      cacheReadTokens,
      cacheWriteTokens,
      estimatedCostUsd,
    },
  };
}

export async function callLLMWithImage(
  opts: LLMCallWithImageOptions
): Promise<LLMResult> {
  const {
    role,
    systemPrompt,
    userPrompt,
    imageBase64,
    imageMediaType = "image/jpeg",
    maxTokens = 1024,
    cacheSystem = false,
  } = opts;
  const model = getModel(role);

  const systemContent = cacheSystem
    ? [{ type: "text" as const, text: systemPrompt, cache_control: { type: "ephemeral" } }]
    : systemPrompt;

  const response = await anthropic.messages.create(
    {
      model,
      max_tokens: maxTokens,
      system: systemContent as string,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: imageMediaType,
                data: imageBase64,
              },
            },
            { type: "text", text: userPrompt },
          ],
        },
      ],
    },
    { headers: { "anthropic-beta": "prompt-caching-2024-07-31" } }
  );

  return buildUsageResult(response, role);
}
