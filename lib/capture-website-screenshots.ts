import chromium from "@sparticuz/chromium";
import type { Page } from "puppeteer-core";
import puppeteer from "puppeteer-core";

import {
  configureScreenshotPage,
  navigatePageForCapture,
} from "@/lib/page-capture-navigate";
import { preparePageForHeroScreenshot, preparePageForLowerScreenshot } from "@/lib/page-screenshot";
import { retryAsync } from "@/lib/retry-async";

async function jumpTo(page: Page, y: number) {
  await page.evaluate((scrollY: number) => {
    window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
  }, y);

  await new Promise((resolve) => setTimeout(resolve, 80));
}

async function captureWebsiteScreenshotsOnce(url: string): Promise<string[]> {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: {
      width: 1280,
      height: 900,
      deviceScaleFactor: 1,
    },
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();

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

    const heroShotOptions = {
      type: "jpeg" as const,
      quality: 94,
      clip: { x: 0, y: 0, width: clipWidth, height: clipHeight },
    };
    const lowerShotOptions = { type: "jpeg" as const, quality: 80 };

    await jumpTo(page, heroY);
    const hero = await page.screenshot(heroShotOptions);

    await jumpTo(page, lowerY);
    await preparePageForLowerScreenshot(page);
    const lower = await page.screenshot(lowerShotOptions);

    return [
      Buffer.from(hero as Buffer).toString("base64"),
      Buffer.from(lower as Buffer).toString("base64"),
    ];
  } finally {
    await browser.close();
  }
}

export async function captureWebsiteScreenshots(url: string): Promise<string[]> {
  return retryAsync(() => captureWebsiteScreenshotsOnce(url), {
    attempts: 2,
    delayMs: 900,
    label: "screenshot-capture",
  });
}
