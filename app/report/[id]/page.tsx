"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { ReportCopySection } from "@/components/report/ReportCopySection";
import { ReportCtaSection } from "@/components/report/ReportCtaSection";
import { ReportHeroSummary } from "@/components/report/ReportHeroSummary";
import { ReportLockedSectionsPreview } from "@/components/report/ReportLockedSectionsPreview";
import { ShareReportDialog } from "@/components/report/ShareReportDialog";
import { ReportPageStates } from "@/components/report/ReportPageStates";
import { ReportSuggestionsSection } from "@/components/report/ReportSuggestionsSection";
import { ReportUxIssuesSection } from "@/components/report/ReportUxIssuesSection";
import { ReportWaitlistGate } from "@/components/report/ReportWaitlistGate";
import { ReportWaitlistPreviewBanner } from "@/components/report/ReportWaitlistPreviewBanner";
import { ReportWaitlistStickyBar } from "@/components/report/ReportWaitlistStickyBar";
import { usePreLaunchWaitlist } from "@/components/pre-launch/usePreLaunchWaitlist";
import { REPORT_PAGE_CONTAINER_CLASS } from "@/components/report/reportStyles";
import { DEMO_REPORT_ID } from "@/lib/demo-report";
import { formatReportDomain } from "@/lib/report-hero-theme";
import { useReportData } from "@/hooks/useReportData";

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data, loadState } = useReportData(reportId);
  const { waitlistActive, unlock } = usePreLaunchWaitlist(
    reportId === DEMO_REPORT_ID
  );
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
    window.print();
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
  const lockedSummary = {
    domain: formatReportDomain(data.url),
    remainingIssues: Math.max(0, issues.length - 1),
    remainingSuggestions: Math.max(0, suggestions.length - 1),
    remainingCopy: Math.max(0, copy.length - 1),
  };

  return (
    <>
      <AppHeader />

      <main
        className={[
          "min-h-[calc(100dvh-68px)] bg-white px-4 pt-4 text-[var(--ink-primary)] md:px-6 md:pt-6",
          waitlistActive ? "pb-24 md:pb-12" : "pb-12",
        ].join(" ")}
      >
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
            previewImage={data.previewImage}
            metricObservations={data.metric_observations}
            issues={data.issues}
            onShare={handleShare}
            onExport={handleExport}
          />

          <div className="space-y-0">
            <ReportUxIssuesSection issues={issues} waitlistActive={waitlistActive} />

            {waitlistActive && reportId ? (
              <>
                <ReportWaitlistPreviewBanner locked={lockedSummary} />
                <ReportWaitlistGate
                  reportId={reportId}
                  locked={lockedSummary}
                  onUnlock={unlock}
                />
                <ReportLockedSectionsPreview
                  remainingSuggestions={lockedSummary.remainingSuggestions}
                  remainingCopy={lockedSummary.remainingCopy}
                />
              </>
            ) : (
              <>
                <ReportSuggestionsSection suggestions={suggestions} />
                <ReportCopySection
                  copy={copy}
                  copiedIndex={copiedIndex}
                  onCopy={handleCopy}
                />
              </>
            )}
          </div>

          {!waitlistActive && (
            <div className="mt-12">
              <ReportCtaSection onRerun={handleRerun} onExport={handleExport} />
            </div>
          )}
        </div>
      </main>

      {waitlistActive && <ReportWaitlistStickyBar />}

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
