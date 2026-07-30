import type { PageComputedValues } from "@/lib/audit-report";
import { measureContrast, parseFontSizePx, parseFontWeight } from "@/lib/signals/wcag-contrast";

export type MobileDesktopComparison = {
  mobile_viewport_width: number;
  cta_missing_on_mobile: boolean;
  h1_missing_on_mobile: boolean;
  subheadline_missing_on_mobile: boolean;
  h1_contrast_regression: boolean;
  cta_contrast_regression: boolean;
  nav_link_count_desktop: number;
  nav_link_count_mobile: number;
  /** Desktop primary-action CTA replaced or absent on mobile (e.g. promo pill vs signup). */
  primary_cta_regression: boolean;
};

const PRIMARY_ACTION_CTA_PATTERN =
  /free|trial|start|get started|sign up|signup|try|demo|join|register|book/i;

export function isPrimaryActionCta(text: string | null | undefined): boolean {
  if (!text?.trim()) return false;
  return PRIMARY_ACTION_CTA_PATTERN.test(text.trim());
}

/** Desktop has a primary-action CTA but mobile does not show the same intent above the fold. */
export function mobilePrimaryCtaRegression(
  desktop: PageComputedValues | null,
  mobile: PageComputedValues | null
): boolean | null {
  const desktopCta = desktop?.cta_text?.trim();
  const mobileCta = mobile?.cta_text?.trim();
  if (!desktop || !mobile || !desktopCta || !isPrimaryActionCta(desktopCta)) {
    return null;
  }

  if (!mobileCta) return true;

  const sameLabel = desktopCta.toLowerCase() === mobileCta.toLowerCase();
  if (sameLabel) return false;

  if (!isPrimaryActionCta(mobileCta)) return true;

  return false;
}

function textField(
  values: PageComputedValues | null,
  field: "h1" | "sub" | "cta"
): string | null {
  if (!values) return null;
  if (field === "h1") return values.h1_text;
  if (field === "sub") return values.sub_text;
  return values.cta_text;
}

function contrastPasses(
  fg: string | null,
  bg: string | null,
  opts: { element: string; fontSize: string | null; fontWeight: string | null }
): boolean | null {
  const measurement = measureContrast(fg, bg, {
    element: opts.element,
    fontSizePx: parseFontSizePx(opts.fontSize),
    fontWeight: parseFontWeight(opts.fontWeight),
  });
  if (!measurement) return null;
  return measurement.passes;
}

export function buildMobileDesktopComparison(
  desktop: PageComputedValues | null,
  mobile: PageComputedValues | null
): MobileDesktopComparison | null {
  if (!desktop || !mobile) return null;

  const h1Desktop = textField(desktop, "h1")?.trim();
  const h1Mobile = textField(mobile, "h1")?.trim();
  const subDesktop = textField(desktop, "sub")?.trim();
  const subMobile = textField(mobile, "sub")?.trim();
  const ctaDesktop = textField(desktop, "cta")?.trim();
  const ctaMobile = textField(mobile, "cta")?.trim();

  const h1DesktopContrast = contrastPasses(desktop.h1_color, desktop.hero_bg, {
    element: "H1",
    fontSize: desktop.h1_font_size,
    fontWeight: desktop.h1_font_weight,
  });
  const h1MobileContrast = contrastPasses(mobile.h1_color, mobile.hero_bg, {
    element: "H1",
    fontSize: mobile.h1_font_size,
    fontWeight: mobile.h1_font_weight,
  });

  const ctaDesktopContrast = contrastPasses(desktop.cta_color, desktop.cta_bg, {
    element: "Primary CTA",
    fontSize: null,
    fontWeight: desktop.cta_font_weight,
  });
  const ctaMobileContrast = contrastPasses(mobile.cta_color, mobile.cta_bg, {
    element: "Primary CTA",
    fontSize: null,
    fontWeight: mobile.cta_font_weight,
  });

  return {
    mobile_viewport_width: mobile.viewport_width,
    cta_missing_on_mobile: Boolean(ctaDesktop && !ctaMobile),
    h1_missing_on_mobile: Boolean(h1Desktop && !h1Mobile),
    subheadline_missing_on_mobile: Boolean(subDesktop && !subMobile),
    h1_contrast_regression:
      h1DesktopContrast === true && h1MobileContrast === false,
    cta_contrast_regression:
      ctaDesktopContrast === true && ctaMobileContrast === false,
    nav_link_count_desktop: desktop.nav_link_count,
    nav_link_count_mobile: mobile.nav_link_count,
    primary_cta_regression: mobilePrimaryCtaRegression(desktop, mobile) === true,
  };
}

export function mobileElementMissing(
  desktop: PageComputedValues | null,
  mobile: PageComputedValues | null,
  field: "h1" | "sub" | "cta"
): boolean | null {
  const desktopText = textField(desktop, field)?.trim();
  const mobileText = textField(mobile, field)?.trim();
  if (!desktop || !mobile || !desktopText) return null;
  return !mobileText;
}
