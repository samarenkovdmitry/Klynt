type ApiErrorPayload = {
  error?: string;
};

export async function parseApiJsonResponse<T extends ApiErrorPayload>(
  response: Response,
  fallbackError: string
): Promise<{ data: T | null; error: string }> {
  let raw = "";

  try {
    raw = await response.text();
  } catch {
    return { data: null, error: fallbackError };
  }

  if (!raw.trim()) {
    return { data: null, error: fallbackError };
  }

  let data: T | null = null;

  try {
    data = JSON.parse(raw) as T;
  } catch {
    return { data: null, error: fallbackError };
  }

  if (!response.ok) {
    return {
      data: null,
      error: data.error?.trim() || fallbackError,
    };
  }

  return { data, error: "" };
}
