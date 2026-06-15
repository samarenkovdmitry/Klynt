const LLM_PLACEHOLDER_PATTERNS = [
  /^no content available to assess\.?$/i,
  /^content not available( to assess)?\.?$/i,
  /^not visible on (the )?(page|screenshot)\.?$/i,
  /^not visible( in (the )?(hero|screenshot))?\.?$/i,
  /^unable to (read|assess|determine|extract)( .*)?\.?$/i,
  /^cannot (read|assess|determine|extract)( .*)?\.?$/i,
  /^could not (read|assess|determine|extract)( .*)?\.?$/i,
  /^text not visible\.?$/i,
  /^no visible (text|content)\.?$/i,
  /^n\/a\.?$/i,
  /^none visible\.?$/i,
  /^not available\.?$/i,
  /^unavailable\.?$/i,
];

export function isLlmPlaceholderText(text: string | undefined | null): boolean {
  if (typeof text !== "string") {
    return true;
  }

  const trimmed = text.trim();

  if (!trimmed) {
    return true;
  }

  return LLM_PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/** Strip LLM meta placeholders; use empty string when nothing real was extracted. */
export function sanitizeLlmVisibleText(text: string | undefined | null): string {
  if (isLlmPlaceholderText(text)) {
    return "";
  }

  return String(text).trim();
}
