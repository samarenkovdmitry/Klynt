import { readFile } from "node:fs/promises";
import path from "node:path";

export const REPORT_OG_FONT_FAMILY = "'Familjen Grotesk', sans-serif";

const FONT_FILES = [
  { weight: 400, file: "familjen-grotesk-400.ttf" },
  { weight: 600, file: "familjen-grotesk-600.ttf" },
  { weight: 700, file: "familjen-grotesk-700.ttf" },
] as const;

let fontFacesCache: string | null = null;

export async function getReportOgFontFaces() {
  if (fontFacesCache) {
    return fontFacesCache;
  }

  const faces = await Promise.all(
    FONT_FILES.map(async ({ weight, file }) => {
      const fontPath = path.join(process.cwd(), "public", "fonts", file);
      const base64 = (await readFile(fontPath)).toString("base64");

      return `@font-face{font-family:'Familjen Grotesk';src:url('data:font/truetype;base64,${base64}') format('truetype');font-weight:${weight};font-style:normal;}`;
    })
  );

  fontFacesCache = faces.join("");
  return fontFacesCache;
}
