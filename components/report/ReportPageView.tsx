"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RiArrowRightLine, RiDownloadLine, RiFilePdfLine, RiLock2Line, RiRefreshLine } from "@remixicon/react";

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
import { FreemiumProModal } from "@/components/report/FreemiumProModal";
import { FreemiumProStickyBar } from "@/components/report/FreemiumProStickyBar";
import { FreemiumProBadge } from "@/components/report/FreemiumProBadge";
import { usePreLaunchWaitlist } from "@/components/pre-launch/usePreLaunchWaitlist";
import { useFreemiumAccess } from "@/hooks/useFreemiumAccess";
import { isFreemiumEnabled, type ProUpgradeTrigger } from "@/lib/freemium";
import {
  REPORT_PAGE_CONTAINER_CLASS,
  WORKSPACE_BG_CLASS,
} from "@/components/report/reportStyles";
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
import { normalizeReportCopyVariants } from "@/lib/normalize-report-copy-variants";
import { sanitizeLlmVisibleText } from "@/lib/llm-placeholder-text";

type ReportPageViewProps = {
  routeParam: string;
  initialData?: AuditReport | null;
};

function StickyBottomBar({
  onExport,
  onRerun,
  exportLocked = false,
}: {
  onExport?: () => void;
  onRerun: () => void;
  exportLocked?: boolean;
}) {
  const btnClass =
    "inline-flex items-center gap-1.5 rounded-[8px] bg-black/[0.05] px-[13px] py-1.5 text-[13px] font-medium text-[#555] transition-colors hover:bg-black/[0.08]";

  return (
    <div
      className={`sticky bottom-0 z-40 -mx-4 mt-3 border-t border-black/[0.07] px-4 py-3 backdrop-blur-md md:-mx-8 md:px-8 ${WORKSPACE_BG_CLASS}/92`}
    >
      <div className="flex items-center gap-4">
        <p className="hidden flex-1 text-[13px] text-[#888] sm:block">
          Applied changes? Re-run to track your score.
        </p>
        <div className="flex items-center gap-2 sm:ml-auto">
          {onExport && (
            <button type="button" onClick={onExport} className={btnClass}>
              {exportLocked ? (
                <RiLock2Line size={14} aria-hidden />
              ) : (
                <RiFilePdfLine size={14} aria-hidden />
              )}
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
  const isDemo = isDemoReportRouteParam(routeParam);
  const { waitlistActive, unlock } = usePreLaunchWaitlist(isDemo);
  const freemiumAccess = useFreemiumAccess(isDemo);
  const gateInView = useWaitlistGateInView(waitlistActive && !freemiumAccess.active);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [proModalOpen, setProModalOpen] = useState(false);
  const [proModalTrigger, setProModalTrigger] = useState<ProUpgradeTrigger | undefined>();

  const openProModal = useCallback((trigger?: ProUpgradeTrigger) => {
    setProModalTrigger(trigger);
    setProModalOpen(true);
  }, []);

  const closeProModal = useCallback(() => {
    setProModalOpen(false);
  }, []);

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
    if (freemiumAccess.exportLocked) {
      openProModal("export-pdf");
      return;
    }

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
      copy_variants: normalizeReportCopyVariants(data.copy_variants),
      meta: data.meta
        ? {
            ...data.meta,
            title_suggestion: sanitizeLlmVisibleText(data.meta.title_suggestion),
            description_suggestion: sanitizeLlmVisibleText(data.meta.description_suggestion),
            proof_suggestion: data.meta.proof_suggestion
              ? sanitizeLlmVisibleText(data.meta.proof_suggestion)
              : data.meta.proof_suggestion,
            trust_notes: data.meta.trust_notes
              ?.map((note) => sanitizeLlmVisibleText(note))
              .filter(Boolean),
          }
        : data.meta,
      score_potential: normalizeScorePotential(
        data.score_potential,
        checklist,
        data.score
      ),
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
  const useFreemium = hasNewLayout && isFreemiumEnabled() && freemiumAccess.active;
  const showLegacyWaitlist = waitlistActive && !useFreemium;

  const mainPaddingBottom =
    useFreemium || (showLegacyWaitlist && !gateInView)
      ? "pb-24 md:pb-20"
      : hasNewLayout
        ? "pb-8"
        : "pb-20";

  return (
    <>
      <AppHeader />

      <main
        className={[
          `min-h-[calc(100dvh-50px)] ${WORKSPACE_BG_CLASS} px-4 pt-6 text-[#111] md:px-8 md:pt-6`,
          mainPaddingBottom,
        ].join(" ")}
      >
        <div className={REPORT_PAGE_CONTAINER_CLASS}>
          {hasNewLayout ? (
            <>
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

              <ReportChecklist checklist={report.checklist!} />

              <div className="mt-3">
                {report.copy_variants && (
                  <CopyStudio
                    copyVariants={report.copy_variants}
                    checklist={report.checklist}
                    context={buildCopyStudioContext(report)}
                    previewLocked={freemiumAccess.previewLocked}
                    onRequestProUpgrade={useFreemium ? openProModal : undefined}
                  />
                )}
                {report.score_potential && (
                  <ScorePotentialCompact
                    score={report.score}
                    scorePotential={report.score_potential}
                    checklist={report.checklist}
                    chipsLocked={freemiumAccess.previewLocked}
                    onRequestProUpgrade={useFreemium ? openProModal : undefined}
                  />
                )}
              </div>

              <VisualFixes checklist={report.checklist} />

              {report.meta && (
                <TrustMeta
                  meta={report.meta}
                  checklist={report.checklist!}
                  metaCopyLocked={freemiumAccess.previewLocked}
                  onRequestProUpgrade={useFreemium ? openProModal : undefined}
                />
              )}

              {report.copy_variants && report.meta && (
                <div className="mt-2.5 overflow-hidden rounded-[16px] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.04),0_4px_20px_rgba(0,0,0,0.07)]">
                  <div className="flex items-center justify-between px-5 pb-[10px] pt-[14px]">
                    <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.07em] text-[#999]">
                      <RiDownloadLine size={14} aria-hidden />
                      Export
                      {freemiumAccess.exportLocked ? (
                        <FreemiumProBadge className="normal-case tracking-normal" />
                      ) : null}
                    </span>
                    <span className="text-[12px] text-[#C0C0BC]">take this to your team</span>
                  </div>
                  <ExportGrid
                    copyVariants={report.copy_variants}
                    meta={report.meta}
                    checklist={report.checklist}
                    locked={freemiumAccess.exportLocked}
                    onRequestProUpgrade={useFreemium ? openProModal : undefined}
                  />
                </div>
              )}

              {hasNewLayout && (
                <StickyBottomBar
                  onExport={handleExport}
                  onRerun={handleRerun}
                  exportLocked={freemiumAccess.exportLocked}
                />
              )}
            </>
          ) : (
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

      {showLegacyWaitlist && <ReportWaitlistStickyBar visible={!gateInView} />}
      {useFreemium && (
        <FreemiumProStickyBar onOpen={() => openProModal("sticky-bar")} />
      )}

      {useFreemium && (
        <FreemiumProModal
          open={proModalOpen}
          onClose={closeProModal}
          reportId={routeParam}
          trigger={proModalTrigger}
          onJoined={freemiumAccess.markWaitlistJoined}
        />
      )}

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
