import { extractPageData, isExtractionEmpty } from "@/lib/analysis/extraction";
import type { PageData, StoredCompetitorSnapshot } from "@/lib/analysis/extraction";
import { applyDomGroundTruth } from "@/lib/analysis/report-enrichment";
import { captureWebsiteScreenshots } from "@/lib/capture-website-screenshots";
import { buildReportPreviewImage } from "@/lib/report-preview";

export async function captureCompetitorSnapshot(
  competitorUrl: string
): Promise<StoredCompetitorSnapshot | null> {
  const captureResult = await captureWebsiteScreenshots(competitorUrl, {
    mobile: true,
    lower: false,
    performance: false,
  });

  const rawHeroBase64 = captureResult.screenshots[0];
  if (!rawHeroBase64) {
    return null;
  }

  const pageData: PageData = {
    url: competitorUrl,
    html: captureResult.bodyText,
    screenshot: rawHeroBase64,
    meta: {
      title: captureResult.pageMeta.title,
      description: captureResult.pageMeta.description,
    },
    puppeteerExtracted: {
      ctaText: captureResult.computedValues?.cta_text
        ? [captureResult.computedValues.cta_text]
        : [],
      headlineText: captureResult.computedValues?.h1_text ?? "",
      subheadlineText: captureResult.computedValues?.sub_text ?? "",
      socialProofAboveFold: captureResult.computedValues?.social_proof_above_fold ?? false,
      loadTimeMs: 0,
      mobileViewportWidth: captureResult.pageMeta.hasMobileViewportMeta ? 390 : 0,
    },
  };

  const { result: extraction } = await extractPageData(pageData);
  const enrichedExtraction = applyDomGroundTruth(
    extraction,
    captureResult.computedValues,
    captureResult.pageMeta
  );

  if (isExtractionEmpty(enrichedExtraction)) {
    return null;
  }

  const previewImage = await buildReportPreviewImage(rawHeroBase64);

  return {
    url: competitorUrl,
    extraction: enrichedExtraction,
    computed_values: captureResult.computedValues,
    mobile_computed_values: captureResult.mobileComputedValues,
    previewImage,
    page_meta: captureResult.pageMeta,
  };
}
