"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { ReportCopySection } from "@/components/report/ReportCopySection";
import { ReportCtaSection } from "@/components/report/ReportCtaSection";
import { ReportHeader } from "@/components/report/ReportHeader";
import { ReportPageStates } from "@/components/report/ReportPageStates";
import { ReportSuggestionsSection } from "@/components/report/ReportSuggestionsSection";
import { ReportSummary } from "@/components/report/ReportSummary";
import { ReportUxIssuesSection } from "@/components/report/ReportUxIssuesSection";
import { usePreLaunchWaitlist } from "@/components/pre-launch/usePreLaunchWaitlist";
import { DEMO_REPORT_ID } from "@/lib/demo-report";
import { useReportData } from "@/hooks/useReportData";

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data, loadState } = useReportData(reportId);
  const { hydrated, unlocked, waitlistActive, unlock } = usePreLaunchWaitlist(
    reportId === DEMO_REPORT_ID
  );
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCopy(text: string, index: number) {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title: "Klynt UX Report",
        url,
      });
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleExport() {
    window.print();
  }

  function handleRerun() {
    router.push("/analyze");
  }

  if (loadState !== "ready" || !data || !hydrated) {
    return <ReportPageStates loadState={loadState === "ready" && !hydrated ? "loading" : loadState} />;
  }

  return (
    <>
      <AppHeader />

      <main className="min-h-[calc(100dvh-68px)] bg-[#F5F7FA] px-4 pb-12 pt-4 text-[var(--ink-primary)] md:px-6 md:pt-6">
        <div className="mx-auto max-w-[1040px]">
          <div className="overflow-hidden rounded-[28px] border border-[var(--stroke-light)] bg-white md:rounded-[36px]">
            <ReportHeader
              url={data.url}
              generatedAt={data.generatedAt}
              copied={copied}
              onExport={handleExport}
              onShare={handleShare}
            />

            <ReportSummary
              score={data.score}
              verdict={data.verdict}
              summary={data.summary}
              risk={data.risk}
              breakdown={data.breakdown}
              confidence={data.confidence}
              keyObservation={data.key_observation}
            />
          </div>

          <div className="mt-8 space-y-8">
            <ReportUxIssuesSection issues={data.issues} />
            <ReportSuggestionsSection
              suggestions={data.suggestions}
              reportId={reportId}
              waitlistActive={waitlistActive}
              onWaitlistUnlock={unlock}
            />
            {unlocked && (
              <ReportCopySection
                copy={data.copy}
                copiedIndex={copiedIndex}
                onCopy={handleCopy}
              />
            )}
            {!waitlistActive && (
              <ReportCtaSection onRerun={handleRerun} onExport={handleExport} />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
