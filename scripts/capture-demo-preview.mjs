import fs from "node:fs";
import path from "node:path";

import puppeteer from "puppeteer-core";
import sharp from "sharp";

const OUTPUT = path.join(process.cwd(), "public/demo/zapier-preview.jpg");
const URL = "https://zapier.com";

function getChromePath() {
  if (process.platform === "darwin") {
    return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  }

  return process.env.CHROME_PATH ?? "/usr/bin/google-chrome";
}

async function main() {
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: getChromePath(),
    headless: true,
    defaultViewport: {
      width: 1280,
      height: 900,
      deviceScaleFactor: 2,
    },
  });

  try {
    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const screenshot = await page.screenshot({
      type: "jpeg",
      quality: 92,
      clip: { x: 0, y: 0, width: 1280, height: 900 },
    });

    await sharp(screenshot)
      .resize(620, 380, { fit: "cover", position: "top" })
      .sharpen({ sigma: 0.35 })
      .jpeg({ quality: 86, mozjpeg: true })
      .toFile(OUTPUT);

    console.log(`Saved ${OUTPUT}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
