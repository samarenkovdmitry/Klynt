"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RiDownloadLine, RiFilePdfLine, RiLock2Line, RiRefreshLine } from "@remixicon/react";

import { AppHeader } from "@/components/AppHeader";
import { ReportActionLayout } from "@/components/report/ReportActionLayout";
import { ReportChecklist } from "@/components/report/ReportChecklist";
import CopyStudio from "@/components/report/CopyStudio";
import ScorePotentialCompact from "@/components/report/ScorePotentialCompact";
import { VisualFixes } from "@/components/report/VisualFixes";
import { TrustMeta } from "@/components/report/TrustMeta";
import { ExportGrid } from "@/components/report/ExportGrid";
import { ReportHeroSummary } from "@/components/report/ReportHeroSummary";
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
  REPORT_PAGE_BG_CLASS,
  REPORT_PAGE_CONTAINER_CLASS,
  REPORT_PANEL_HEADER_CLASS,
  REPORT_PANEL_META_CLASS,
  REPORT_PANEL_TITLE_CLASS,
  REPORT_SURFACE_CARD_CLASS,
} from "@/components/report/reportStyles";
import type { AuditReport } from "@/lib/audit-report";
import { isDemoReportRouteParam } from "@/lib/report-route";
import { formatReportDomain } from "@/lib/report-hero-theme";
import { openReportPrintExport } from "@/lib/report-export";
import { resolveReportPreviewSrc } from "@/lib/report-preview-url";
import { useReportData } from "@/hooks/useReportData";
import { useWaitlistGateInView } from "@/hooks/useWaitlistGateInView";
import { buildCopyStudioContext } from "@/lib/copy-studio-context";
import {
  finalizeReportChecklist,
} from "@/lib/normalize-report-checklist";
import { normalizeReportCopyVariants } from "@/lib/normalize-report-copy-variants";
import { normalizeVisualSection } from "@/lib/report-visual-fixes";
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
  const ghostBtnClass =
    "inline-flex items-center gap-1.5 rounded-full border border-[rgba(6,28,47,0.10)] bg-white px-4 py-2 text-[14px] font-medium text-[#061C2F] transition-colors hover:border-[rgba(6,28,47,0.18)]";

  return (
    <div className="sticky bottom-0 z-40 -mx-4 mt-8 border-t border-[#EBEFF3] bg-white/95 px-4 py-3 backdrop-blur-sm md:-mx-6 md:px-6">
      <div className="flex items-center gap-4">
        <p className="hidden flex-1 text-[13px] text-[#7D8C99] sm:block">
          Shipped fixes? Re-run to update your score.
        </p>
        <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
          {onExport && (
            <button type="button" onClick={onExport} className={ghostBtnClass}>
              {exportLocked ? (
                <RiLock2Line size={14} aria-hidden />
              ) : (
                <RiFilePdfLine size={14} aria-hidden />
              )}
              Export PDF
            </button>
          )}
          <button type="button" onClick={onRerun} className={ghostBtnClass}>
            <RiRefreshLine size={14} aria-hidden />
            Re-run audit
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

    const finalized = finalizeReportChecklist(
      data.checklist,
      data.score,
      data.score_potential,
      {
        copyVariants: data.copy_variants,
        meta: data.meta,
        rawChecklist: data.checklist,
      }
    );
    const checklist = finalized.checklist;
    const visualSection = normalizeVisualSection(
      data.visual_fixes,
      data.visual_passes,
      checklist,
      undefined,
      data.score,
      data.checklist ?? undefined,
      data.breakdown
    );

    return {
      ...data,
      checklist,
      copy_variants: normalizeReportCopyVariants(data.copy_variants, data.brand_stage),
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
      score_potential: finalized.scorePotential,
      visual_fixes: visualSection.fixes,
      visual_passes: visualSection.passes,
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

  const previewSrc = resolveReportPreviewSrc(routeParam, data.previewImage);

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
          `min-h-[calc(100dvh-68px)] ${REPORT_PAGE_BG_CLASS} px-4 pt-4 text-[var(--ink-primary)] md:px-6 md:pt-6`,
          mainPaddingBottom,
        ].join(" ")}
      >
        <div className={REPORT_PAGE_CONTAINER_CLASS}>
          {hasNewLayout ? (
            <>
              <ReportHeroSummary
                url={report.url}
                generatedAt={report.generatedAt}
                score={report.score}
                verdict={report.verdict}
                summary={report.summary}
                risk={report.risk}
                breakdown={report.breakdown}
                confidence={report.confidence}
                keyObservation={report.key_observation}
                previewImage={previewSrc}
                metricObservations={report.metric_observations}
                issues={report.issues}
                onShare={handleShare}
                onExport={handleExport}
              />

              <ReportChecklist checklist={report.checklist!} />

              {report.copy_variants ? (
                <CopyStudio
                  copyVariants={report.copy_variants}
                  checklist={report.checklist}
                  context={buildCopyStudioContext(report)}
                  previewLocked={freemiumAccess.previewLocked}
                  onRequestProUpgrade={useFreemium ? openProModal : undefined}
                />
              ) : null}

              {report.score_potential ? (
                <ScorePotentialCompact
                  score={report.score}
                  scorePotential={report.score_potential}
                  checklist={report.checklist}
                  chipsLocked={freemiumAccess.previewLocked}
                  onRequestProUpgrade={useFreemium ? openProModal : undefined}
                />
              ) : null}

              <VisualFixes
                visualFixes={report.visual_fixes}
                visualPasses={report.visual_passes}
              />

              {report.meta ? (
                <TrustMeta
                  meta={report.meta}
                  checklist={report.checklist!}
                  metaCopyLocked={freemiumAccess.previewLocked}
                  onRequestProUpgrade={useFreemium ? openProModal : undefined}
                />
              ) : null}

              {report.copy_variants && report.meta ? (
                <section className="mt-12 scroll-mt-24">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 className="flex items-center gap-2 text-[20px] font-semibold leading-7 tracking-[-0.02em] text-[#061C2F]">
                      <RiDownloadLine size={20} className="text-[#7D8C99]" aria-hidden />
                      Export
                      {freemiumAccess.exportLocked ? <FreemiumProBadge /> : null}
                    </h2>
                    <span className="text-[14px] text-[#7D8C99]">take this to your team</span>
                  </div>
                  <div className={REPORT_SURFACE_CARD_CLASS}>
                    <div className={REPORT_PANEL_HEADER_CLASS}>
                      <div className={REPORT_PANEL_TITLE_CLASS}>
                        <RiDownloadLine size={20} className="text-[#7D8C99]" aria-hidden />
                        Shareable outputs
                      </div>
                      <span className={REPORT_PANEL_META_CLASS}>PDF · decks · briefs</span>
                    </div>
                    <ExportGrid
                      copyVariants={report.copy_variants}
                      meta={report.meta}
                      checklist={report.checklist}
                      visualFixes={report.visual_fixes}
                      locked={freemiumAccess.exportLocked}
                      onRequestProUpgrade={useFreemium ? openProModal : undefined}
                    />
                  </div>
                </section>
              ) : null}

              <StickyBottomBar
                onExport={handleExport}
                onRerun={handleRerun}
                exportLocked={freemiumAccess.exportLocked}
              />
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
