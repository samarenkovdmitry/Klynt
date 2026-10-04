// Privacy filters applied at ingestion time — a message matching the
// project's excluded keywords is dropped before it ever becomes a raw_event,
// so filtered content is never stored.
export function isContentExcluded(content: string | undefined | null, config: any): boolean {
  const keywords: string[] = config?.excluded_keywords || [];
  if (!content || keywords.length === 0) return false;
  const lower = content.toLowerCase();
  return keywords.some((k) => k && lower.includes(k));
}

// Normalize user input ("salary, Hiring, layoffs") for storage in config.
export function normalizeKeywords(input: string[] | string): string[] {
  const list = Array.isArray(input) ? input : input.split(',');
  return [...new Set(
    list
      .map((k) => String(k).trim().toLowerCase())
      .filter((k) => k.length > 0 && k.length <= 100),
  )].slice(0, 50);
}
