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

export type CaptureWebsiteResult = {
  screenshots: string[];
  computedValues: PageComputedValues | null;
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
    try {
      computedValues = await page.evaluate(() => {
        const get = (selector: string) => document.querySelector(selector);
        const style = (el: Element | null) => el ? getComputedStyle(el) : null;

        const hero = get('section:first-of-type, [class*="hero"], main > div:first-child, header + div');
        const heroStyle = style(hero);

        const h1 = get("h1");
        const h1Style = style(h1);

        const sub = get('h1 + p, h1 + h2, h2, [class*="sub"], [class*="description"]');
        const subStyle = style(sub);

        const cta = get(
          'a[class*="primary"], button[class*="primary"], ' +
          'a[class*="cta"], button[class*="cta"], ' +
          'header a[class*="btn"], ' +
          "main a:first-of-type, main button:first-of-type"
        );
        const ctaStyle = style(cta);

        const nav = get("nav, header nav");
        const navLinks = nav
          ? Array.from(nav.querySelectorAll("a")).filter((a) => {
              const s = getComputedStyle(a);
              const rect = a.getBoundingClientRect();
              return (
                s.display !== "none" &&
                s.visibility !== "hidden" &&
                s.opacity !== "0" &&
                rect.width > 0 &&
                rect.height > 0 &&
                rect.top < window.innerHeight * 0.2
              );
            })
          : [];
        const uniqueNavLinks = [
          ...new Map(navLinks.map((a) => [a.href, a] as [string, HTMLAnchorElement])).values(),
        ];

        const proof = get(
          '[class*="logo"], [class*="trust"], [class*="social"], ' +
          '[class*="testimonial"], [class*="review"], [class*="badge"], ' +
          '[class*="customer"], [class*="partner"]'
        );
        const proofRect = proof ? proof.getBoundingClientRect() : null;
        const viewportHeight = window.innerHeight;

        return {
          hero_bg: heroStyle?.backgroundColor ?? null,
          hero_padding_top: heroStyle?.paddingTop ?? null,
          h1_text: (h1 as HTMLElement | null)?.innerText?.trim().slice(0, 120) ?? null,
          h1_font_size: h1Style?.fontSize ?? null,
          h1_font_weight: h1Style?.fontWeight ?? null,
          h1_color: h1Style?.color ?? null,
          sub_text: (sub as HTMLElement | null)?.innerText?.trim().slice(0, 120) ?? null,
          sub_font_size: subStyle?.fontSize ?? null,
          sub_font_weight: subStyle?.fontWeight ?? null,
          sub_color: subStyle?.color ?? null,
          cta_text: (cta as HTMLElement | null)?.innerText?.trim() ?? null,
          cta_bg: ctaStyle?.backgroundColor ?? null,
          cta_color: ctaStyle?.color ?? null,
          cta_border_radius: ctaStyle?.borderRadius ?? null,
          cta_font_weight: ctaStyle?.fontWeight ?? null,
          nav_link_count: uniqueNavLinks.length,
          nav_link_labels: uniqueNavLinks
            .map((a) => a.innerText.trim())
            .filter(Boolean)
            .slice(0, 10),
          nav_has_sticky: nav
            ? ["sticky", "fixed"].includes(getComputedStyle(nav).position)
            : false,
          social_proof_found: !!proof,
          social_proof_above_fold: proofRect ? proofRect.top < viewportHeight : false,
          card_border_radius: (() => {
            const card = get('[class*="card"], [class*="feature"], section > div > div');
            return card ? getComputedStyle(card).borderRadius : null;
          })(),
          viewport_width: window.innerWidth,
          viewport_height: viewportHeight,
        };
      }) as PageComputedValues;
    } catch {
      // DOM extraction failed — continue with screenshots only
    }

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
