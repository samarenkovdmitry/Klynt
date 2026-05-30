import { readFile } from "node:fs/promises";
import path from "node:path";

export const REPORT_OG_FONT_FAMILY = "'Familjen Grotesk', sans-serif";

const FONT_DIR = path.join(process.cwd(), "public", "fonts");

const FONT_FILES = [
  { weight: 400, file: "familjen-grotesk-400.ttf" },
  { weight: 700, file: "familjen-grotesk-700.ttf" },
] as const;

let fontFacesCache: string | null = null;

function buildEmbeddedFontFace(weight: number, data: Buffer) {
  return `@font-face{font-family:'Familjen Grotesk';src:url('data:font/truetype;base64,${data.toString("base64")}') format('truetype');font-weight:${weight};font-style:normal;}`;
}

export async function getReportOgFontFaces() {
  if (fontFacesCache) {
    return fontFacesCache;
  }

  const loaded = await Promise.all(
    FONT_FILES.map(async ({ weight, file }) => {
      const data = await readFile(path.join(FONT_DIR, file));
      return buildEmbeddedFontFace(weight, data);
    })
  );

  fontFacesCache = loaded.join("");
  return fontFacesCache;
}
