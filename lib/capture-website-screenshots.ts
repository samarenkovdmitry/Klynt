import type { Browser, Page } from "puppeteer-core";

import {
  configureScreenshotPage,
  navigatePageForCapture,
} from "@/lib/page-capture-navigate";
import {
  acquireSharedBrowser,
  markSharedBrowserPageClosed,
  markSharedBrowserPageOpened,
  resetSharedBrowserPool,
} from "@/lib/puppeteer-browser-pool";
import { preparePageForHeroScreenshot, preparePageForLowerScreenshot } from "@/lib/page-screenshot";
import { retryAsync } from "@/lib/retry-async";

async function jumpTo(page: Page, y: number) {
  await page.evaluate((scrollY: number) => {
    window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
  }, y);

  await new Promise((resolve) => setTimeout(resolve, 80));
}

async function captureWebsiteScreenshotsOnce(url: string): Promise<string[]> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    browser = await acquireSharedBrowser();
    markSharedBrowserPageOpened();
    page = await browser.newPage();

    await configureScreenshotPage(page);
    await navigatePageForCapture(page, url);
    await preparePageForHeroScreenshot(page);

    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);

    const heroY = 0;
    const lowerY =
      bodyHeight <= 900
        ? Math.max(0, bodyHeight - 650)
        : Math.max(Math.floor(bodyHeight * 0.52), bodyHeight - 1300);

    const viewport = page.viewport();
    const clipWidth = viewport?.width ?? 1280;
    const clipHeight = viewport?.height ?? 900;
    const lowerClipHeight = Math.min(
      clipHeight,
      Math.max(1, bodyHeight - lowerY)
    );

    const heroShotOptions = {
      type: "jpeg" as const,
      quality: 94,
      clip: { x: 0, y: heroY, width: clipWidth, height: clipHeight },
    };
    const lowerShotOptions = {
      type: "jpeg" as const,
      quality: 80,
      clip: {
        x: 0,
        y: lowerY,
        width: clipWidth,
        height: lowerClipHeight,
      },
    };

    await jumpTo(page, heroY);
    const hero = await page.screenshot(heroShotOptions);

    await jumpTo(page, lowerY);
    await preparePageForLowerScreenshot(page);
    const lower = await page.screenshot(lowerShotOptions);

    return [
      Buffer.from(hero as Buffer).toString("base64"),
      Buffer.from(lower as Buffer).toString("base64"),
    ];
  } catch (error) {
    resetSharedBrowserPool();
    throw error;
  } finally {
    await page?.close().catch(() => {});
    markSharedBrowserPageClosed();
  }
}

export async function captureWebsiteScreenshots(url: string): Promise<string[]> {
  return retryAsync(() => captureWebsiteScreenshotsOnce(url), {
    attempts: 2,
    delayMs: 900,
    label: "screenshot-capture",
  });
}
