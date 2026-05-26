import sharp from "sharp";
import {
  VISION_JPEG_QUALITY,
  VISION_MAX_WIDTH,
} from "@/lib/analyze/constants";

async function encodeForVision(input: Buffer): Promise<string> {
  const optimized = await sharp(input)
    .rotate()
    .resize(VISION_MAX_WIDTH, null, {
      withoutEnlargement: true,
      fastShrinkOnLoad: true,
    })
    .jpeg({ quality: VISION_JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  return optimized.toString("base64");
}

export async function optimizeScreenshotBuffer(
  input: Buffer | Uint8Array
): Promise<string> {
  return encodeForVision(Buffer.from(input));
}

export async function optimizeScreenshotBase64(base64: string): Promise<string> {
  return encodeForVision(Buffer.from(base64, "base64"));
}

export async function optimizeUploadedScreenshot(
  base64: string
): Promise<string> {
  const input = Buffer.from(base64, "base64");
  const meta = await sharp(input).metadata();

  const alreadySmall =
    (meta.width ?? Infinity) <= VISION_MAX_WIDTH &&
    (meta.format === "jpeg" || meta.format === "webp");

  if (alreadySmall && input.length <= 350_000) {
    return base64;
  }

  return encodeForVision(input);
}

export async function optimizeScreenshots(base64List: string[]) {
  return Promise.all(
    base64List.map((shot, index) =>
      index === 0 && base64List.length === 1
        ? optimizeUploadedScreenshot(shot)
        : optimizeScreenshotBase64(shot)
    )
  );
}
