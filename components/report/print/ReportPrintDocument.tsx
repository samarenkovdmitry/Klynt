import Image from "next/image";

import type {
  AuditReport,
  HeadlineDirections,
  ReportChecklistItem,
  ReportCopyItem,
  ReportIssue,
  ReportMeta,
  ReportPriority,
  ReportSuggestion,
  ReportVisualFix,
  ReportVisualPass,
} from "@/lib/audit-report";
import { getBrandStageLabel, isHeroHeadlineCopySection } from "@/lib/brand-stage";
import { enrichChecklistWithDeltas } from "@/lib/checklist-deltas";
import {
  buildMobileSectionExtras,
  buildMobileSectionNarrative,
  getMobileChecklistIssues,
  hasMobileSectionData,
  mobileSectionHeaderSuffix,
} from "@/lib/report-mobile-section";
import {
  buildPerformanceMetricRows,
  hasPerformanceMetrics,
  statusLabel,
  statusTargetHint,
} from "@/lib/performance-thresholds";
import { getRecommendedVariant } from "@/lib/report/get-recommended-variant";
import { PRIORITY_LABELS } from "@/lib/report-priority";
import { getVisualFixDimensionLabel } from "@/lib/report-visual-fixes";
import {
  formatAnalyzedDate,
  formatOverallScore,
  formatReportDomain,
  formatReportHref,
  getTierLabel,
  getReportHeroTheme,
} from "@/lib/report-hero-theme";

import "./report-print.css";

type ReportPrintDocumentProps = {
  data: AuditReport;
  reportId: string;
  mobilePreviewImage?: string;
};

const PRIORITY_ORDER: Record<ReportPriority, number> = {
  quick_win: 0,
  high_impact: 1,
  medium_impact: 2,
};

const COPY_ROWS: { key: "headline" | "subheadline" | "cta"; label: string }[] = [
  { key: "headline", label: "Hero headline" },
  { key: "subheadline", label: "Subheadline" },
  { key: "cta", label: "Primary CTA" },
];

const IMPACT_LABEL: Record<NonNullable<ReportVisualFix["impact"]>, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

function sortByPriority<T extends { priority?: ReportPriority }>(items: T[]) {
  return [...items].sort(
    (a, b) =>
      (PRIORITY_ORDER[a.priority ?? "medium_impact"] ?? 2) -
      (PRIORITY_ORDER[b.priority ?? "medium_impact"] ?? 2)
  );
}

function sortChecklistByImpact(items: ReportChecklistItem[]) {
  return [...items].sort((a, b) => {
    const aPass = a.status === "pass";
    const bPass = b.status === "pass";
    if (aPass !== bPass) return aPass ? 1 : -1;
    return (b.impact_score ?? 0) - (a.impact_score ?? 0);
  });
}

function shouldShowPreview(src?: string) {
  if (!src?.trim()) return false;
  if (src.startsWith("/api/reports/") || src.startsWith("/demo/")) return true;
  if (src.startsWith("http://") || src.startsWith("https://")) return true;
  if (src.startsWith("data:image/") && src.length < 500_000) return true;
  if (src.startsWith("/")) return true;

  return false;
}

function formatScore(value: number) {
  return formatOverallScore(value);
}

function SectionHeader({ title, suffix }: { title: string; suffix?: string }) {
  return (
    <div className="report-print-section-header">
      <h2 className="report-print-section-heading">{title}</h2>
      {suffix ? <span className="report-print-section-suffix">{suffix}</span> : null}
    </div>
  );
}

function PrintChecklistRow({
  item,
  index,
}: {
  item: ReportChecklistItem;
  index: number;
}) {
  const explanation = [item.body, item.why_it_matters_here].filter(Boolean).join(" ");

  return (
    <article className="report-print-finding">
      <div className="report-print-finding-top">
        <span className="report-print-finding-index">{index + 1}</span>
        <div className="report-print-finding-main">
          <p className="report-print-finding-title">{item.text}</p>
          {item.evidence ? (
            <p className="report-print-finding-evidence">{item.evidence}</p>
          ) : null}
        </div>
        {typeof item.delta === "number" ? (
          <span className="report-print-delta">
            {item.delta >= 0 ? "↑" : "↓"} {Math.abs(item.delta).toFixed(1)}
          </span>
        ) : null}
      </div>
      {explanation ? (
        <p className="report-print-finding-body">{explanation}</p>
      ) : null}
      {item.fix ? (
        <p className="report-print-finding-fix">
          <strong>Fix:</strong> {item.fix}
        </p>
      ) : null}
    </article>
  );
}

function PrintHeadlineDirectionsCard({
  directions,
  brandStage,
}: {
  directions: HeadlineDirections;
  brandStage?: AuditReport["brand_stage"];
}) {
  return (
    <article className="report-print-card">
      <p className="report-print-card-eyebrow">
        Hero headline
        {brandStage ? ` · ${getBrandStageLabel(brandStage)}` : ""}
      </p>
      {directions.context ? (
        <p className="report-print-finding-title" style={{ marginBottom: 12 }}>
          {directions.context}
        </p>
      ) : null}
      {directions.gap ? (
        <p className="report-print-muted" style={{ marginBottom: 12 }}>
          {directions.gap}
        </p>
      ) : null}
      {directions.before ? (
        <div className="report-print-copy-block">
          <p className="report-print-copy-label">Before</p>
          <p className="report-print-copy-text">{directions.before}</p>
        </div>
      ) : null}
      {directions.options.map((option, index) => (
        <div
          key={`${option.label}-${index}`}
          className="report-print-copy-block report-print-copy-block--after"
          style={{ marginTop: 10 }}
        >
          <p className="report-print-copy-label report-print-copy-label--after">
            Option {String.fromCharCode(65 + index)} — {option.label}
          </p>
          <p className="report-print-copy-text report-print-copy-text--after">
            {option.text}
          </p>
        </div>
      ))}
    </article>
  );
}

function PrintCopyVariantCard({
  label,
  before,
  after,
  rationale,
  index,
}: {
  label: string;
  before?: string;
  after?: string;
  rationale?: string;
  index: number;
}) {
  return (
    <article className="report-print-card" style={{ marginTop: index === 0 ? 0 : 12 }}>
      <p className="report-print-card-eyebrow">
        {index + 1}. {label}
      </p>
      <div className="report-print-copy-grid">
        <div className="report-print-copy-block">
          <p className="report-print-copy-label">Before</p>
          <p className="report-print-copy-text">{before || "—"}</p>
        </div>
        <div className="report-print-copy-block report-print-copy-block--after">
          <p className="report-print-copy-label report-print-copy-label--after">Improved</p>
          <p className="report-print-copy-text report-print-copy-text--after">
            {after || "—"}
          </p>
        </div>
      </div>
      {rationale ? <p className="report-print-rationale">{rationale}</p> : null}
    </article>
  );
}

function PrintVisualFixCard({
  fix,
  index,
}: {
  fix: ReportVisualFix;
  index: number;
}) {
  const label = fix.title ?? getVisualFixDimensionLabel(fix.dimension);

  return (
    <article className="report-print-card" style={{ marginTop: index === 0 ? 0 : 12 }}>
      <div className="report-print-visual-top">
        <p className="report-print-finding-title" style={{ margin: 0 }}>
          {label}
        </p>
        {fix.impact ? (
          <span
            className={`report-print-impact report-print-impact--${fix.impact}`}
          >
            {IMPACT_LABEL[fix.impact]}
          </span>
        ) : null}
      </div>
      {fix.element ? (
        <p className="report-print-finding-evidence">on: {fix.element}</p>
      ) : null}
      <p className="report-print-card-body">{fix.observation}</p>
      <p className="report-print-card-fix">
        <strong>Recommendation:</strong> {fix.recommendation}
      </p>
    </article>
  );
}

function PrintLegacyIssue({ issue, index }: { issue: ReportIssue; index: number }) {
  return (
    <article className="report-print-card" style={{ marginTop: index === 0 ? 0 : 12 }}>
      <p className="report-print-card-eyebrow">
        {index + 1}. {issue.category ?? "Issue"}
      </p>
      <p className="report-print-finding-title">{issue.title}</p>
      {issue.why ? <p className="report-print-finding-body">{issue.why}</p> : null}
    </article>
  );
}

function PrintLegacySuggestion({
  item,
  index,
}: {
  item: ReportSuggestion;
  index: number;
}) {
  const priority = item.priority ? PRIORITY_LABELS[item.priority] : "Medium Impact";

  return (
    <article className="report-print-card" style={{ marginTop: index === 0 ? 0 : 12 }}>
      <p className="report-print-card-eyebrow">
        {priority}
        {item.section ? ` · ${item.section}` : ""}
      </p>
      <p className="report-print-finding-title">{item.recommendation}</p>
      {item.why ? <p className="report-print-finding-body">{item.why}</p> : null}
    </article>
  );
}

function PrintLegacyCopy({ item, index }: { item: ReportCopyItem; index: number }) {
  const priority = item.priority ? PRIORITY_LABELS[item.priority] : "Medium Impact";

  return (
    <article className="report-print-card" style={{ marginTop: index === 0 ? 0 : 12 }}>
      <p className="report-print-card-eyebrow">
        {priority}
        {item.section ? ` · ${item.section}` : ""}
      </p>
      {item.why ? (
        <p className="report-print-finding-body" style={{ marginBottom: 10 }}>
          {item.why}
        </p>
      ) : null}
      <div className="report-print-copy-grid">
        <div className="report-print-copy-block">
          <p className="report-print-copy-label">Before</p>
          <p className="report-print-copy-text">{item.before}</p>
        </div>
        <div className="report-print-copy-block report-print-copy-block--after">
          <p className="report-print-copy-label report-print-copy-label--after">Improved</p>
          <p className="report-print-copy-text report-print-copy-text--after">
            {item.after}
          </p>
        </div>
      </div>
    </article>
  );
}

function PrintTrustMeta({
  meta,
  trustGaps,
}: {
  meta: ReportMeta;
  trustGaps: ReportChecklistItem[];
}) {
  return (
    <section className="report-print-section">
      <SectionHeader
        title="Trust & meta"
        suffix={String(trustGaps.length || 1)}
      />
      <div className="report-print-trust-grid">
        <div className="report-print-card">
          <p className="report-print-card-eyebrow">Add proof</p>
          {trustGaps.length === 0 ? (
            <p className="report-print-status-good">Trust signals look good</p>
          ) : (
            <ul className="report-print-bullet-list">
              {trustGaps.map((item) => (
                <li key={item.id}>{item.text}</li>
              ))}
            </ul>
          )}
          {meta.proof_suggestion ? (
            <p className="report-print-finding-fix" style={{ marginTop: 10 }}>
              <strong>Next:</strong> {meta.proof_suggestion}
            </p>
          ) : null}
          {meta.trust_notes && meta.trust_notes.length > 0 ? (
            <ul className="report-print-bullet-list" style={{ marginTop: 10 }}>
              {meta.trust_notes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="report-print-card">
          <p className="report-print-card-eyebrow">Meta</p>
          <p className="report-print-meta-label">Title</p>
          <p className="report-print-finding-title" style={{ marginBottom: 12 }}>
            {meta.title_suggestion}
          </p>
          <p className="report-print-meta-label">Description</p>
          <p className="report-print-muted">{meta.description_suggestion}</p>
        </div>
      </div>
    </section>
  );
}

export function ReportPrintDocument({
  data,
  reportId,
  mobilePreviewImage,
}: ReportPrintDocumentProps) {
  const score = Number(data.score) || 0;
  const theme = getReportHeroTheme(score);
  const tierLabel = getTierLabel(theme.tier);
  const domain = formatReportDomain(data.url);
  const reportHref = formatReportHref(data.url);
  const analyzedLabel = formatAnalyzedDate(data.generatedAt);
  const liveReportUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/report/${reportId}`
      : `https://klynt.one/report/${reportId}`;

  const scorePotential = data.score_potential;
  const target = scorePotential?.target;
  const checklist = data.checklist ?? [];

  const gapItems = scorePotential
    ? sortChecklistByImpact(
        enrichChecklistWithDeltas(checklist, score, target)
      ).filter((item) => item.status !== "pass")
    : [];

  const copyVariants = data.copy_variants;
  const headlineDirections = data.headline_directions;
  const hasHeadlineDirections = Boolean(headlineDirections?.options?.length);

  const copyRows = copyVariants
    ? COPY_ROWS.map(({ key, label }) => ({
        key,
        label,
        block: copyVariants[key],
      })).filter(
        (row) =>
          row.block?.current || getRecommendedVariant(row.block?.variants)?.text
      )
    : [];

  const supportingCopyRows = hasHeadlineDirections
    ? copyRows.filter((row) => row.key !== "headline")
    : copyRows;

  const hasCopyStudio = hasHeadlineDirections || supportingCopyRows.length > 0;
  const copyStudioCount =
    (hasHeadlineDirections ? 1 : 0) + supportingCopyRows.length;

  const visualFixes = data.visual_fixes ?? [];
  const visualPasses = data.visual_passes ?? [];
  const hasVisualFixes = visualFixes.length > 0 || visualPasses.length > 0;

  const mobileIssues = getMobileChecklistIssues(
    checklist,
    data.computed_values,
    data.mobile_computed_values
  );
  const mobileExtras = buildMobileSectionExtras(
    mobileIssues,
    data.computed_values,
    data.mobile_computed_values
  );
  const showMobile = hasMobileSectionData({
    mobileComputedValues: data.mobile_computed_values,
    mobilePreviewImage,
    checklist,
    computedValues: data.computed_values,
  });
  const mobileNarrative = showMobile
    ? buildMobileSectionNarrative({
        issues: mobileIssues,
        desktop: data.computed_values,
        mobile: data.mobile_computed_values,
      })
    : "";

  const showPerformance = hasPerformanceMetrics(data.performance_metrics);
  const performanceRows = showPerformance
    ? buildPerformanceMetricRows(data.performance_metrics)
    : [];
  const performanceIssueCount = performanceRows.filter(
    (row) => row.status === "weak" || row.status === "missing"
  ).length;

  const trustGaps = checklist.filter(
    (item) => item.category === "trust" && item.status !== "pass"
  );
  const showTrust = Boolean(data.meta);

  const hasModernContent =
    gapItems.length > 0 ||
    hasCopyStudio ||
    hasVisualFixes ||
    showMobile ||
    showPerformance ||
    showTrust;

  const legacyIssues = !hasModernContent ? data.issues ?? [] : [];
  const legacySuggestions = !hasModernContent
    ? sortByPriority(data.suggestions ?? [])
    : [];
  const legacyCopy = !hasModernContent
    ? sortByPriority(
        hasHeadlineDirections
          ? (data.copy ?? []).filter(
              (item) => !isHeroHeadlineCopySection(item.section)
            )
          : (data.copy ?? [])
      )
    : [];
  const showLegacy =
    legacyIssues.length > 0 ||
    legacySuggestions.length > 0 ||
    legacyCopy.length > 0;

  const showPreview = shouldShowPreview(data.previewImage);
  const showMobilePreview = shouldShowPreview(mobilePreviewImage);

  return (
    <div className="report-print-root">
      <div className="report-print-page">
        {/* Cover / hero */}
        <header className="report-print-cover">
          <div className="report-print-brand-bar">
            <Image
              src="/klynt-logo-dark.svg"
              alt="Klynt"
              width={88}
              height={22}
              className="report-print-brand-logo"
            />
            <p className="report-print-brand-eyebrow">UX Report</p>
          </div>

          <div className="report-print-cover-meta">
            <div>
              <h1 className="report-print-domain">{domain || "Landing page"}</h1>
              <p className="report-print-title-meta">
                {analyzedLabel}
                {reportHref ? (
                  <span className="report-print-title-meta-url">{reportHref}</span>
                ) : null}
              </p>
            </div>
            <div className="report-print-title-link">
              <span className="report-print-title-link-label">Interactive report</span>
              <span className="report-print-title-link-url">
                {liveReportUrl.replace(/^https?:\/\//, "")}
              </span>
            </div>
          </div>

          <div
            className="report-print-hero"
            style={{ background: theme.heroBg }}
          >
            <div className="report-print-hero-grid">
              <div>
                <div
                  className="report-print-score-chip"
                  style={{ background: theme.badgeBg }}
                >
                  <span className="report-print-score-value">
                    {formatScore(score)}
                  </span>
                  <span className="report-print-score-tier">{tierLabel}</span>
                </div>

                {data.verdict ? (
                  <h2 className="report-print-verdict">{data.verdict}</h2>
                ) : null}

                {data.summary ? (
                  <p className="report-print-summary">{data.summary}</p>
                ) : null}

                {data.key_observation ? (
                  <p className="report-print-insight">{data.key_observation}</p>
                ) : null}
              </div>

              {showPreview && data.previewImage ? (
                <div className="report-print-preview">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.previewImage}
                    alt="Page preview"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {/* Close the gap */}
        {gapItems.length > 0 && scorePotential ? (
          <section className="report-print-section">
            <SectionHeader
              title="Close the gap"
              suffix={`${formatScore(score)} → ${formatScore(target ?? score)}`}
            />
            <div className="report-print-stack">
              {gapItems.map((item, index) => (
                <PrintChecklistRow key={item.id} item={item} index={index} />
              ))}
            </div>
          </section>
        ) : null}

        {/* Copy studio */}
        {hasCopyStudio ? (
          <section className="report-print-section">
            <SectionHeader title="Copy studio" suffix={String(copyStudioCount)} />
            <div className="report-print-stack">
              {hasHeadlineDirections && headlineDirections ? (
                <PrintHeadlineDirectionsCard
                  directions={headlineDirections}
                  brandStage={data.brand_stage}
                />
              ) : null}
              {supportingCopyRows.map((row, index) => {
                const recommended = getRecommendedVariant(row.block?.variants);
                return (
                  <PrintCopyVariantCard
                    key={row.key}
                    label={row.label}
                    before={row.block?.current}
                    after={recommended?.text}
                    rationale={recommended?.rationale}
                    index={index}
                  />
                );
              })}
            </div>
          </section>
        ) : null}

        {/* Visual fixes */}
        {hasVisualFixes ? (
          <section className="report-print-section">
            <SectionHeader
              title="Visual fixes"
              suffix={String(visualFixes.length || visualPasses.length)}
            />
            {visualFixes.length > 0 ? (
              <div className="report-print-stack">
                {visualFixes.map((fix, index) => (
                  <PrintVisualFixCard key={index} fix={fix} index={index} />
                ))}
              </div>
            ) : null}
            {visualPasses.length > 0 ? (
              <div
                className="report-print-aligned"
                style={{ marginTop: visualFixes.length > 0 ? 14 : 0 }}
              >
                <p className="report-print-card-eyebrow">Aligned</p>
                <ul className="report-print-bullet-list">
                  {visualPasses.map((pass: ReportVisualPass, index) => (
                    <li key={index}>
                      <strong>{getVisualFixDimensionLabel(pass.dimension)}</strong>
                      {pass.note ? ` — ${pass.note}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}

        {/* Mobile */}
        {showMobile ? (
          <section className="report-print-section">
            <SectionHeader
              title="Mobile view"
              suffix={mobileSectionHeaderSuffix(
                mobileIssues.length,
                mobileExtras.length
              )}
            />
            <div
              className="report-print-mobile-grid"
              style={{
                gridTemplateColumns: showMobilePreview ? "1.2fr 0.8fr" : "1fr",
              }}
            >
              <div>
                {mobileNarrative ? (
                  <p className="report-print-summary" style={{ marginBottom: 14 }}>
                    {mobileNarrative}
                  </p>
                ) : null}
                <div className="report-print-stack">
                  {mobileIssues.map((item, index) => (
                    <article key={item.id} className="report-print-finding">
                      <div className="report-print-finding-top">
                        <span className="report-print-finding-index">
                          {index + 1}
                        </span>
                        <div className="report-print-finding-main">
                          <p className="report-print-finding-title">{item.text}</p>
                          {item.evidence ? (
                            <p className="report-print-finding-evidence">
                              {item.evidence}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      {item.fix ? (
                        <p className="report-print-finding-fix">
                          <strong>Fix:</strong> {item.fix}
                        </p>
                      ) : null}
                    </article>
                  ))}
                  {mobileExtras.map((extra, index) => (
                    <article key={extra.id} className="report-print-finding">
                      <div className="report-print-finding-top">
                        <span className="report-print-finding-index">
                          {mobileIssues.length + index + 1}
                        </span>
                        <div className="report-print-finding-main">
                          <p className="report-print-finding-title">{extra.title}</p>
                          {extra.detail ? (
                            <p className="report-print-finding-evidence">
                              {extra.detail}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      {extra.fix ? (
                        <p className="report-print-finding-fix">
                          <strong>Fix:</strong> {extra.fix}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              </div>
              {showMobilePreview && mobilePreviewImage ? (
                <div className="report-print-mobile-preview">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mobilePreviewImage} alt="Mobile preview at 390px" />
                  <p className="report-print-mobile-caption">390px viewport</p>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* Load speed */}
        {showPerformance ? (
          <section className="report-print-section">
            <SectionHeader
              title="Load speed"
              suffix={
                performanceIssueCount === 0
                  ? "Good"
                  : performanceIssueCount === 1
                    ? "1 needs work"
                    : `${performanceIssueCount} need work`
              }
            />
            <div className="report-print-metrics">
              {performanceRows.map((row) => (
                <div key={row.spec.id} className="report-print-metric">
                  <p className="report-print-meta-label">{row.spec.shortLabel}</p>
                  <p
                    className={`report-print-metric-value report-print-metric-value--${row.status}`}
                  >
                    {row.value != null ? row.spec.format(row.value) : "—"}
                  </p>
                  <p className="report-print-metric-hint">
                    {statusTargetHint(row.spec)} · {statusLabel(row.status)}
                  </p>
                </div>
              ))}
            </div>
            {data.benchmark &&
            data.benchmark.sample_size >= 5 &&
            data.benchmark.performance.lcp_percentile != null ? (
              <p className="report-print-muted" style={{ marginTop: 12 }}>
                Beats {data.benchmark.performance.lcp_percentile}% of recent Klynt
                audits
                {data.performance_metrics?.request_count
                  ? ` · ${data.performance_metrics.request_count} requests`
                  : ""}
              </p>
            ) : null}
          </section>
        ) : null}

        {/* Trust & meta */}
        {showTrust && data.meta ? (
          <PrintTrustMeta meta={data.meta} trustGaps={trustGaps} />
        ) : null}

        {/* Legacy fallback */}
        {showLegacy ? (
          <section className="report-print-section">
            <SectionHeader title="Findings" />
            {legacyIssues.map((issue, index) => (
              <PrintLegacyIssue key={`issue-${index}`} issue={issue} index={index} />
            ))}
            {legacySuggestions.map((item, index) => (
              <PrintLegacySuggestion
                key={`suggestion-${index}`}
                item={item}
                index={index}
              />
            ))}
            {legacyCopy.map((item, index) => (
              <PrintLegacyCopy key={`copy-${index}`} item={item} index={index} />
            ))}
          </section>
        ) : null}

        {/* Closing */}
        <div className="report-print-closing">
          <p className="report-print-card-eyebrow">Next steps</p>
          <h2 className="report-print-closing-title">What to do with this report</h2>
          <ol className="report-print-closing-steps">
            <li>
              Start with the highest-delta items in Close the gap — headline, CTA, and
              trust signals usually move the score fastest.
            </li>
            <li>
              Paste improved copy from Copy studio, then ship visual and mobile fixes
              that remove conversion friction.
            </li>
            <li>
              Re-run an analysis at klynt.one after you ship changes to compare your UX
              score, and share this PDF or the live report with your team or client.
            </li>
          </ol>
          <p className="report-print-disclaimer">
            AI-generated from visible page content. Not a substitute for user research.
            · Klynt · klynt.one/report/{reportId}
          </p>
        </div>
      </div>
    </div>
  );
}
