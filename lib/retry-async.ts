export type RetryAsyncOptions = {
  attempts?: number;
  delayMs?: number;
  label?: string;
};

export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: RetryAsyncOptions = {}
): Promise<T> {
  const attempts = Math.max(1, options.attempts ?? 2);
  const delayMs = options.delayMs ?? 700;
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < attempts - 1) {
        const waitMs = delayMs * (attempt + 1);

        if (options.label) {
          console.warn(
            `[retry] ${options.label} attempt ${attempt + 1} failed; retrying in ${waitMs}ms`,
            error
          );
        }

        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }
  }

  throw lastError;
}
