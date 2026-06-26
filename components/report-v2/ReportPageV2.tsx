"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { ReportPageStates } from "@/components/report/ReportPageStates";
import { ShareReportDialog } from "@/components/report/ShareReportDialog";
import { useReportData } from "@/hooks/useReportData";
import { finalizeReportChecklist } from "@/lib/normalize-report-checklist";
import { normalizeReportCopyVariants } from "@/lib/normalize-report-copy-variants";
import { normalizeVisualSection } from "@/lib/report-visual-fixes";
import { sanitizeLlmVisibleText } from "@/lib/llm-placeholder-text";
import { formatReportDomain } from "@/lib/report-hero-theme";
import { resolveReportPreviewSrc } from "@/lib/report-preview-url";
import { openReportPrintExport } from "@/lib/report-export";
import type {
  AuditReport,
  ReportIssue,
  ReportChecklistItem,
  ChecklistCategory,
  ChecklistItemStatus,
} from "@/lib/audit-report";
import { ReportSourceRow } from "./ReportSourceRow";
import { ReportHero } from "./ReportHero";
import { ReportScorePanel } from "./ReportScorePanel";
import { ReportPriorityQueue } from "./ReportPriorityQueue";
import { ReportCopyStudioV2 } from "./ReportCopyStudioV2";
import { ReportVisualFixesGrid } from "./ReportVisualFixesGrid";
import { ReportTrustMetaPanel } from "./ReportTrustMetaPanel";
import { ReportMethodologyPanel } from "./ReportMethodologyPanel";
import { ReportExportV2 } from "./ReportExportV2";
import { ReportCtaBanner } from "./ReportCtaBanner";

const ISSUE_CATEGORY_MAP: Record<string, ChecklistCategory> = {
  missing_metadata: "structure",
  clarity: "copy",
  viewport_config: "structure",
  social_proof_placement: "trust",
  headline_clarity: "copy",
  cta: "copy",
  trust: "trust",
  friction: "structure",
  performance: "structure",
};

function adaptIssuesToChecklist(issues: ReportIssue[]): ReportChecklistItem[] {
  return issues.map((issue, i) => {
    const category: ChecklistCategory = ISSUE_CATEGORY_MAP[issue.category ?? ""] ?? "copy";

    const status: ChecklistItemStatus =
      issue.severity === "high" ? "missing" :
      issue.severity === "low" ? "weak" : "weak";

    const parts = [issue.why, issue.bullets?.join("\n")].filter(Boolean);
    const evidence = parts.length > 0 ? parts.join("\n\n") : undefined;

    return {
      id: `issue-${i}`,
      text: issue.title ?? "",
      evidence,
      status,
      link_to: null,
      category,
    };
  });
}

type Props = {
  routeParam: string;
  initialData?: AuditReport | null;
  isUnlocked?: boolean;
};

export function ReportPageV2({ routeParam, initialData = null, isUnlocked = false }: Props) {
  const { data, loadState } = useReportData(routeParam, initialData);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  function handleShare() {
    setShareUrl(window.location.href);
    setShareOpen(true);
  }

  function handleExport() {
    openReportPrintExport(routeParam);
  }

  const report = useMemo(() => {
    if (!data?.checklist?.length) return data;

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
            ?.map((n) => sanitizeLlmVisibleText(n))
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
      { copyVariants, meta, checklist }
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

  const previewSrc = resolveReportPreviewSrc(routeParam, data.previewImage);
  const domain = formatReportDomain(data.url);
  const effectiveChecklist: ReportChecklistItem[] = report.checklist?.length
    ? report.checklist
    : adaptIssuesToChecklist(report.issues ?? []);
  const hasNewLayout = effectiveChecklist.length > 0;

  return (
    <>
      <AppHeader />

      <main className="min-h-[calc(100dvh-68px)] bg-v2-surface px-4 pb-20 pt-8 text-v2-ink md:px-6 md:pt-[52px]">
        <div className="mx-auto flex w-full max-w-[920px] flex-col gap-7">
          <ReportSourceRow
            url={data.url}
            domain={domain}
            generatedAt={data.generatedAt}
            checklistCount={report.checklist?.length}
            previewSrc={previewSrc}
            onShare={handleShare}
            onExport={handleExport}
          />

          <ReportHero
            slot={report.hero_slot ?? null}
            report={report}
            domain={domain}
          />

          <ReportScorePanel
            score={report.score}
            scorePotential={report.score_potential}
            checklist={report.checklist}
          />

          {hasNewLayout && (
            <ReportPriorityQueue checklist={effectiveChecklist} />
          )}

          {report.copy_variants && (
            <ReportCopyStudioV2 copyVariants={report.copy_variants} />
          )}

          {(report.visual_fixes?.length || report.visual_passes?.length) ? (
            <ReportVisualFixesGrid
              fixes={report.visual_fixes ?? []}
              passes={report.visual_passes ?? []}
            />
          ) : null}

          {report.meta && (
            <ReportTrustMetaPanel meta={report.meta} />
          )}

          <ReportMethodologyPanel />

          {report.copy_variants && report.meta && (
            <ReportExportV2 onExport={handleExport} />
          )}

          <ReportCtaBanner />
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
