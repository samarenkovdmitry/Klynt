import type {
  AudienceType,
  AuditReport,
  BrandStage,
  TrafficSource,
} from "@/lib/audit-report";
import { requestAuditAnalysis } from "@/lib/analyze-openai";
import { buildFullAuditPrompt } from "@/lib/analyze-prompts";
import { normalizeFullAuditJson } from "@/lib/analyze-normalize";
import { scheduleReportOgBackfill } from "@/lib/report-og-backfill";
import { updateReportInDb } from "@/lib/reports-db";

export type FullAnalyzeBackfillParams = {
  reportId: string;
  auditedUrl: string;
  url: string;
  screenshotsBase64: string[];
  brandStage: BrandStage;
  trafficSource: TrafficSource;
  audienceType: AudienceType;
  previewImage?: string;
  generatedAt: string;
};

async function runFullAnalyzeBackfill(params: FullAnalyzeBackfillParams) {
  const basePrompt = buildFullAuditPrompt(
    params.brandStage,
    params.trafficSource,
    params.audienceType
  );

  const raw = await requestAuditAnalysis({
    basePrompt,
    url: params.url,
    screenshotsBase64: params.screenshotsBase64,
  });

  const report = normalizeFullAuditJson(raw, {
    url: params.auditedUrl,
    brandStage: params.brandStage,
    trafficSource: params.trafficSource,
    audienceType: params.audienceType,
    previewImage: params.previewImage,
    generatedAt: params.generatedAt,
  });

  await updateReportInDb(params.reportId, report);
  scheduleReportOgBackfill(params.reportId, report, params.previewImage);

  return report;
}

export function scheduleFullAnalyzeBackfill(params: FullAnalyzeBackfillParams) {
  const task = runFullAnalyzeBackfill(params).catch((error) => {
    console.error("[analyze] Full report backfill failed:", error);
  });

  void (async () => {
    try {
      const { waitUntil } = await import("@vercel/functions");
      waitUntil(task);
    } catch {
      void task;
    }
  })();
}
