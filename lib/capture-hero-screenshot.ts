import chromium from "@sparticuz/chromium";
import type { Page } from "puppeteer-core";
import puppeteer from "puppeteer-core";
import sharp from "sharp";

import { preparePageForHeroScreenshot } from "@/lib/page-screenshot";

const TRACKER_PATTERN =
  /google-analytics|googletagmanager|facebook\.net|hotjar|segment\.(com|io)|intercom|clarity\.ms|doubleclick|sentry\.io|mixpanel|amplitude/i;

async function jumpTo(page: Page, y: number) {
  await page.evaluate((scrollY: number) => {
    window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
  }, y);

  await new Promise((resolve) => setTimeout(resolve, 80));
}

export async function optimizeScreenshotBase64(base64: string) {
  const optimized = await sharp(Buffer.from(base64, "base64"))
    .resize(768, null, { withoutEnlargement: true })
    .jpeg({ quality: 48, mozjpeg: true })
    .toBuffer();

  return optimized.toString("base64");
}

export async function captureHeroScreenshotBase64(url: string) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: {
      width: 1280,
      height: 900,
      deviceScaleFactor: 2,
    },
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on("request", (req) => {
      const type = req.resourceType();
      const requestUrl = req.url();

      if (
        type === "media" ||
        type === "websocket" ||
        TRACKER_PATTERN.test(requestUrl)
      ) {
        req.abort();
        return;
      }

      req.continue();
    });

    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    );

    try {
      await page.goto(url, {
        waitUntil: "load",
        timeout: 12000,
      });
    } catch {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 10000,
      });
    }

    await preparePageForHeroScreenshot(page);

    const viewport = page.viewport();
    const clipWidth = viewport?.width ?? 1280;
    const clipHeight = viewport?.height ?? 900;

    await jumpTo(page, 0);

    const hero = await page.screenshot({
      type: "jpeg",
      quality: 94,
      clip: { x: 0, y: 0, width: clipWidth, height: clipHeight },
    });

    const rawBase64 = Buffer.from(hero as Buffer).toString("base64");
    return optimizeScreenshotBase64(rawBase64);
  } finally {
    await browser.close();
  }
}
