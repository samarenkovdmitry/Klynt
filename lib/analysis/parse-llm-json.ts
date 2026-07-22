export function extractJsonFromLlmText(text: string): unknown {
  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Fall through to brace scanning.
  }

  let start = cleaned.indexOf("{");

  while (start !== -1) {
    let end = cleaned.lastIndexOf("}");

    while (end !== -1 && end > start) {
      const candidate = cleaned.slice(start, end + 1);

      try {
        return JSON.parse(candidate);
      } catch {
        end = cleaned.lastIndexOf("}", end - 1);
      }
    }

    start = cleaned.indexOf("{", start + 1);
  }

  throw new Error(`LLM response could not be parsed as JSON: ${cleaned.slice(0, 300)}`);
}
