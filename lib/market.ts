// Market configuration — the single seam where the global and Russian
// deployments diverge. Everything here is env-driven; no `if (ru)` branches
// should spread through the codebase, add config surface here instead.

export type Market = 'global' | 'ru';
export type Locale = 'en' | 'ru';
export type LLMProviderName = 'anthropic' | 'yandexgpt' | 'gigachat';

function firstSet(...values: (string | undefined)[]): string | undefined {
  return values.find(v => v !== undefined && v.trim() !== '')?.trim();
}

export function getMarket(): Market {
  const raw = firstSet(process.env.NEXT_PUBLIC_MARKET, process.env.MARKET);
  return raw === 'ru' ? 'ru' : 'global';
}

export function getLocale(): Locale {
  const raw = firstSet(process.env.NEXT_PUBLIC_LOCALE, process.env.LOCALE);
  if (raw === 'ru' || raw === 'en') return raw;
  return getMarket() === 'ru' ? 'ru' : 'en';
}

export function getLLMProvider(): LLMProviderName {
  const raw = firstSet(process.env.LLM_PROVIDER);
  if (raw === 'yandexgpt' || raw === 'gigachat' || raw === 'anthropic') return raw;
  return getMarket() === 'ru' ? 'yandexgpt' : 'anthropic';
}

// Sources that can be connected on this deployment, in display order.
// NEXT_PUBLIC_ prefix so the client-side integrations page can read it.
export function getEnabledConnectors(): string[] {
  const raw = firstSet(process.env.NEXT_PUBLIC_ENABLED_CONNECTORS);
  if (raw) {
    return raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  }
  // gdocs/notion stay in the global list — they render as "Coming soon"
  return getMarket() === 'ru'
    ? ['telegram']
    : ['figma', 'slack', 'linear', 'gdocs', 'notion'];
}

export function isConnectorEnabled(source: string): boolean {
  return getEnabledConnectors().includes(source.toLowerCase());
}

// Brand assets — the logo is shared across markets now; the localized
// /klynt-logo-ru.svg stays in the repo in case the ru brand diverges again.
export function logoSrc(): string {
  return '/Klynt_logo.svg';
}
