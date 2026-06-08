import type { Page } from "puppeteer-core";

import { shouldBlockScreenshotRequest } from "@/lib/screenshot-request-filter";

const PAGE_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export async function configureScreenshotPage(page: Page) {
  await page.setRequestInterception(true);

  page.on("request", (req) => {
    if (shouldBlockScreenshotRequest(req.resourceType(), req.url())) {
      req.abort();
      return;
    }

    req.continue();
  });

  await page.setUserAgent(PAGE_USER_AGENT);
}

/** Fast first paint, then brief settle so SPAs can render above-the-fold content. */
export async function navigatePageForCapture(page: Page, url: string) {
  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 12_000,
    });
  } catch {
    await page.goto(url, {
      waitUntil: "load",
      timeout: 15_000,
    });
  }

  await settlePageAfterNavigation(page);
}

async function settlePageAfterNavigation(page: Page) {
  try {
    await page.waitForNetworkIdle({ idleTime: 400, timeout: 3_500 });
  } catch {
    // SPAs may never reach network idle — fixed delay is the fallback.
  }

  await new Promise((resolve) => setTimeout(resolve, 900));
}
