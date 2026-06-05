export function extractJSON(text: string) {
  let start = text.indexOf("{");

  while (start !== -1) {
    let end = text.lastIndexOf("}");

    while (end !== -1 && end > start) {
      const candidate = text.slice(start, end + 1);

      try {
        return JSON.parse(candidate);
      } catch {
        end = text.lastIndexOf("}", end - 1);
      }
    }

    start = text.indexOf("{", start + 1);
  }

  throw new Error("AI analysis failed. Please try again.");
}
