export type HeroContrastSignal = {
  role: "headline" | "subheadline" | "body" | "cta";
  text: string;
  color: string;
  backgroundColor: string;
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
};

export type HeroTypographySignal = {
  headline?: { family: string; weight: number; sizePx: number };
  subheadline?: { family: string; weight: number; sizePx: number };
  sameFamily: boolean;
  weightGap: number;
};

export type HeroCtaSignal = {
  label: string;
  backgroundColor: string;
  color: string;
  fontWeight: number;
  fontSizePx: number;
  filled: boolean;
  outline: boolean;
};

export type HeroDensitySignal = {
  count: number;
  items: string[];
  level: "lean" | "normal" | "heavy";
};

export type HeroStyleSignals = {
  theme: "dark" | "light" | "mixed";
  contrast: HeroContrastSignal[];
  typography: HeroTypographySignal;
  ctas: HeroCtaSignal[];
  ctaWeightGap: "clear" | "weak" | "competing";
  density: HeroDensitySignal;
};

export function contrastRatioFromCss(fg: string, bg: string): number | null {
  const fgRgb = parseCssColor(fg);
  const bgRgb = parseCssColor(bg);
  if (!fgRgb || !bgRgb) return null;

  const l1 = relativeLuminance(fgRgb);
  const l2 = relativeLuminance(bgRgb);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 10) / 10;
}

function relativeLuminance([r, g, b]: [number, number, number]) {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function parseCssColor(input: string): [number, number, number] | null {
  const value = input.trim().toLowerCase();
  if (!value || value === "transparent") return null;

  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const raw = hex[1];
    if (raw.length === 3) {
      return [
        parseInt(raw[0] + raw[0], 16),
        parseInt(raw[1] + raw[1], 16),
        parseInt(raw[2] + raw[2], 16),
      ];
    }
    return [
      parseInt(raw.slice(0, 2), 16),
      parseInt(raw.slice(2, 4), 16),
      parseInt(raw.slice(4, 6), 16),
    ];
  }

  const rgb = value.match(/rgba?\(([^)]+)\)/);
  if (rgb) {
    const parts = rgb[1].split(",").map((part) => Number.parseFloat(part.trim()));
    if (parts.length >= 3 && parts.every((n) => Number.isFinite(n))) {
      return [parts[0], parts[1], parts[2]];
    }
  }

  return null;
}

export function formatHeroStyleSignalsForPrompt(signals: HeroStyleSignals): string {
  return `HERO STYLE SIGNALS (computed from DOM — treat as ground truth; cite these values in visual_fixes when relevant):

Theme: ${signals.theme}

Contrast samples:
${signals.contrast
  .map(
    (item) =>
      `- ${item.role}: "${item.text}" — ${item.color} on ${item.backgroundColor} → ratio ${item.ratio} (AA ${item.passesAA ? "pass" : "fail"}, AAA ${item.passesAAA ? "pass" : "fail"})`
  )
  .join("\n")}

Typography:
${
  signals.typography.headline
    ? `- Headline: ${signals.typography.headline.family}, weight ${signals.typography.headline.weight}, ${signals.typography.headline.sizePx}px`
    : "- Headline: not detected"
}
${
  signals.typography.subheadline
    ? `- Subheadline: ${signals.typography.subheadline.family}, weight ${signals.typography.subheadline.weight}, ${signals.typography.subheadline.sizePx}px`
    : "- Subheadline: not detected"
}
- Same font family: ${signals.typography.sameFamily ? "yes" : "no"}
- Weight gap (headline − subheadline): ${signals.typography.weightGap}

Hero CTAs:
${
  signals.ctas.length
    ? signals.ctas
        .map(
          (cta) =>
            `- "${cta.label}" — ${cta.filled ? "filled" : cta.outline ? "outline" : "text"}, weight ${cta.fontWeight}, ${cta.fontSizePx}px, bg ${cta.backgroundColor}, text ${cta.color}`
        )
        .join("\n")
    : "- none detected above fold"
}
- CTA visual weight gap: ${signals.ctaWeightGap}

Above-the-fold density:
- ${signals.density.count} elements (${signals.density.level}) — ${signals.density.items.join(", ")}

When writing visual_fixes:
- Use contrast signals for color_tone or typography with exact hex + AA/AAA in observation.
- Use CTA signals for cta_hierarchy with button labels and filled/outline evidence.
- Use typography signals for typography dimension with family/weight facts.
- Use density count for density dimension — cite the number (${signals.density.count}); >6 is a friction signal.`;
}

/**
 * Runs inside Puppeteer page context.
 */
export function extractHeroStyleSignalsInPage(): HeroStyleSignals {
  const viewportHeight = window.innerHeight;

  function isVisible(el: Element) {
    if (!(el instanceof HTMLElement)) return false;
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return false;
    if (Number.parseFloat(style.opacity) < 0.1) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 8 && rect.height > 8;
  }

  function isAboveFold(el: Element) {
    const rect = el.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < viewportHeight;
  }

  function normalizeText(text: string) {
    return text.replace(/\s+/g, " ").trim();
  }

  function parseRgb(color: string): [number, number, number] | null {
    const value = color.trim().toLowerCase();
    if (!value || value === "transparent") return null;
    const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hex) {
      const raw = hex[1];
      if (raw.length === 3) {
        return [
          parseInt(raw[0] + raw[0], 16),
          parseInt(raw[1] + raw[1], 16),
          parseInt(raw[2] + raw[2], 16),
        ];
      }
      return [
        parseInt(raw.slice(0, 2), 16),
        parseInt(raw.slice(2, 4), 16),
        parseInt(raw.slice(4, 6), 16),
      ];
    }
    const rgb = value.match(/rgba?\(([^)]+)\)/);
    if (rgb) {
      const parts = rgb[1].split(",").map((part) => Number.parseFloat(part.trim()));
      if (parts.length >= 3) return [parts[0], parts[1], parts[2]];
    }
    return null;
  }

  function luminance(rgb: [number, number, number]) {
    const channel = (value: number) => {
      const c = value / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
  }

  function toHex(rgb: [number, number, number]) {
    const part = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
    return `#${part(rgb[0])}${part(rgb[1])}${part(rgb[2])}`;
  }

  function resolveBackground(el: HTMLElement): string {
    let node: HTMLElement | null = el;
    while (node) {
      const bg = window.getComputedStyle(node).backgroundColor;
      const rgb = parseRgb(bg);
      if (rgb) return toHex(rgb);
      node = node.parentElement;
    }
    return "#ffffff";
  }

  function contrastFor(el: HTMLElement, fgColor: string, bgColor: string) {
    const fg = parseRgb(fgColor);
    const bg = parseRgb(bgColor);
    if (!fg || !bg) return 0;
    const l1 = luminance(fg);
    const l2 = luminance(bg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return Math.round(((lighter + 0.05) / (darker + 0.05)) * 10) / 10;
  }

  function styleColor(style: CSSStyleDeclaration, prop: "color" | "backgroundColor") {
    const rgb = parseRgb(style[prop]);
    return rgb ? toHex(rgb) : prop === "backgroundColor" ? "#ffffff" : "#000000";
  }

  function pickHeadline(): HTMLElement | null {
    const candidates = Array.from(document.querySelectorAll("h1"))
      .filter(isVisible)
      .filter(isAboveFold) as HTMLElement[];
    if (candidates.length) return candidates[0];

    const textBlocks = Array.from(document.querySelectorAll("h1,h2,p,span,div"))
      .filter(isVisible)
      .filter(isAboveFold) as HTMLElement[];

    let best: HTMLElement | null = null;
    let bestSize = 0;
    for (const el of textBlocks) {
      const text = normalizeText(el.innerText || "");
      if (text.length < 8 || text.length > 120) continue;
      const size = Number.parseFloat(window.getComputedStyle(el).fontSize);
      if (size > bestSize) {
        bestSize = size;
        best = el;
      }
    }
    return best;
  }

  function pickSubheadline(headline: HTMLElement | null): HTMLElement | null {
    if (!headline) return null;
    const siblings = Array.from(
      headline.parentElement?.querySelectorAll("h2,p,div,span") ?? []
    )
      .filter(isVisible)
      .filter(isAboveFold) as HTMLElement[];

    for (const el of siblings) {
      if (el === headline) continue;
      const text = normalizeText(el.innerText || "");
      if (text.length < 20) continue;
      const size = Number.parseFloat(window.getComputedStyle(el).fontSize);
      const headlineSize = Number.parseFloat(window.getComputedStyle(headline).fontSize);
      if (size <= headlineSize) return el;
    }
    return null;
  }

  function pickCtas(): HTMLElement[] {
    const selectors = ['button', 'a[role="button"]', 'a[class*="btn" i]', 'a[class*="button" i]'];
    const nodes = selectors.flatMap((selector) =>
      Array.from(document.querySelectorAll(selector))
    ) as HTMLElement[];

    const unique = new Map<string, HTMLElement>();
    for (const el of nodes) {
      if (!isVisible(el) || !isAboveFold(el)) continue;
      const text = normalizeText(el.innerText || el.textContent || "");
      if (text.length < 3 || text.length > 40) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top > viewportHeight * 0.82) continue;
      if (!unique.has(text)) unique.set(text, el);
    }
    return Array.from(unique.values()).slice(0, 4);
  }

  function readTypography(el: HTMLElement | null) {
    if (!el) return undefined;
    const style = window.getComputedStyle(el);
    return {
      family: style.fontFamily.split(",")[0]?.replace(/['"]/g, "").trim() || "unknown",
      weight: Number.parseInt(style.fontWeight, 10) || 400,
      sizePx: Math.round(Number.parseFloat(style.fontSize)),
    };
  }

  const headline = pickHeadline();
  const subheadline = pickSubheadline(headline);
  const ctaElements = pickCtas();

  const contrast: HeroContrastSignal[] = [];
  for (const [role, el] of [
    ["headline", headline],
    ["subheadline", subheadline],
  ] as const) {
    if (!el) continue;
    const style = window.getComputedStyle(el);
    const color = styleColor(style, "color");
    const backgroundColor = resolveBackground(el);
    const ratio = contrastFor(el, color, backgroundColor);
    contrast.push({
      role,
      text: normalizeText(el.innerText || "").slice(0, 60),
      color,
      backgroundColor,
      ratio,
      passesAA: ratio >= 4.5,
      passesAAA: ratio >= 7,
    });
  }

  const typographyHeadline = readTypography(headline);
  const typographySubheadline = readTypography(subheadline);
  const sameFamily =
    typographyHeadline && typographySubheadline
      ? typographyHeadline.family.toLowerCase() === typographySubheadline.family.toLowerCase()
      : false;
  const weightGap =
    typographyHeadline && typographySubheadline
      ? typographyHeadline.weight - typographySubheadline.weight
      : 0;

  const ctas: HeroCtaSignal[] = ctaElements.map((el) => {
    const style = window.getComputedStyle(el);
    const bg = styleColor(style, "backgroundColor");
    const color = styleColor(style, "color");
    const borderWidth = Number.parseFloat(style.borderTopWidth) || 0;
    const bgRaw = style.backgroundColor;
    const bgParsed = parseRgb(bgRaw);
    const filled =
      bgParsed !== null &&
      bgRaw !== "rgba(0, 0, 0, 0)" &&
      bgRaw !== "transparent";
    return {
      label: normalizeText(el.innerText || ""),
      backgroundColor: bg,
      color,
      fontWeight: Number.parseInt(style.fontWeight, 10) || 400,
      fontSizePx: Math.round(Number.parseFloat(style.fontSize)),
      filled,
      outline: borderWidth > 0 && !filled,
    };
  });

  let ctaWeightGap: HeroStyleSignals["ctaWeightGap"] = "clear";
  if (ctas.length >= 2) {
    const [first, second] = ctas;
    const weightDiff = Math.abs(first.fontWeight - second.fontWeight);
    const sameFill = first.filled === second.filled;
    if (sameFill && weightDiff < 100) ctaWeightGap = "competing";
    else if (sameFill || weightDiff < 100) ctaWeightGap = "weak";
  }

  const densityItems: string[] = [];
  const navLinks = Array.from(document.querySelectorAll("header a, nav a"))
    .filter(isVisible)
    .filter(isAboveFold);
  if (navLinks.length) densityItems.push("nav");

  if (headline) densityItems.push("headline");
  if (subheadline) densityItems.push("subheadline");
  if (ctaElements.length) densityItems.push(`cta×${ctaElements.length}`);

  const trustCandidates = Array.from(
    document.querySelectorAll(
      'img[alt*="logo" i], img[src*="logo" i], [class*="badge" i], [class*="stat" i], [class*="trust" i]'
    )
  )
    .filter(isVisible)
    .filter(isAboveFold);
  if (trustCandidates.length) densityItems.push("trust");

  const heroMedia = Array.from(document.querySelectorAll("header img, main img, picture, video"))
    .filter(isVisible)
    .filter(isAboveFold);
  if (heroMedia.length) densityItems.push("hero media");

  const densityCount = densityItems.reduce((sum, item) => {
    const match = item.match(/^cta×(\d+)$/);
    return sum + (match ? Number(match[1]) : 1);
  }, 0);

  const densityLevel: HeroDensitySignal["level"] =
    densityCount <= 4 ? "lean" : densityCount <= 6 ? "normal" : "heavy";

  const sampleBg = headline ? resolveBackground(headline) : "#ffffff";
  const sampleFg = headline ? styleColor(window.getComputedStyle(headline), "color") : "#000000";
  const bgLum = parseRgb(sampleBg) ? luminance(parseRgb(sampleBg)!) : 1;
  const fgLum = parseRgb(sampleFg) ? luminance(parseRgb(sampleFg)!) : 0;
  const theme: HeroStyleSignals["theme"] =
    bgLum < 0.35 && fgLum > 0.7 ? "dark" : bgLum > 0.75 ? "light" : "mixed";

  return {
    theme,
    contrast,
    typography: {
      headline: typographyHeadline,
      subheadline: typographySubheadline,
      sameFamily,
      weightGap,
    },
    ctas,
    ctaWeightGap,
    density: {
      count: densityCount,
      items: densityItems,
      level: densityLevel,
    },
  };
}
