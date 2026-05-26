import sharp from "sharp";

async function optimizeScreenshotBase64(base64: string) {
  const optimized = await sharp(Buffer.from(base64, "base64"))
    .resize(768, null, { withoutEnlargement: true })
    .jpeg({ quality: 48, mozjpeg: true })
    .toBuffer();

  return optimized.toString("base64");
}

export async function optimizeScreenshots(base64List: string[]) {
  return Promise.all(base64List.map((shot) => optimizeScreenshotBase64(shot)));
}
