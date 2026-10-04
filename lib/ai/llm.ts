import { getLLMProvider, type LLMProviderName } from '@/lib/market';

// Minimal chat-completion interface — every provider returns raw text,
// callers are responsible for JSON extraction.
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
  const end = t.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return t;
  return t.slice(start, end + 1);
}

export function getLLM(): LLMProvider {
  const name = getLLMProvider();
  switch (name) {
    case 'yandexgpt':
      return yandexGPT;
    case 'gigachat':
      return gigaChat;
    default:
      return anthropicProvider;
  }
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

// YandexGPT via the OpenAI-compatible endpoint.
// Env: YANDEX_API_KEY (Api-Key), YANDEX_FOLDER_ID, optional YANDEX_MODEL
// (defaults to yandexgpt-lite). Data processing stays in Yandex Cloud (RU).
const yandexGPT: LLMProvider = {
  name: 'yandexgpt',
  async complete({ system, user, maxTokens = 1024, temperature = 0.3 }) {
    const apiKey = process.env.YANDEX_API_KEY;
    const folderId = process.env.YANDEX_FOLDER_ID;
    if (!apiKey || !folderId) throw new Error('YANDEX_API_KEY and YANDEX_FOLDER_ID are required');

    const model = process.env.YANDEX_MODEL || 'yandexgpt-lite';
    const res = await fetch('https://llm.api.cloud.yandex.net/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Api-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: `gpt://${folderId}/${model}/latest`,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!res.ok) {
      throw new Error(`YandexGPT error ${res.status}: ${await res.text().catch(() => '')}`);
    }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (typeof text !== 'string') throw new Error('Unexpected response shape from YandexGPT');
    return text;
  },
};

// GigaChat (Sber). OAuth first (cached token), then OpenAI-style chat.
// Env: GIGACHAT_CREDENTIALS (base64 client credentials), optional
// GIGACHAT_SCOPE (default GIGACHAT_API_PERS), GIGACHAT_MODEL.
// NOTE: GigaChat endpoints use Russian national TLS certs — on foreign
// infra set NODE_EXTRA_CA_CERTS to the downloaded CA bundle.
let gigachatToken: { value: string; expiresAt: number } | null = null;

async function gigaChatToken(): Promise<string> {
  if (gigachatToken && Date.now() < gigachatToken.expiresAt - 30_000) {
    return gigachatToken.value;
  }
  const credentials = process.env.GIGACHAT_CREDENTIALS;
  if (!credentials) throw new Error('GIGACHAT_CREDENTIALS is required');

  const res = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      RqUID: crypto.randomUUID(),
    },
    body: new URLSearchParams({ scope: process.env.GIGACHAT_SCOPE || 'GIGACHAT_API_PERS' }),
  });
  if (!res.ok) {
    throw new Error(`GigaChat auth error ${res.status}: ${await res.text().catch(() => '')}`);
  }
  const data = await res.json();
  gigachatToken = { value: data.access_token, expiresAt: data.expires_at ?? Date.now() + 25 * 60_000 };
  return gigachatToken.value;
}

const gigaChat: LLMProvider = {
  name: 'gigachat',
  async complete({ system, user, maxTokens = 1024, temperature = 0.3 }) {
    const token = await gigaChatToken();
    const res = await fetch('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.GIGACHAT_MODEL || 'GigaChat',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });
    if (!res.ok) {
      throw new Error(`GigaChat error ${res.status}: ${await res.text().catch(() => '')}`);
    }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (typeof text !== 'string') throw new Error('Unexpected response shape from GigaChat');
    return text;
  },
};
