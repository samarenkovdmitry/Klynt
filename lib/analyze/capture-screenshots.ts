import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import type { Page } from "puppeteer-core";

const TRACKER_PATTERN =
  /google-analytics|googletagmanager|facebook\.net|hotjar|segment\.(com|io)|intercom|clarity\.ms|doubleclick|sentry\.io|mixpanel|amplitude/i;

async function jumpTo(page: Page, y: number) {
  await page.evaluate((scrollY: number) => {
    window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
  }, y);

  await new Promise((resolve) => setTimeout(resolve, 80));
}

export async function captureWebsiteScreenshots(url: string) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: {
      width: 800,
      height: 700,
      deviceScaleFactor: 1,
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
        type === "font" ||
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

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 8000,
    });

    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);

    const lowerY =
      bodyHeight <= 900
        ? Math.max(0, bodyHeight - 650)
        : Math.max(Math.floor(bodyHeight * 0.52), bodyHeight - 1300);

    const shotOptions = { type: "jpeg" as const, quality: 48 };

    await jumpTo(page, 0);
    const hero = await page.screenshot(shotOptions);

    await jumpTo(page, lowerY);
    const lower = await page.screenshot(shotOptions);

    return [
      Buffer.from(hero as Buffer).toString("base64"),
      Buffer.from(lower as Buffer).toString("base64"),
    ];
  } finally {
    await browser.close();
  }
}
