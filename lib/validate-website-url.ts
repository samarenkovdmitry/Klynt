export function validateWebsiteUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let toParse = trimmed;
  if (!/^https?:\/\//i.test(toParse)) {
    toParse = `https://${toParse}`;
  }

  try {
    const url = new URL(toParse);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "Enter a valid website URL";
    }

    const host = url.hostname;
    if (!host || /\s/.test(trimmed)) {
      return "Enter a valid website URL";
    }

    const isLocalhost =
      host === "localhost" || host.endsWith(".localhost");

    if (!isLocalhost && !host.includes(".")) {
      return "Enter a valid website URL (e.g. stripe.com)";
    }

    return null;
  } catch {
    return "Enter a valid website URL";
  }
}
