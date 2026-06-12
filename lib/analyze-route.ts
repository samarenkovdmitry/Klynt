export function buildAnalyzeUrl(options?: { url?: string; autostart?: boolean }): string {
  const params = new URLSearchParams();
  const trimmedUrl = options?.url?.trim();

  if (trimmedUrl) {
    params.set("url", trimmedUrl);
  }

  if (options?.autostart && trimmedUrl) {
    params.set("autostart", "1");
  }

  const query = params.toString();
  return query ? `/analyze?${query}` : "/analyze";
}
