import puppeteer, { type Browser, type Page } from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import {
  BLOCKED_RESOURCE_TYPES,
  TRACKER_PATTERN,
  USER_AGENT,
  VIEWPORT,
} from "@/lib/analyze/constants";

const executablePathPromise = chromium.executablePath();

let browserInstance: Browser | null = null;
let browserLaunchPromise: Promise<Browser> | null = null;

async function launchBrowser(): Promise<Browser> {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: VIEWPORT,
    executablePath: await executablePathPromise,
    headless: true,
  });

  browser.on("disconnected", () => {
    browserInstance = null;
    browserLaunchPromise = null;
  });

  return browser;
}

export async function getSharedBrowser(): Promise<Browser> {
  if (browserInstance?.connected) {
    return browserInstance;
  }

  if (!browserLaunchPromise) {
    browserLaunchPromise = launchBrowser().then((browser) => {
      browserInstance = browser;
      browserLaunchPromise = null;
      return browser;
    });
  }

  return browserLaunchPromise;
}

export function configurePageRequests(page: Page) {
  page.setRequestInterception(true);

  page.on("request", (req) => {
    const type = req.resourceType();
    const requestUrl = req.url();

    if (
      BLOCKED_RESOURCE_TYPES.has(type) ||
      TRACKER_PATTERN.test(requestUrl)
    ) {
      req.abort();
      return;
    }

    req.continue();
  });
}

export async function withBrowserPage<T>(
  fn: (page: Page) => Promise<T>
): Promise<T> {
  const browser = await getSharedBrowser();
  const page = await browser.newPage();

  try {
    await page.setUserAgent(USER_AGENT);
    configurePageRequests(page);
    return await fn(page);
  } finally {
    await page.close().catch(() => undefined);
  }
}
