import { readFileSync } from "node:fs";
import { join } from "node:path";
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
import type { PageComputedValues } from "@/lib/audit-report";
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

export type CaptureWebsiteResult = {
  screenshots: string[];
  computedValues: PageComputedValues | null;
  pageMeta: PageMetaSnapshot;
  bodyText: string;
};

async function jumpTo(page: Page, y: number) {
  await page.evaluate((scrollY: number) => {
    window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
  }, y);

  await new Promise((resolve) => setTimeout(resolve, 80));
}

async function captureWebsiteScreenshotsOnce(url: string): Promise<CaptureWebsiteResult> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    browser = await acquireSharedBrowser();
    markSharedBrowserPageOpened();
    page = await browser.newPage();

    await configureScreenshotPage(page);
    await navigatePageForCapture(page, url);

    let computedValues: PageComputedValues | null = null;
    let bodyText = "";
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
    try {
      bodyText = await page.evaluate(() =>
        document.body.innerText.trim().slice(0, 16000)
      );
    } catch {
      // Continue without body text
    }
    try {
      const domSignalPatterns = getHeroDomSignalPatterns();
      computedValues = (await page.evaluate(
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
    } catch (error) {
      console.warn("[capture] DOM extraction failed — continuing with screenshots only", error);
    }

    // Sanity check: reject cta_text if it doesn't appear in the actual page HTML.
    // This catches cases where the selector matched an element with invisible/dynamic text.
    if (computedValues?.cta_text) {
      try {
        const html = await page.content();
        if (!html.toLowerCase().includes(computedValues.cta_text.toLowerCase())) {
          console.warn("[capture] cta_text sanity FAIL — not found in page HTML, nulling", {
            url,
            cta_text: computedValues.cta_text,
          });
          computedValues = { ...computedValues, cta_text: null };
        }
      } catch {
        // Non-fatal — keep the value if we can't verify
      }
    }

    console.log("[capture] computed_values", {
      url,
      social_proof_found: computedValues?.social_proof_found,
      social_proof_above_fold: computedValues?.social_proof_above_fold,
      viewport_width: computedValues?.viewport_width,
      viewport_height: computedValues?.viewport_height,
      h1_text: computedValues?.h1_text,
      cta_text_raw: computedValues?.cta_text,
    });

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

    return {
      screenshots: [
        Buffer.from(hero as Buffer).toString("base64"),
        Buffer.from(lower as Buffer).toString("base64"),
      ],
      computedValues,
      pageMeta,
      bodyText,
    };
  } catch (error) {
    resetSharedBrowserPool();
    throw error;
  } finally {
    await page?.close().catch(() => {});
    markSharedBrowserPageClosed();
  }
}

export async function captureWebsiteScreenshots(url: string): Promise<CaptureWebsiteResult> {
  return retryAsync(() => captureWebsiteScreenshotsOnce(url), {
    attempts: 2,
    delayMs: 900,
    label: "screenshot-capture",
  });
}
