"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RiDownloadLine, RiVipCrownFill } from "@remixicon/react";


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
import { ReportRerunBanner } from "@/components/report/ReportRerunBanner";
import { FreemiumProModal } from "@/components/report/FreemiumProModal";
import { FreemiumProStickyBar } from "@/components/report/FreemiumProStickyBar";
import { usePreLaunchWaitlist } from "@/components/pre-launch/usePreLaunchWaitlist";
import { useFreemiumAccess } from "@/hooks/useFreemiumAccess";
import { isFreemiumEnabled, type ProUpgradeTrigger } from "@/lib/freemium";
import {
  REPORT_PAGE_BG_CLASS,
  REPORT_PAGE_CONTAINER_CLASS,
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
  /** Actual DB report ID (not slug). Used for checkout URL. */
  reportId?: string | null;
  /** True when reports.unlocked_at is set (server-verified payment). */
  isUnlocked?: boolean;
  /** True when returning from Lemon Squeezy after successful payment. */
  showUnlockedBanner?: boolean;
};


export function ReportPageView({
  routeParam,
  initialData = null,
  reportId = null,
  isUnlocked = false,
  showUnlockedBanner = false,
}: ReportPageViewProps) {
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
    if (freemiumAccess.exportLocked && !isUnlocked) {
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
    const copyVariants = normalizeReportCopyVariants(data.copy_variants, data.brand_stage);
    const meta = data.meta
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
      : data.meta;
    const visualSection = normalizeVisualSection(
      data.visual_fixes,
      data.visual_passes,
      checklist,
      undefined,
      data.score,
      data.checklist ?? undefined,
      data.breakdown,
      {
        copyVariants,
        meta,
        checklist,
      }
    );

    return {
      ...data,
      checklist,
      copy_variants: copyVariants,
      meta,
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

  const criticalCount = report.checklist
    ? report.checklist.filter((item) => item.status !== "pass").length
    : undefined;
  const missingCount = report.checklist
    ? report.checklist.filter((item) => item.status === "missing").length
    : undefined;
  const weakCount = report.checklist
    ? report.checklist.filter((item) => item.status === "weak").length
    : undefined;

  const hasNewLayout = Array.isArray(report.checklist) && report.checklist.length > 0;
  const useFreemium = hasNewLayout && isFreemiumEnabled() && freemiumAccess.active && !isUnlocked;
  const showLegacyWaitlist = waitlistActive && !useFreemium;

  const mainPaddingBottom =
    useFreemium || (showLegacyWaitlist && !gateInView)
      ? "pb-[152px] md:pb-[148px]"
      : hasNewLayout
      ? "pb-8 md:pb-10"
      : "pb-[112px]";

  return (
    <>
      <AppHeader />

      {showUnlockedBanner && (
        <div className="flex items-center justify-center gap-2 bg-emerald-600 px-4 py-3 text-[14px] font-medium text-white">
          <span aria-hidden>✓</span>
          Payment successful. Your full report is unlocked.
        </div>
      )}

      <main
        className={[
          `min-h-[calc(100dvh-68px)] ${REPORT_PAGE_BG_CLASS} px-4 pt-[20px] text-[var(--ink-primary)] md:px-6 md:pt-[44px]`,
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
                criticalCount={criticalCount}
                missingCount={missingCount}
                weakCount={weakCount}
                scorePotential={report.score_potential?.target}
                onShare={handleShare}
                onExport={handleExport}
              />

              <ReportChecklist checklist={report.checklist!} />

              {report.copy_variants ? (
                <CopyStudio
                  copyVariants={report.copy_variants}
                  checklist={report.checklist}
                  context={buildCopyStudioContext(report)}
                  previewLocked={freemiumAccess.previewLocked && !isUnlocked}
                  onRequestProUpgrade={useFreemium ? openProModal : undefined}
                />
              ) : null}

              {report.score_potential ? (
                <ScorePotentialCompact
                  score={report.score}
                  scorePotential={report.score_potential}
                  checklist={report.checklist}
                  chipsLocked={freemiumAccess.previewLocked && !isUnlocked}
                  onRequestProUpgrade={useFreemium ? openProModal : undefined}
                />
              ) : null}

              <VisualFixes
                visualFixes={report.visual_fixes}
                visualPasses={report.visual_passes}
                isDemo={isDemo}
              />

              {report.meta ? (
                <TrustMeta
                  meta={report.meta}
                  checklist={report.checklist!}
                  metaCopyLocked={freemiumAccess.previewLocked && !isUnlocked}
                  onRequestProUpgrade={useFreemium ? openProModal : undefined}
                />
              ) : null}

              {report.copy_variants && report.meta ? (
                <section className="mt-8 scroll-mt-24 md:mt-12 overflow-hidden rounded-[14px] border border-[#e6e9ef] bg-white" id="export">
                  {/* Header band */}
                  <div className="flex items-center gap-2 border-b border-[#eef1f5] bg-[#fafbfc] px-6 py-[18px]">
                    <div
                      className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-[#eef1f6]"
                      aria-hidden
                    >
                      <RiDownloadLine size={18} className="text-[#5B6378]" />
                    </div>
                    <span className="text-[20px] font-semibold leading-7 tracking-[-0.02em] text-[#061C2F]">
                      Export
                    </span>
                    <div className="ml-auto flex items-center gap-2.5">
                      <span className="hidden text-[14px] text-[#8E99A2] sm:inline">take this to your team</span>
                      {!isDemo && (
                        <>
                          <span className="hidden h-6 w-px bg-[#D0D5DA] sm:inline-block" aria-hidden />
                          <span className="text-[14px] text-[#8E99A2]">Available in</span>
                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold text-white [background:linear-gradient(to_top_right,#18181B,#373473,#201F32)]">
                            <RiVipCrownFill size={12} aria-hidden />
                            PRO
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <ExportGrid
                    copyVariants={report.copy_variants}
                    meta={report.meta}
                    checklist={report.checklist}
                    visualFixes={report.visual_fixes}
                    locked={freemiumAccess.exportLocked && !isUnlocked}
                    onRequestProUpgrade={useFreemium ? openProModal : undefined}
                  />
                </section>
              ) : null}

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

      {hasNewLayout && (
        <div className={`${REPORT_PAGE_BG_CLASS} px-4 pb-20 md:px-6`}>
          <div className={REPORT_PAGE_CONTAINER_CLASS}>
            <ReportRerunBanner onRerun={handleRerun} onShare={handleShare} />
          </div>
        </div>
      )}

      {showLegacyWaitlist && <ReportWaitlistStickyBar visible={!gateInView} />}
      {useFreemium && (
        <FreemiumProStickyBar onOpen={() => openProModal("sticky-bar")} />
      )}

      {useFreemium && (
        <FreemiumProModal
          open={proModalOpen}
          onClose={closeProModal}
          reportId={reportId ?? routeParam}
          trigger={proModalTrigger}
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
