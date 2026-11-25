import type { LLMProviderName } from '@/lib/market';

// Minimal chat-completion interface — callers are responsible for
// JSON extraction.
export interface LLMRequest {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMProvider {
  name: LLMProviderName;
  complete(req: LLMRequest): Promise<string>;
}

// Robust JSON extraction — weaker models wrap output in prose or fences.
export function extractJson(text: string): string {
  let t = text.trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  }
  const start = t.indexOf('{');
  if (start === -1) return t;
  // Take the first balanced object only — weaker models append prose or a
  // duplicate block, and slicing to the last '}' would corrupt the parse.
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < t.length; i++) {
    const ch = t[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
    } else if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return t.slice(start, i + 1);
  }
  return t.slice(start);
}

export function getLLM(): LLMProvider {
  return anthropicProvider;
}

const anthropicProvider: LLMProvider = {
  name: 'anthropic',
  async complete({ system, user, maxTokens = 1024, temperature = 0.3 }) {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      temperature,
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: user }],
    });
    const block = response.content[0];
    if (block.type !== 'text') throw new Error('Unexpected response type from Anthropic');
    return block.text;
  },
};
