import chromium from "@sparticuz/chromium";
import type { Browser } from "puppeteer-core";
import puppeteer from "puppeteer-core";

const BROWSER_IDLE_MS = Number(process.env.PUPPETEER_BROWSER_IDLE_MS) || 60_000;

let browserPromise: Promise<Browser> | null = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let activePages = 0;

async function launchBrowser(): Promise<Browser> {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: {
      width: 1280,
      height: 1080,
      deviceScaleFactor: 1,
    },
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  browser.on("disconnected", () => {
    browserPromise = null;
  });

  return browser;
}

function clearIdleTimer() {
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
}

function scheduleIdleClose() {
  clearIdleTimer();

  if (activePages > 0 || !browserPromise) {
    return;
  }

  idleTimer = setTimeout(() => {
    void closeIdleBrowser();
  }, BROWSER_IDLE_MS);
}

async function closeIdleBrowser() {
  if (activePages > 0 || !browserPromise) {
    return;
  }

  const current = browserPromise;
  browserPromise = null;
  clearIdleTimer();

  try {
    const browser = await current;
    await browser.close();
  } catch {
    // Best-effort cleanup for stale browser instances.
  }
}

export async function acquireSharedBrowser(): Promise<Browser> {
  clearIdleTimer();

  if (!browserPromise) {
    browserPromise = launchBrowser();
  }

  try {
    return await browserPromise;
  } catch (error) {
    browserPromise = null;
    throw error;
  }
}

export function markSharedBrowserPageOpened() {
  activePages += 1;
  clearIdleTimer();
}

export function markSharedBrowserPageClosed() {
  activePages = Math.max(0, activePages - 1);
  scheduleIdleClose();
}

export function resetSharedBrowserPool() {
  browserPromise = null;
  activePages = 0;
  clearIdleTimer();
}
