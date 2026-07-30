"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ReportCloseTheGap } from "@/components/report/ReportCloseTheGap";
import { ReportCopyStudioSection } from "@/components/report/ReportCopyStudioSection";
import { ReportCtaSection } from "@/components/report/ReportCtaSection";
import { ReportHeroSummary } from "@/components/report/ReportHeroSummary";
import { ReportPerformancePanel } from "@/components/report/ReportPerformancePanel";
import { ReportTrustMetaSection } from "@/components/report/ReportTrustMetaSection";
import { VisualFixes } from "@/components/report/VisualFixes";
import { ShareReportDialog } from "@/components/report/ShareReportDialog";
import { ReportPageStates } from "@/components/report/ReportPageStates";
import { REPORT_PAGE_CONTAINER_CLASS } from "@/components/report/reportStyles";
import type { AuditReport } from "@/lib/audit-report";
import { openReportPrintExport } from "@/lib/report-export";
import { resolveReportPreviewSrc } from "@/lib/report-preview-url";
import { useReportData } from "@/hooks/useReportData";

type ReportPageViewProps = {
  routeParam: string;
  initialData?: AuditReport | null;
  isUnlocked?: boolean;
  showUnlockedBanner?: boolean;
};

export function ReportPageView({
  routeParam,
  initialData = null,
  isUnlocked = false,
  showUnlockedBanner = false,
}: ReportPageViewProps) {
  const router = useRouter();
  const { data, loadState } = useReportData(routeParam, initialData);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  async function handleCopy(text: string, index: number) {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }

  function handleShare() {
    setShareUrl(window.location.href);
    setShareOpen(true);
  }

  function handleExport() {
    openReportPrintExport(routeParam);
  }

  function handleRerun() {
    router.push("/analyze");
  }

  if (loadState !== "ready" || !data) {
    return <ReportPageStates loadState={loadState} />;
  }

  const previewSrc = resolveReportPreviewSrc(routeParam, data.previewImage);

  return (
    <>
      <main className="min-h-[calc(100dvh-68px)] bg-white px-4 pt-4 pb-12 text-[var(--ink-primary)] md:px-6 md:pt-6">
        <div className={REPORT_PAGE_CONTAINER_CLASS}>
          <ReportHeroSummary
            url={data.url}
            generatedAt={data.generatedAt}
            score={data.score}
            verdict={data.verdict}
            summary={data.summary}
            previewImage={previewSrc}
            onShare={handleShare}
            onExport={handleExport}
          />

          {data.score_potential && (
            <ReportCloseTheGap
              score={data.score}
              scorePotential={data.score_potential}
              checklist={data.checklist}
            />
          )}

          <ReportCopyStudioSection
            copyVariants={data.copy_variants}
            headlineDirections={data.headline_directions}
            brandStage={data.brand_stage}
            copiedIndex={copiedIndex}
            onCopy={handleCopy}
          />

          <VisualFixes visualFixes={data.visual_fixes} visualPasses={data.visual_passes} />

          <ReportPerformancePanel
            metrics={data.performance_metrics}
            benchmark={data.benchmark}
          />

          <ReportTrustMetaSection meta={data.meta} checklist={data.checklist} />

          <div className="mt-12">
            <ReportCtaSection onRerun={handleRerun} onExport={handleExport} />
          </div>
        </div>
      </main>

      <ShareReportDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        shareUrl={shareUrl}
        shareContext={{
          url: data.url,
          score: data.score,
          verdict: data.verdict,
        }}
      />
    </>
  );
}
