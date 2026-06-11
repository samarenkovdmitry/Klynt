"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RiArrowRightLine, RiDownloadLine, RiFilePdfLine, RiRefreshLine } from "@remixicon/react";

import { AppHeader } from "@/components/AppHeader";
import { ReportActionLayout } from "@/components/report/ReportActionLayout";
import { ReportChecklist } from "@/components/report/ReportChecklist";
import CopyStudio from "@/components/report/CopyStudio";
import ScorePotentialCompact from "@/components/report/ScorePotentialCompact";
import { VisualFixes } from "@/components/report/VisualFixes";
import { TrustMeta } from "@/components/report/TrustMeta";
import { ExportGrid } from "@/components/report/ExportGrid";
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
import { buildCopyStudioContext } from "@/lib/copy-studio-context";
import {
  normalizeReportChecklist,
  normalizeScorePotential,
} from "@/lib/normalize-report-checklist";

type ReportPageViewProps = {
  routeParam: string;
  initialData?: AuditReport | null;
};

function StickyBottomBar({
  onExport,
  onRerun,
}: {
  onExport?: () => void;
  onRerun: () => void;
}) {
  const btnClass =
    "inline-flex items-center gap-1.5 rounded-[8px] bg-black/[0.05] px-[13px] py-1.5 text-[13px] font-medium text-[#555] transition-colors hover:bg-black/[0.08]";

  return (
    <div className="sticky bottom-0 z-40 mt-3 border-t border-black/[0.07] bg-[#EFEFED]/92 py-3 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <p className="hidden flex-1 text-[13px] text-[#888] sm:block">
          Applied changes? Re-run to track your score.
        </p>
        <div className="flex items-center gap-2 sm:ml-auto">
          {onExport && (
            <button type="button" onClick={onExport} className={btnClass}>
              <RiFilePdfLine size={14} aria-hidden />
              Export PDF
            </button>
          )}
          <button
            type="button"
            onClick={onRerun}
            className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#111] px-[15px] py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#2a2a2a]"
          >
            <RiRefreshLine size={14} aria-hidden />
            Re-run audit
            <RiArrowRightLine size={14} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

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

  const report = useMemo(() => {
    if (!data?.checklist?.length) {
      return data;
    }

    const checklist = normalizeReportChecklist(data.checklist);

    return {
      ...data,
      checklist,
      score_potential: data.score_potential
        ? normalizeScorePotential(data.score_potential, checklist)
        : data.score_potential,
    };
  }, [data]);

  if (loadState !== "ready" || !data || !report) {
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

  const hasNewLayout = Array.isArray(report.checklist) && report.checklist.length > 0;

  return (
    <>
      <AppHeader />

      <main
        className={[
          "min-h-[calc(100dvh-50px)] bg-[#EBEBEB] px-4 pt-6 text-[#111] md:px-8 md:pt-6",
          hasNewLayout && !waitlistActive
            ? "pb-8"
            : waitlistActive && !gateInView
              ? "pb-24 md:pb-20"
              : "pb-20",
        ].join(" ")}
      >
        <div className={REPORT_PAGE_CONTAINER_CLASS}>
          {hasNewLayout ? (
            <>
              {/* Health bar — score + verdict + metric dimensions */}
              <ReportActionLayout
                data={report}
                routeParam={routeParam}
                waitlistActive={waitlistActive}
                copiedIndex={copiedIndex}
                lockedSummary={lockedSummary}
                heroOnly={true}
                onCopy={handleCopy}
                onShare={handleShare}
                onExport={handleExport}
                onRerun={handleRerun}
                onUnlock={unlock}
              />

              {/* ReportChecklist */}
              <ReportChecklist checklist={report.checklist!} />

              {/* CopyStudio + ScorePotentialCompact — grouped */}
              <div className="mt-3">
                {report.copy_variants && (
                  <CopyStudio
                    copyVariants={report.copy_variants}
                    checklist={report.checklist}
                    context={buildCopyStudioContext(report)}
                  />
                )}
                {report.score_potential && (
                  <ScorePotentialCompact
                    score={report.score}
                    scorePotential={report.score_potential}
                    checklist={report.checklist}
                  />
                )}
              </div>

              {/* VisualFixes */}
              <VisualFixes checklist={report.checklist} />

              {/* TrustMeta */}
              {report.meta && (
                <TrustMeta
                  meta={report.meta}
                  checklist={report.checklist!}
                />
              )}

              {/* ExportGrid */}
              {report.copy_variants && report.meta && (
                <div className="mt-2.5 overflow-hidden rounded-[16px] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.04),0_4px_20px_rgba(0,0,0,0.07)]">
                  <div className="flex items-center justify-between px-5 pb-[10px] pt-[14px]">
                    <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.07em] text-[#999]">
                      <RiDownloadLine size={14} aria-hidden />
                      Export
                    </span>
                    <span className="text-[12px] text-[#C0C0BC]">take this to your team</span>
                  </div>
                  <ExportGrid
                    copyVariants={report.copy_variants}
                    meta={report.meta}
                    checklist={report.checklist}
                  />
                </div>
              )}

              {hasNewLayout && !waitlistActive && (
                <StickyBottomBar onExport={handleExport} onRerun={handleRerun} />
              )}
            </>
          ) : (
            /* Backward compat: old reports without checklist use the previous layout */
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
          )}
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
