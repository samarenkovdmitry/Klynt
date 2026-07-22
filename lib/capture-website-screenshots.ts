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
      computedValues = await page.evaluate(() => {
        const get = (selector: string) => document.querySelector(selector);
        const style = (el: Element | null) => el ? getComputedStyle(el) : null;
        const gap = (a: Element | null, b: Element | null): number | null => {
          if (!a || !b) return null;
          const rectA = a.getBoundingClientRect();
          const rectB = b.getBoundingClientRect();
          return Math.round(rectB.top - rectA.bottom);
        };

        const hero = get('section:first-of-type, [class*="hero"], main > div:first-child, header + div');
        const heroStyle = style(hero);

        const h1 = get("h1");
        const h1Style = style(h1);

        const sub = get('h1 + p, h1 + h2, h2, [class*="sub"], [class*="description"]');
        const subStyle = style(sub);

        // Returns first element in DOM matching selector that has visible non-empty text.
        const findWithText = (selector: string): Element | null => {
          const elements = Array.from(document.querySelectorAll(selector));
          return (
            elements.find(
              (el) => (el as HTMLElement).innerText?.trim().length > 0
            ) ?? null
          );
        };

        const ctaSelectors = [
          'header button:not([aria-label*="menu" i])',
          "nav a.btn, nav button",
          '[class*="hero"] button, [class*="hero"] a[href]',
          'button[class*="primary"], a[class*="primary"]',
          "section:first-of-type button, section:first-of-type a[href]",
        ];
        let cta: Element | null = null;
        for (const sel of ctaSelectors) {
          cta = findWithText(sel);
          if (cta) break;
        }
        const ctaStyle = style(cta);

        const nav = get(
          'nav, header nav, [role="navigation"], ' +
          'header ul, header > div > ul, ' +
          '[class*="nav"]:not([class*="icon"]):not([class*="arrow"]), ' +
          '[class*="menu"]:not([class*="hamburger"]):not([class*="mobile"])'
        );

        const isVisibleNavLink = (a: Element, maxTop: number) => {
          const s = getComputedStyle(a);
          const rect = a.getBoundingClientRect();
          return (
            s.display !== "none" &&
            s.visibility !== "hidden" &&
            s.opacity !== "0" &&
            rect.width > 0 &&
            rect.height > 0 &&
            rect.top >= 0 &&
            rect.top < maxTop
          );
        };

        let rawNavLinks: HTMLAnchorElement[] = nav
          ? Array.from(nav.querySelectorAll("a")).filter(
              (a) => isVisibleNavLink(a, window.innerHeight * 0.3)
            )
          : [];

        // Fallback: header with 3+ visible above-fold links (e.g. readymag-style sites)
        if (rawNavLinks.length < 3) {
          const header = document.querySelector("header");
          if (header) {
            const headerLinks = Array.from(header.querySelectorAll("a")).filter(
              (a) => isVisibleNavLink(a, window.innerHeight)
            );
            if (headerLinks.length >= 3) {
              rawNavLinks = headerLinks as HTMLAnchorElement[];
            }
          }
        }

        const uniqueNavLinks = [
          ...new Map(
            rawNavLinks.map((a) => [a.href, a] as [string, HTMLAnchorElement])
          ).values(),
        ];

        const viewportHeight = window.innerHeight;

        // querySelectorAll so any above-fold element wins — querySelector would
        // pick the first DOM match which may be a footer element or the site logo.
        const proofSelector =
          '[class*="logo"i], [class*="trust"i], [class*="social"i], ' +
          '[class*="testimonial"i], [class*="review"i], [class*="badge"i], ' +
          '[class*="customer"i], [class*="partner"i], [class*="rating"i], ' +
          '[class*="star"i], [class*="g2"i], [class*="trustpilot"i], ' +
          '[class*="award"i], [class*="press"i], [class*="featured"i], ' +
          '[class*="client"i], img[alt*="logo" i]';

        const proofElements = Array.from(document.querySelectorAll(proofSelector));
        const proofAboveFold = proofElements.some((el) => {
          const rect = el.getBoundingClientRect();
          // Scan 1.5× viewport — logos in the second visual block are still "above the fold" in practice
          return rect.top >= 0 && rect.top < viewportHeight * 1.5 && rect.width > 0;
        });
        const socialProofFound = proofElements.length > 0;

        return {
          hero_bg: heroStyle?.backgroundColor ?? null,
          hero_padding_top: heroStyle ? (parseInt(heroStyle.paddingTop) || null) : null,
          hero_h1_to_sub_gap: gap(h1, sub),
          hero_sub_to_cta_gap: gap(sub, cta),
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
          nav_has_sticky: (() => {
            const stickyEl = nav ?? document.querySelector("header");
            return stickyEl
              ? ["sticky", "fixed"].includes(getComputedStyle(stickyEl).position)
              : false;
          })(),
          social_proof_found: socialProofFound,
          social_proof_above_fold: proofAboveFold,
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
