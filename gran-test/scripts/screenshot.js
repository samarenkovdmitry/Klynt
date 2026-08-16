const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const chrome =
  process.env.CHROME ||
  "/usr/bin/google-chrome-stable";

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "exports");
fs.mkdirSync(outDir, { recursive: true });

async function shot(file, width, name) {
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--hide-scrollbars",
      "--font-render-hinting=none",
    ],
  });
  const page = await browser.newPage();
  await page.setViewport({ width, height: 800, deviceScaleFactor: 1 });
  const url = "file://" + path.join(root, file);
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1200));
  const out = path.join(outDir, name);
  await page.screenshot({ path: out, fullPage: true, type: "png" });
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log(name, width + "x" + h, "->", out);
  await browser.close();
}

(async () => {
  await shot("desktop-wireframe.html", 1920, "01-desktop-wireframe.png");
  await shot("mobile-home.html", 390, "02-mobile-home.png");
  await shot("v2-desktop-wireframe.html", 1920, "03-v2-desktop-wireframe.png");
  await shot("v2-mobile.html", 390, "04-v2-mobile.png");
  await shot("v2-logos.html", 1200, "05-v2-logos.png");
  await shot("v3-desktop-wireframe.html", 1920, "06-v3-desktop-wireframe.png");
  await shot("v3-mobile.html", 390, "07-v3-mobile.png");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
