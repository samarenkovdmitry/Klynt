/** Parse CSS color strings from getComputedStyle into sRGB 0–255. Returns null if unknown. */

const NAMED_COLORS: Record<string, string> = {
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",
};

export type Rgb = { r: number; g: number; b: number };

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function parseHex(hex: string): Rgb | null {
  const normalized = hex.replace("#", "").trim();
  if (normalized.length === 3) {
    const r = parseInt(normalized[0] + normalized[0], 16);
    const g = parseInt(normalized[1] + normalized[1], 16);
    const b = parseInt(normalized[2] + normalized[2], 16);
    return { r, g, b };
  }
  if (normalized.length === 6) {
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    if ([r, g, b].some((v) => Number.isNaN(v))) return null;
    return { r, g, b };
  }
  return null;
}

function parseRgbFunction(value: string): (Rgb & { a: number }) | null {
  const match = value.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i
  );
  if (!match) return null;
  const r = clampByte(Number(match[1]));
  const g = clampByte(Number(match[2]));
  const b = clampByte(Number(match[3]));
  const a = match[4] !== undefined ? Math.max(0, Math.min(1, Number(match[4]))) : 1;
  return { r, g, b, a };
}

/** Blend foreground over a solid background (typically white page). */
export function blendOverBackground(fg: Rgb, alpha: number, bg: Rgb = { r: 255, g: 255, b: 255 }): Rgb {
  const a = Math.max(0, Math.min(1, alpha));
  return {
    r: clampByte(fg.r * a + bg.r * (1 - a)),
    g: clampByte(fg.g * a + bg.g * (1 - a)),
    b: clampByte(fg.b * a + bg.b * (1 - a)),
  };
}

export function parseCssColor(raw: string | null | undefined, fallbackBg: Rgb = { r: 255, g: 255, b: 255 }): Rgb | null {
  if (!raw?.trim()) return null;
  const value = raw.trim().toLowerCase();

  if (value === "transparent") return fallbackBg;

  const named = NAMED_COLORS[value];
  if (named && named !== "transparent") {
    return parseHex(named);
  }

  if (value.startsWith("#")) {
    return parseHex(value);
  }

  const rgb = parseRgbFunction(value);
  if (rgb) {
    if (rgb.a < 1) {
      return blendOverBackground({ r: rgb.r, g: rgb.g, b: rgb.b }, rgb.a, fallbackBg);
    }
    return { r: rgb.r, g: rgb.g, b: rgb.b };
  }

  return null;
}

function relativeLuminance({ r, g, b }: Rgb): number {
  const transform = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
}

/** WCAG 2.x contrast ratio between two sRGB colors (1–21). */
export function contrastRatio(foreground: Rgb, background: Rgb): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(1)}:1`;
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const toHex = (n: number) => clampByte(n).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/** Parse font-size / font-weight strings from computed style. */
export function parseFontSizePx(value: string | null | undefined): number | null {
  if (!value?.trim()) return null;
  const match = value.match(/^([\d.]+)px$/i);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

export function parseFontWeight(value: string | null | undefined): number | null {
  if (!value?.trim()) return null;
  const n = Number(value);
  if (Number.isFinite(n)) return n;
  if (value === "bold") return 700;
  if (value === "normal") return 400;
  return null;
}

/** AA thresholds: 4.5:1 normal text, 3:1 large / bold text. */
export function aaThreshold(fontSizePx: number | null, fontWeight: number | null): number {
  const isLarge = fontSizePx !== null && fontSizePx >= 18;
  const isBoldLarge =
    fontSizePx !== null &&
    fontSizePx >= 14 &&
    fontWeight !== null &&
    fontWeight >= 700;
  return isLarge || isBoldLarge ? 3 : 4.5;
}

export type ContrastMeasurement = {
  ratio: number;
  ratioLabel: string;
  threshold: number;
  passes: boolean;
  foregroundHex: string;
  backgroundHex: string;
  element: string;
};

export function measureContrast(
  foregroundRaw: string | null | undefined,
  backgroundRaw: string | null | undefined,
  options: {
    element: string;
    fontSizePx?: number | null;
    fontWeight?: number | null;
    fallbackBg?: Rgb;
  }
): ContrastMeasurement | null {
  const fallbackBg = options.fallbackBg ?? { r: 255, g: 255, b: 255 };
  const bg = parseCssColor(backgroundRaw, fallbackBg) ?? fallbackBg;
  const fg = parseCssColor(foregroundRaw, bg);
  if (!fg) return null;

  const ratio = contrastRatio(fg, bg);
  const threshold = aaThreshold(options.fontSizePx ?? null, options.fontWeight ?? null);

  return {
    ratio,
    ratioLabel: formatRatio(ratio),
    threshold,
    passes: ratio >= threshold,
    foregroundHex: rgbToHex(fg),
    backgroundHex: rgbToHex(bg),
    element: options.element,
  };
}

/** Suggest a foreground color on the same background that meets AA. */
export function suggestAaForeground(
  backgroundRaw: string | null | undefined,
  threshold: number,
  preferDark = true
): string {
  const bg = parseCssColor(backgroundRaw) ?? { r: 255, g: 255, b: 255 };
  const candidates: Rgb[] = preferDark
    ? [
        { r: 17, g: 24, b: 39 },
        { r: 31, g: 41, b: 55 },
        { r: 15, g: 23, b: 42 },
        { r: 0, g: 0, b: 0 },
      ]
    : [
        { r: 255, g: 255, b: 255 },
        { r: 248, g: 250, b: 252 },
        { r: 241, g: 245, b: 249 },
      ];

  for (const fg of candidates) {
    if (contrastRatio(fg, bg) >= threshold) {
      return rgbToHex(fg);
    }
  }

  return preferDark ? "#111827" : "#FFFFFF";
}
