"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ReportCopySection } from "@/components/report/ReportCopySection";
import { ReportCtaSection } from "@/components/report/ReportCtaSection";
import { ReportHeroSummary } from "@/components/report/ReportHeroSummary";
import { ShareReportDialog } from "@/components/report/ShareReportDialog";
import { ReportPageStates } from "@/components/report/ReportPageStates";
import { ReportSuggestionsSection } from "@/components/report/ReportSuggestionsSection";
import { ReportUxIssuesSection } from "@/components/report/ReportUxIssuesSection";
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

  const issues = data.issues ?? [];
  const suggestions = data.suggestions ?? [];
  const copy = data.copy ?? [];
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
            risk={data.risk}
            breakdown={data.breakdown}
            confidence={data.confidence}
            keyObservation={data.key_observation}
            previewImage={previewSrc}
            metricObservations={data.metric_observations}
            issues={data.issues}
            onShare={handleShare}
            onExport={handleExport}
          />

          <div className="space-y-0">
            <ReportUxIssuesSection issues={issues} breakdown={data.breakdown} />

            <ReportSuggestionsSection suggestions={suggestions} />
            <ReportCopySection
              copy={copy}
              headlineDirections={data.headline_directions}
              brandStage={data.brand_stage}
              copiedIndex={copiedIndex}
              onCopy={handleCopy}
            />
          </div>

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
