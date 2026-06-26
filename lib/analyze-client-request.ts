import { ANALYZE_FALLBACK_ERROR } from "@/lib/api-errors";
import { parseApiJsonResponse } from "@/lib/parse-api-response";

export const ANALYZE_CLIENT_RETRY_DELAY_MS = 1200;
const ANALYZE_FETCH_TIMEOUT_MS = 120_000;

export type AnalyzePostOutcome =
  | { kind: "success"; data: Record<string, unknown> }
  | { kind: "rate_limit"; retryAfter: number | null }
  | { kind: "error"; message: string; retryable: boolean };

export function warmAnalyzeRuntime() {
  void fetch("/api/analyze/warm", { method: "GET" }).catch(() => {
    // Best-effort warm-up for Chromium cold start.
  });
}

export async function postAnalyzeRequest(
  form: FormData
): Promise<AnalyzePostOutcome> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    ANALYZE_FETCH_TIMEOUT_MS
  );

  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      body: form,
      signal: controller.signal,
    });

    if (res.status === 429) {
      const retryAfter = Number(res.headers.get("Retry-After"));
      return {
        kind: "rate_limit",
        retryAfter: Number.isFinite(retryAfter) ? retryAfter : null,
      };
    }

    const { data, error } = await parseApiJsonResponse<
      Record<string, unknown> & { error?: string }
    >(res, ANALYZE_FALLBACK_ERROR);

    if (!res.ok) {
      return {
        kind: "error",
        message: error || ANALYZE_FALLBACK_ERROR,
        retryable: res.status >= 500,
      };
    }

    if (error || !data) {
      return {
        kind: "error",
        message: error || ANALYZE_FALLBACK_ERROR,
        retryable: true,
      };
    }

    if (typeof data.reportId !== "string" || !data.reportId.trim()) {
      return {
        kind: "error",
        message: "Analysis returned an incomplete response. Please try again.",
        retryable: true,
      };
    }

    return { kind: "success", data };
  } catch {
    return {
      kind: "error",
      message: ANALYZE_FALLBACK_ERROR,
      retryable: true,
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}
