import type { Page } from "puppeteer-core";

const COOKIE_OVERLAY_SELECTORS = [
  "#onetrust-banner-sdk",
  "#onetrust-consent-sdk",
  "#CybotCookiebotDialog",
  "#cookiebanner",
  "#cookies-banner",
  "#sp-cc",
  "#truste-consent-track",
  ".fc-consent-root",
  ".ch2-dialog",
  '[class*="cookie-banner" i]',
  '[class*="cookie-consent" i]',
  '[class*="cookie-notice" i]',
  '[id*="cookie-banner" i]',
  '[id*="cookie-consent" i]',
  '[aria-label*="cookie" i]',
  '[aria-label*="consent" i]',
];

async function dismissPageOverlays(page: Page) {
  await page.evaluate((selectors) => {
    for (const selector of selectors) {
      for (const node of document.querySelectorAll(selector)) {
        if (!(node instanceof HTMLElement)) continue;
        node.style.setProperty("display", "none", "important");
      }
    }

    for (const node of document.querySelectorAll("body *")) {
      if (!(node instanceof HTMLElement)) continue;

      const style = window.getComputedStyle(node);
      const isFixed = style.position === "fixed" || style.position === "sticky";
      if (!isFixed) continue;

      const text = `${node.className} ${node.id}`.toLowerCase();
      const looksLikeOverlay =
        /cookie|consent|gdpr|privacy|banner|onetrust|truste|sp-cc|fc-consent/.test(
          text
        );

      if (looksLikeOverlay) {
        node.style.setProperty("visibility", "hidden", "important");
        node.style.setProperty("pointer-events", "none", "important");
      }
    }
  }, COOKIE_OVERLAY_SELECTORS);
}

async function waitForAboveFoldAssets(page: Page) {
  await page.evaluate(async () => {
    const viewportHeight = window.innerHeight;
    const candidates = Array.from(document.querySelectorAll("img, picture, svg"))
      .slice(0, 24)
      .filter((node) => {
        const rect = node.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < viewportHeight;
      });

    await Promise.all(
      candidates.map(
        (node) =>
          new Promise<void>((resolve) => {
            if (node instanceof HTMLImageElement) {
              if (node.complete) {
                resolve();
                return;
              }

              node.addEventListener("load", () => resolve(), { once: true });
              node.addEventListener("error", () => resolve(), { once: true });
              return;
            }

            resolve();
          })
      )
    );

    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });
}

export async function preparePageForHeroScreenshot(page: Page) {
  await page.evaluate(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  });

  await dismissPageOverlays(page);
  await waitForAboveFoldAssets(page);
  await new Promise((r) => setTimeout(r, 350));
}

export async function preparePageForLowerScreenshot(page: Page) {
  await dismissPageOverlays(page);
  await waitForAboveFoldAssets(page);
  await new Promise((r) => setTimeout(r, 250));
}
