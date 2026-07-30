import fs from "fs/promises";
import path from "path";

import { captureWebsiteScreenshots } from "@/lib/capture-website-screenshots";
import { buildMobilePreviewImage } from "@/lib/report-preview";

const mobilePath = path.join(process.cwd(), "public/demo/folk-mobile-preview.jpg");

async function main() {
  const result = await captureWebsiteScreenshots("https://folk.app/", {
    mobile: true,
    lower: false,
    performance: false,
  });

  if (!result.mobileHeroScreenshotBase64) {
    throw new Error("Mobile screenshot missing");
  }

  const dataUrl = await buildMobilePreviewImage(result.mobileHeroScreenshotBase64);
  const base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, "");
  await fs.writeFile(mobilePath, Buffer.from(base64, "base64"));
  console.log(`Wrote live mobile preview to ${mobilePath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
