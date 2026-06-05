export const COPY_OPTIMIZE_FALLBACK_ERROR =
  "We couldn't process this page right now. Try again in a minute or use another URL.";

export const ANALYZE_FALLBACK_ERROR =
  "Something went wrong during analysis. Please try again.";

export function isJsonParseErrorMessage(message: string) {
  return /unexpected token|is not valid json|json\.parse/i.test(message);
}
