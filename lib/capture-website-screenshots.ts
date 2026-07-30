import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Browser, Page } from "puppeteer-core";

import {
  configureScreenshotPage,
  navigatePageForCapture,
} from "@/lib/page-capture-navigate";
import { attachPerformanceInstrumentation } from "@/lib/capture-performance-metrics";
import { MOBILE_CAPTURE_VIEWPORT } from "@/lib/capture-viewports";
import {
  acquireSharedBrowser,
  markSharedBrowserPageClosed,
  markSharedBrowserPageOpened,
  resetSharedBrowserPool,
} from "@/lib/puppeteer-browser-pool";
import { preparePageForHeroScreenshot, preparePageForLowerScreenshot } from "@/lib/page-screenshot";
import { retryAsync } from "@/lib/retry-async";
import type { PageComputedValues, PagePerformanceMetrics } from "@/lib/audit-report";
import type { PageMetaSnapshot } from "@/lib/analysis/extraction";
import {
  getHeroDomSignalPatterns,
  sanitizeCtaText,
  sanitizeSubheadlineText,
} from "@/lib/hero-dom-signals";

const HERO_EXTRACTOR_SCRIPT = readFileSync(
  join(process.cwd(), "lib/extract-hero-computed-values.browser.js"),
  "utf8"
);

export type CaptureWebsiteOptions = {
  /** Second pass at 390px with reload. Default true. */
  mobile?: boolean;
  /** Below-the-fold screenshot. Default true. */
  lower?: boolean;
  /** CDP + Web Vitals on first navigation. Default true. */
  performance?: boolean;
};

export type CaptureWebsiteResult = {
  screenshots: string[];
  computedValues: PageComputedValues | null;
  mobileComputedValues: PageComputedValues | null;
  mobileHeroScreenshotBase64: string | null;
  pageMeta: PageMetaSnapshot;
  bodyText: string;
  performanceMetrics: PagePerformanceMetrics | null;
};

async function jumpTo(page: Page, y: number) {
  await page.evaluate((scrollY: number) => {
    window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
  }, y);

  await new Promise((resolve) => setTimeout(resolve, 80));
}

async function extractComputedValues(page: Page): Promise<PageComputedValues | null> {
  try {
    const domSignalPatterns = getHeroDomSignalPatterns();
    let computedValues = (await page.evaluate(
      (patterns, script) => {
        const run = new Function(
          "patterns",
          `${script}\nreturn extractHeroComputedValuesInBrowser(patterns);`
        );
        return run(patterns);
      },
      domSignalPatterns,
      HERO_EXTRACTOR_SCRIPT
    )) as PageComputedValues;

    if (computedValues) {
      computedValues = {
        ...computedValues,
        sub_text: sanitizeSubheadlineText(computedValues.sub_text),
        cta_text: sanitizeCtaText(computedValues.cta_text),
      };
    }

    return computedValues;
  } catch (error) {
    console.warn("[capture] DOM extraction failed", error);
    return null;
  }
}

async function sanitizeCtaAgainstHtml(
  page: Page,
  computedValues: PageComputedValues | null,
  url: string
): Promise<PageComputedValues | null> {
  if (!computedValues?.cta_text) return computedValues;

  try {
    const html = await page.content();
    if (!html.toLowerCase().includes(computedValues.cta_text.toLowerCase())) {
      console.warn("[capture] cta_text sanity FAIL — not found in page HTML, nulling", {
        url,
        cta_text: computedValues.cta_text,
      });
      return { ...computedValues, cta_text: null };
    }
  } catch {
    // Non-fatal
  }

  return computedValues;
}

async function captureHeroScreenshotOnly(page: Page): Promise<string> {
  await preparePageForHeroScreenshot(page);
  const viewport = page.viewport();
  const clipWidth = viewport?.width ?? 1280;
  const clipHeight = viewport?.height ?? 900;
  const hero = await page.screenshot({
    type: "jpeg",
    quality: 94,
    clip: { x: 0, y: 0, width: clipWidth, height: clipHeight },
  });
  return Buffer.from(hero as Buffer).toString("base64");
}

async function captureHeroAndLowerScreenshots(page: Page): Promise<string[]> {
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
  const lowerClipHeight = Math.min(clipHeight, Math.max(1, bodyHeight - lowerY));

  const heroShotOptions = {
    type: "jpeg" as const,
    quality: 94,
    clip: { x: 0, y: heroY, width: clipWidth, height: clipHeight },
  };
  const lowerShotOptions = {
    type: "jpeg" as const,
    quality: 80,
    clip: { x: 0, y: lowerY, width: clipWidth, height: lowerClipHeight },
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
}

async function captureMobileHeroScreenshot(page: Page): Promise<string | null> {
  try {
    await preparePageForHeroScreenshot(page);
    const viewport = page.viewport();
    const clipWidth = viewport?.width ?? MOBILE_CAPTURE_VIEWPORT.width;
    const clipHeight = viewport?.height ?? MOBILE_CAPTURE_VIEWPORT.height;

    const hero = await page.screenshot({
      type: "jpeg",
      quality: 82,
      clip: { x: 0, y: 0, width: clipWidth, height: clipHeight },
    });

    return Buffer.from(hero as Buffer).toString("base64");
  } catch (error) {
    console.warn("[capture] mobile hero screenshot failed", error);
    return null;
  }
}

async function captureWebsiteScreenshotsOnce(
  url: string,
  options: CaptureWebsiteOptions = {}
): Promise<CaptureWebsiteResult> {
  const { mobile = true, lower = true, performance = true } = options;
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    browser = await acquireSharedBrowser();
    markSharedBrowserPageOpened();
    page = await browser.newPage();

    await configureScreenshotPage(page);
    const collectPerformanceMetrics = performance
      ? await attachPerformanceInstrumentation(page)
      : null;
    await navigatePageForCapture(page, url);

    let performanceMetrics: PagePerformanceMetrics | null = null;
    if (collectPerformanceMetrics) {
      try {
        performanceMetrics = await collectPerformanceMetrics();
      } catch (error) {
        console.warn("[capture] performance metrics collection failed", error);
      }
    }

    let pageMeta: PageMetaSnapshot = {
      title: "",
      description: "",
      hasMobileViewportMeta: false,
    };
    try {
      pageMeta = await page.evaluate(() => {
        const description =
          document.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() ||
          document
            .querySelector('meta[property="og:description"]')
            ?.getAttribute("content")
            ?.trim() ||
          "";
        const viewportContent =
          document.querySelector('meta[name="viewport"]')?.getAttribute("content") ?? "";

        return {
          title: document.title?.trim() ?? "",
          description,
          hasMobileViewportMeta: /width\s*=\s*device-width/i.test(viewportContent),
        };
      });
    } catch {
      // Continue without page meta
    }

    let bodyText = "";
    try {
      bodyText = await page.evaluate(() => document.body.innerText.trim().slice(0, 16000));
    } catch {
      // Continue without body text
    }

    let computedValues = await extractComputedValues(page);
    computedValues = await sanitizeCtaAgainstHtml(page, computedValues, url);

    console.log("[capture] desktop computed_values", {
      url,
      viewport_width: computedValues?.viewport_width,
      h1_text: computedValues?.h1_text,
      cta_text: computedValues?.cta_text,
    });

    const screenshots = lower
      ? await captureHeroAndLowerScreenshots(page)
      : [await captureHeroScreenshotOnly(page)];

    let mobileComputedValues: PageComputedValues | null = null;
    let mobileHeroScreenshotBase64: string | null = null;

    if (mobile) {
      try {
        await page.setViewport(MOBILE_CAPTURE_VIEWPORT);
        await navigatePageForCapture(page, url);

        mobileComputedValues = await extractComputedValues(page);
        mobileComputedValues = await sanitizeCtaAgainstHtml(page, mobileComputedValues, url);
        mobileHeroScreenshotBase64 = await captureMobileHeroScreenshot(page);

        console.log("[capture] mobile computed_values", {
          url,
          viewport_width: mobileComputedValues?.viewport_width,
          h1_text: mobileComputedValues?.h1_text,
          cta_text: mobileComputedValues?.cta_text,
        });
      } catch (error) {
        console.warn("[capture] mobile viewport pass failed — continuing with desktop only", error);
      }
    }

    return {
      screenshots,
      computedValues,
      mobileComputedValues,
      mobileHeroScreenshotBase64,
      pageMeta,
      bodyText,
      performanceMetrics,
    };
  } catch (error) {
    resetSharedBrowserPool();
    throw error;
  } finally {
    await page?.close().catch(() => {});
    markSharedBrowserPageClosed();
  }
}

export async function captureWebsiteScreenshots(
  url: string,
  options: CaptureWebsiteOptions = {}
): Promise<CaptureWebsiteResult> {
  return retryAsync(() => captureWebsiteScreenshotsOnce(url, options), {
    attempts: 2,
    delayMs: 900,
    label: "screenshot-capture",
  });
}
