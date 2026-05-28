import { validateWebsiteUrl } from "./validate-website-url";

function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();

  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host === "0.0.0.0"
  ) {
    return true;
  }

  if (host === "metadata.google.internal" || host.endsWith(".internal")) {
    return true;
  }

  const ipv4Match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4Match) {
    return false;
  }

  const octets = ipv4Match.slice(1).map(Number);
  if (octets.some((octet) => octet > 255)) {
    return true;
  }

  const [a, b] = octets;

  if (a === 127) return true;
  if (a === 10) return true;
  if (a === 169 && b === 254) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;

  return false;
}

export function validateAuditUrl(input: string): string | null {
  const formatError = validateWebsiteUrl(input);
  if (formatError) {
    return formatError;
  }

  let toParse = input.trim();
  if (!/^https?:\/\//i.test(toParse)) {
    toParse = `https://${toParse}`;
  }

  try {
    const url = new URL(toParse);

    if (isBlockedHostname(url.hostname)) {
      return "Enter a public website URL";
    }

    return null;
  } catch {
    return "Enter a valid website URL";
  }
}
