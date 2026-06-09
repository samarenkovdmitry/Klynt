"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AppHeader } from "@/components/AppHeader";
import { ReportActionLayout } from "@/components/report/ReportActionLayout";
import { ShareReportDialog } from "@/components/report/ShareReportDialog";
import { ReportPageStates } from "@/components/report/ReportPageStates";
import { ReportWaitlistStickyBar } from "@/components/report/ReportWaitlistStickyBar";
import { usePreLaunchWaitlist } from "@/components/pre-launch/usePreLaunchWaitlist";
import { REPORT_PAGE_CONTAINER_CLASS } from "@/components/report/reportStyles";
import type { AuditReport } from "@/lib/audit-report";
import { isDemoReportRouteParam } from "@/lib/report-route";
import { formatReportDomain } from "@/lib/report-hero-theme";
import { openReportPrintExport } from "@/lib/report-export";
import { useReportData } from "@/hooks/useReportData";
import { useWaitlistGateInView } from "@/hooks/useWaitlistGateInView";

type ReportPageViewProps = {
  routeParam: string;
  initialData?: AuditReport | null;
};

export function ReportPageView({ routeParam, initialData = null }: ReportPageViewProps) {
  const router = useRouter();
  const { data, loadState } = useReportData(routeParam, initialData);
  const { waitlistActive, unlock } = usePreLaunchWaitlist(
    isDemoReportRouteParam(routeParam)
  );
  const gateInView = useWaitlistGateInView(waitlistActive);
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
          waitlistActive && !gateInView ? "pb-24 md:pb-12" : "pb-12",
        ].join(" ")}
      >
        <div className={REPORT_PAGE_CONTAINER_CLASS}>
          <ReportActionLayout
            data={data}
            routeParam={routeParam}
            waitlistActive={waitlistActive}
            copiedIndex={copiedIndex}
            lockedSummary={lockedSummary}
            onCopy={handleCopy}
            onShare={handleShare}
            onExport={handleExport}
            onRerun={handleRerun}
            onUnlock={unlock}
          />
        </div>
      </main>

      {waitlistActive && <ReportWaitlistStickyBar visible={!gateInView} />}

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
