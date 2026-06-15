type AnalyzeTimingMeta = Record<string, string | number | boolean | null | undefined>;

export function createAnalyzeTiming() {
  const startedAt = Date.now();
  const spans: Record<string, number> = {};

  return {
    async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
      const spanStart = Date.now();

      try {
        return await fn();
      } finally {
        spans[label] = Date.now() - spanStart;
      }
    },

    measureSync<T>(label: string, fn: () => T): T {
      const spanStart = Date.now();

      try {
        return fn();
      } finally {
        spans[label] = Date.now() - spanStart;
      }
    },

    log(meta: AnalyzeTimingMeta = {}) {
      console.info("[analyze:timing]", {
        ...spans,
        total_ms: Date.now() - startedAt,
        ...meta,
      });
    },
  };
}
