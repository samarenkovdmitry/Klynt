import { captureWebsiteScreenshots } from "../lib/capture-website-screenshots";

const url = process.argv[2] ?? "https://pipedrive.com";

async function main() {
  console.log(`Capturing ${url}...`);
  const result = await captureWebsiteScreenshots(url);
  const cv = result.computedValues;

  console.log(
    JSON.stringify(
      {
        url,
        h1_text: cv?.h1_text ?? null,
        sub_text: cv?.sub_text ?? null,
        cta_text: cv?.cta_text ?? null,
        nav_link_labels: cv?.nav_link_labels?.slice(0, 8) ?? [],
        page_title: result.pageMeta.title,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
