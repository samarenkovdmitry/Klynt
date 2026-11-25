// Single-market deployment: global/EN only. The Russian deployment was
// retired — helpers stay as constants so call sites don't need a sweep.

export type Market = 'global';
export type Locale = 'en';
export type LLMProviderName = 'anthropic';

export function getMarket(): Market {
  return 'global';
}

export function getLocale(): Locale {
  return 'en';
}

export function getLLMProvider(): LLMProviderName {
  return 'anthropic';
}

// Sources that can be connected, in display order.
export function getEnabledConnectors(): string[] {
  // gdocs/notion stay in the list — they render as "Coming soon"
  return ['figma', 'slack', 'telegram', 'linear', 'gdocs', 'notion'];
}

export function isConnectorEnabled(source: string): boolean {
  return getEnabledConnectors().includes(source.toLowerCase());
}

export function logoSrc(): string {
  return '/Klynt_logo.svg';
}
