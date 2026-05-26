import type { Page } from "puppeteer-core";
import { PAGE_GOTO_TIMEOUT_MS, SCROLL_SETTLE_MS } from "@/lib/analyze/constants";
import { withBrowserPage } from "@/lib/analyze/browser";
import {
  optimizeScreenshotBuffer,
} from "@/lib/analyze/optimize-image";

async function jumpTo(page: Page, y: number) {
  await page.evaluate((scrollY: number) => {
    window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
  }, y);

  if (SCROLL_SETTLE_MS > 0) {
    await new Promise((resolve) => setTimeout(resolve, SCROLL_SETTLE_MS));
  }
}

export async function captureWebsiteScreenshots(url: string) {
  return withBrowserPage(async (page) => {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: PAGE_GOTO_TIMEOUT_MS,
    });

    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);

    const lowerY =
      bodyHeight <= 900
        ? Math.max(0, bodyHeight - 650)
        : Math.max(Math.floor(bodyHeight * 0.52), bodyHeight - 1300);

    // Capture hero, start optimizing while scrolling to the lower section.
    await jumpTo(page, 0);
    const heroShotPromise = page
      .screenshot({ type: "jpeg", quality: 72, optimizeForSpeed: true })
      .then((buffer) => optimizeScreenshotBuffer(buffer as Buffer));

    await jumpTo(page, lowerY);
    const lowerBuffer = await page.screenshot({
      type: "jpeg",
      quality: 72,
      optimizeForSpeed: true,
    });

    const [heroBase64, lowerBase64] = await Promise.all([
      heroShotPromise,
      optimizeScreenshotBuffer(lowerBuffer as Buffer),
    ]);

    return [heroBase64, lowerBase64];
  });
}
