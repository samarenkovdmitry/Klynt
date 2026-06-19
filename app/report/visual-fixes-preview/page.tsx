"use client";

import { AppHeader } from "@/components/AppHeader";
import { ReportHeroSummary } from "@/components/report/ReportHeroSummary";
import { ReportChecklist } from "@/components/report/ReportChecklist";
import CopyStudio from "@/components/report/CopyStudio";
import ScorePotentialCompact from "@/components/report/ScorePotentialCompact";
import { VisualFixes } from "@/components/report/VisualFixes";
import { TrustMeta } from "@/components/report/TrustMeta";
import {
  REPORT_PAGE_BG_CLASS,
  REPORT_PAGE_CONTAINER_CLASS,
} from "@/components/report/reportStyles";
import { DEMO_REPORT, DEMO_REPORT_PREVIEW_IMAGE } from "@/lib/demo-report";
import type { ReportVisualFix, ReportVisualPass } from "@/lib/audit-report";

const PREVIEW_FIXES: ReportVisualFix[] = [
  {
    dimension: "cta_hierarchy",
    observation: "CTA 'Get Started' lacks specificity for cold B2B traffic",
    recommendation: "Rewrite to 'Start Your Free Audit — No Card Needed'",
  },
  {
    dimension: "navigation",
    observation: "6 nav items compete with primary CTA above fold",
    recommendation: "Reduce to 4 items, add sticky CTA button",
  },
  {
    dimension: "social_proof",
    observation: "No logos or stats visible above fold",
    recommendation: "Add 3–5 customer logos directly below hero CTA",
  },
  {
    dimension: "depth",
    observation: "Flat white background reduces perceived product quality",
    recommendation: "Add subtle gradient or card depth to hero section",
  },
  {
    dimension: "typography",
    observation: "Subheadline weight 400 too light for hero scan",
    recommendation: "Increase to 18px / weight 500",
  },
  {
    dimension: "color_contrast",
    observation: "Hero subtitle #9CA3AF on white fails AA contrast (2.8:1)",
    recommendation: "Change to #4B5563 for 4.6:1 ratio",
  },
  {
    dimension: "headline_formula",
    observation: "Headline leads with feature, not outcome",
    recommendation: "Reframe: 'X for Y' or outcome-first formula",
  },
];

const PREVIEW_PASSES: ReportVisualPass[] = [
  {
    dimension: "border_radius",
    note: "Corner radius consistent across UI components",
  },
  {
    dimension: "spacing",
    note: "Adequate spacing between hero elements enhances readability",
  },
  {
    dimension: "density",
    note: "Content density appropriate for target audience",
  },
];

export default function VisualFixesPreviewPage() {
  const demo = DEMO_REPORT;

  const criticalCount = demo.checklist.filter((item) => item.status !== "pass").length;
  const missingCount = demo.checklist.filter((item) => item.status === "missing").length;
  const weakCount = demo.checklist.filter((item) => item.status === "weak").length;

  return (
    <>
      <AppHeader />

      <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-[13px] text-amber-700">
        <span className="font-semibold">DEV PREVIEW</span>
        <span className="text-amber-500">·</span>
        <span>Visual fixes — all dimension states · not a real report</span>
      </div>

      <main
        className={`min-h-[calc(100dvh-68px)] ${REPORT_PAGE_BG_CLASS} px-4 pb-8 pt-[20px] text-[var(--ink-primary)] md:px-6 md:pb-10 md:pt-[44px]`}
      >
        <div className={REPORT_PAGE_CONTAINER_CLASS}>
          <ReportHeroSummary
            url={demo.url}
            generatedAt={demo.generatedAt}
            score={demo.score}
            verdict={demo.verdict}
            summary={demo.summary}
            risk={demo.risk}
            breakdown={demo.breakdown}
            confidence={demo.confidence}
            keyObservation={demo.key_observation}
            previewImage={DEMO_REPORT_PREVIEW_IMAGE}
            criticalCount={criticalCount}
            missingCount={missingCount}
            weakCount={weakCount}
            scorePotential={demo.score_potential?.target}
            onShare={() => {}}
            onExport={() => {}}
          />

          <ReportChecklist checklist={demo.checklist} />

          {demo.copy_variants ? (
            <CopyStudio
              copyVariants={demo.copy_variants}
              checklist={demo.checklist}
            />
          ) : null}

          {demo.score_potential ? (
            <ScorePotentialCompact
              score={demo.score}
              scorePotential={demo.score_potential}
              checklist={demo.checklist}
            />
          ) : null}

          <VisualFixes
            visualFixes={PREVIEW_FIXES}
            visualPasses={PREVIEW_PASSES}
          />

          {demo.meta ? (
            <TrustMeta
              meta={demo.meta}
              checklist={demo.checklist}
            />
          ) : null}
        </div>
      </main>
    </>
  );
}
