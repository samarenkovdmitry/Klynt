import type { Page } from "puppeteer-core";

import type { PagePerformanceMetrics } from "@/lib/audit-report";

export type PerformanceMetricsCollector = () => Promise<PagePerformanceMetrics>;

/**
 * Install Web Vitals observers (via evaluateOnNewDocument) and CDP Network
 * listeners before navigation. Call the returned collector after the page settles.
 */
export async function attachPerformanceInstrumentation(
  page: Page
): Promise<PerformanceMetricsCollector> {
  let totalBytes = 0;
  let requestCount = 0;

  const session = await page.createCDPSession();
  await session.send("Network.enable");

  session.on("Network.loadingFinished", (event: { encodedDataLength?: number }) => {
    totalBytes += event.encodedDataLength ?? 0;
    requestCount += 1;
  });

  await page.evaluateOnNewDocument(() => {
    const perfState = {
      lcp: null as number | null,
      cls: 0,
    };

    (window as unknown as { __klyntPerf?: typeof perfState }).__klyntPerf = perfState;

    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries.at(-1);
        if (last) perfState.lcp = last.startTime;
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      // LCP not supported in this context
    }

    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & {
            value?: number;
            hadRecentInput?: boolean;
          };
          if (!shift.hadRecentInput && typeof shift.value === "number") {
            perfState.cls += shift.value;
          }
        }
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch {
      // CLS not supported in this context
    }
  });

  return async function collectPerformanceMetrics(): Promise<PagePerformanceMetrics> {
    const vitals = await page.evaluate(() => {
      const perfState = (
        window as unknown as { __klyntPerf?: { lcp: number | null; cls: number } }
      ).__klyntPerf;
      const nav = performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;

      return {
        lcp_ms: perfState?.lcp != null ? Math.round(perfState.lcp) : null,
        cls: perfState?.cls ?? null,
        ttfb_ms:
          nav && nav.responseStart > 0
            ? Math.max(0, Math.round(nav.responseStart - nav.requestStart))
            : null,
        dom_content_loaded_ms:
          nav && nav.domContentLoadedEventEnd > 0
            ? Math.round(nav.domContentLoadedEventEnd)
            : null,
        load_event_ms:
          nav && nav.loadEventEnd > 0 ? Math.round(nav.loadEventEnd) : null,
      };
    });

    return {
      ...vitals,
      cls: vitals.cls != null ? Math.round(vitals.cls * 1000) / 1000 : null,
      page_weight_kb:
        totalBytes > 0 ? Math.round((totalBytes / 1024) * 10) / 10 : null,
      request_count: requestCount,
    };
  };
}
