import { readFile } from "node:fs/promises";
import path from "node:path";

export const REPORT_OG_FONT_FAMILY = "'Familjen Grotesk', sans-serif";

const FONT_DIR = path.join(process.cwd(), "public", "fonts");

let regularFontCache: Buffer | null = null;
let boldFontCache: Buffer | null = null;
let fontFacesCache: string | null = null;

async function loadFont(fileName: string) {
  return readFile(path.join(FONT_DIR, fileName));
}

function buildEmbeddedFontFace(weight: number, data: Buffer) {
  return `@font-face{font-family:'Familjen Grotesk';src:url('data:font/truetype;base64,${data.toString("base64")}') format('truetype');font-weight:${weight};font-style:normal;}`;
}

export async function getReportOgFontFaces() {
  if (fontFacesCache) {
    return fontFacesCache;
  }

  regularFontCache ??= await loadFont("familjen-grotesk-400.ttf");
  boldFontCache ??= await loadFont("familjen-grotesk-700.ttf");

  fontFacesCache = [
    buildEmbeddedFontFace(400, regularFontCache),
    buildEmbeddedFontFace(700, boldFontCache),
  ].join("");

  return fontFacesCache;
}
