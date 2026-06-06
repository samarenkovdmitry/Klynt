import Image from "next/image";

import type {
  AuditReport,
  HeadlineDirections,
  ReportCopyItem,
  ReportIssue,
  ReportPriority,
  ReportSuggestion,
} from "@/lib/audit-report";
import { getBrandStageLabel, isHeroHeadlineCopySection } from "@/lib/brand-stage";
import { getImpactEntries, type ImpactEntry } from "@/lib/report-impact";
import { getMetricObservationFallbacks } from "@/lib/metric-observations";
import { normalizeRisk } from "@/lib/report-metrics";
import { PRIORITY_LABELS } from "@/lib/report-priority";
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
};

const BREAKDOWN_ROWS: { key: keyof NonNullable<AuditReport["breakdown"]>; label: string }[] =
  [
    { key: "clarity", label: "Clarity" },
    { key: "navigation", label: "Navigation" },
    { key: "visuals", label: "Visuals" },
    { key: "trust", label: "Trust" },
    { key: "conversion", label: "Conversion" },
  ];

const PRIORITY_ORDER: Record<ReportPriority, number> = {
  quick_win: 0,
  high_impact: 1,
  medium_impact: 2,
};

function formatImpactLine(entry: ImpactEntry) {
  const label =
    entry.key === "cta"
      ? "CTA"
      : entry.key.charAt(0).toUpperCase() + entry.key.slice(1);

  return `Impact · ${label} ${entry.value}%`;
}

function sortByPriority<T extends { priority?: ReportPriority }>(items: T[]) {
  return [...items].sort(
    (a, b) =>
      (PRIORITY_ORDER[a.priority ?? "medium_impact"] ?? 2) -
      (PRIORITY_ORDER[b.priority ?? "medium_impact"] ?? 2)
  );
}

function shouldShowPreview(src?: string) {
  if (!src?.trim()) return false;
  if (src.startsWith("https://")) return true;
  if (src.startsWith("data:image/") && src.length < 500_000) return true;

  return false;
}

function PrintIssueCard({
  issue,
  index,
  breakdown,
}: {
  issue: ReportIssue;
  index: number;
  breakdown?: AuditReport["breakdown"];
}) {
  const impact = getImpactEntries(issue, { breakdown, index })[0];
  const category = issue.category ?? "Issue";

  return (
    <article className="report-print-card" style={{ marginTop: index === 0 ? 0 : 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 8,
          fontSize: 13,
        }}
      >
        <strong>
          {index + 1}. {category}
        </strong>
        {impact ? (
          <span className="report-print-label" style={{ whiteSpace: "nowrap" }}>
            {formatImpactLine(impact)}
          </span>
        ) : null}
      </div>
      <p className="report-print-body" style={{ margin: "0 0 10px", fontWeight: 500, lineHeight: 1.45 }}>
        {issue.title}
      </p>
      {issue.why ? (
        <>
          <p className="report-print-label" style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 600 }}>
            Why it matters
          </p>
          <p className="report-print-muted" style={{ margin: 0 }}>
            {issue.why}
          </p>
        </>
      ) : null}
      {issue.bullets && issue.bullets.length > 0 ? (
        <p className="report-print-label" style={{ margin: "10px 0 0", fontSize: 13 }}>
          Evidence: {issue.bullets.slice(0, 3).join(" · ")}
        </p>
      ) : null}
    </article>
  );
}

function PrintSuggestionCard({ item, index }: { item: ReportSuggestion; index: number }) {
  const priority = item.priority ? PRIORITY_LABELS[item.priority] : "Medium Impact";

  return (
    <article className="report-print-card" style={{ marginTop: index === 0 ? 0 : 12 }}>
      <p className="report-print-label" style={{ margin: "0 0 6px", fontSize: 12 }}>
        {priority}
        {item.section ? ` · ${item.section}` : ""}
      </p>
      <p className="report-print-body" style={{ margin: "0 0 8px", fontWeight: 500, lineHeight: 1.45 }}>
        {item.recommendation}
      </p>
      {item.why ? (
        <p className="report-print-muted" style={{ margin: 0 }}>
          {item.why}
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
      <p className="report-print-label" style={{ margin: "0 0 10px", fontSize: 12 }}>
        Hero headline directions
        {brandStage ? ` · ${getBrandStageLabel(brandStage)}` : ""}
      </p>
      {directions.context ? (
        <p style={{ margin: "0 0 12px", fontWeight: 500, lineHeight: 1.45 }}>
          {directions.context}
        </p>
      ) : null}
      {directions.before ? (
        <div className="report-print-copy-block">
          <p
            style={{
              margin: "0 0 6px",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#4a5560",
            }}
          >
            Before
          </p>
          <p style={{ margin: 0 }}>{directions.before}</p>
        </div>
      ) : null}
      {directions.options.map((option, index) => (
        <div
          key={`${option.label}-${index}`}
          className="report-print-copy-block report-print-copy-block--after"
          style={{ marginTop: 12 }}
        >
          <p
            style={{
              margin: "0 0 6px",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#059669",
            }}
          >
            Option {String.fromCharCode(65 + index)} — {option.label}
          </p>
          <p style={{ margin: 0 }}>{option.text}</p>
        </div>
      ))}
    </article>
  );
}

function PrintCopyCard({ item, index }: { item: ReportCopyItem; index: number }) {
  const priority = item.priority ? PRIORITY_LABELS[item.priority] : "Medium Impact";

  return (
    <article className="report-print-card" style={{ marginTop: index === 0 ? 0 : 12 }}>
      <p className="report-print-label" style={{ margin: "0 0 10px", fontSize: 12 }}>
        {priority}
        {item.section ? ` · ${item.section}` : ""}
      </p>
      {item.why ? (
        <p style={{ margin: "0 0 12px", fontWeight: 500, lineHeight: 1.45 }}>{item.why}</p>
      ) : null}
      <div className="report-print-copy-block">
        <p
          style={{
            margin: "0 0 6px",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#4a5560",
          }}
        >
          Before
        </p>
        <p style={{ margin: 0 }}>{item.before}</p>
      </div>
      <div className="report-print-copy-block report-print-copy-block--after">
        <p
          style={{
            margin: "0 0 6px",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#059669",
          }}
        >
          Improved
        </p>
        <p style={{ margin: 0 }}>{item.after}</p>
      </div>
    </article>
  );
}

export function ReportPrintDocument({ data, reportId }: ReportPrintDocumentProps) {
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

  const breakdown = data.breakdown ?? {};
  const observations =
    data.metric_observations ??
    getMetricObservationFallbacks(breakdown, data.verdict);

  const issues = data.issues ?? [];
  const suggestions = sortByPriority(data.suggestions ?? []);
  const headlineDirections = data.headline_directions;
  const hasHeadlineDirections = Boolean(headlineDirections?.options?.length);
  const copy = sortByPriority(
    hasHeadlineDirections
      ? (data.copy ?? []).filter((item) => !isHeroHeadlineCopySection(item.section))
      : (data.copy ?? [])
  );
  const showPreview = shouldShowPreview(data.previewImage);

  const observationRows = [
    { label: "Trust", text: observations?.trust },
    { label: "Clarity", text: observations?.clarity },
    { label: "Friction", text: observations?.friction },
    { label: "Overall", text: observations?.overall },
  ].filter((row) => row.text);

  return (
    <div className="report-print-root">
      <div className="report-print-page">
        <div className="report-print-title-block">
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

          <div className="report-print-title-main">
            <div className="report-print-title-primary">
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
        </div>

        <section className="report-print-section report-print-section--first">
          <h2 className="report-print-section-title">Executive summary</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: showPreview ? "1.2fr 0.8fr" : "1fr",
              gap: 24,
              alignItems: "start",
            }}
          >
            <div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 16 }}>
                <div>
                  <p className="report-print-label" style={{ margin: 0, fontSize: 12 }}>
                    Overall score
                  </p>
                  <p className="report-print-body" style={{ margin: "4px 0 0", fontSize: 32, fontWeight: 700, lineHeight: 1 }}>
                    {formatOverallScore(score)}
                    <span className="report-print-label" style={{ fontSize: 16, fontWeight: 500 }}>
                      {" "}
                      / 10
                    </span>
                  </p>
                  <p className="report-print-label" style={{ margin: "4px 0 0", fontSize: 13 }}>
                    {tierLabel}
                  </p>
                </div>
                <div>
                  <p className="report-print-label" style={{ margin: 0, fontSize: 12 }}>
                    Risk
                  </p>
                  <p className="report-print-body" style={{ margin: "8px 0 0", fontWeight: 600 }}>
                    {normalizeRisk(String(data.risk ?? ""))}
                  </p>
                </div>
                {data.confidence != null ? (
                  <div>
                    <p className="report-print-label" style={{ margin: 0, fontSize: 12 }}>
                      Confidence
                    </p>
                    <p className="report-print-body" style={{ margin: "8px 0 0", fontWeight: 600 }}>
                      {Math.round(data.confidence)}%
                    </p>
                  </div>
                ) : null}
              </div>

              {data.verdict ? (
                <>
                  <p className="report-print-label" style={{ margin: "0 0 4px", fontSize: 12 }}>
                    Verdict
                  </p>
                  <p className="report-print-body" style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600 }}>
                    {data.verdict}
                  </p>
                </>
              ) : null}

              {data.summary ? (
                <>
                  <p className="report-print-label" style={{ margin: "0 0 4px", fontSize: 12 }}>
                    Summary
                  </p>
                  <p className="report-print-muted" style={{ margin: "0 0 14px", lineHeight: 1.55 }}>
                    {data.summary}
                  </p>
                </>
              ) : null}

              {data.key_observation ? (
                <>
                  <p className="report-print-label" style={{ margin: "0 0 4px", fontSize: 12 }}>
                    Key observation
                  </p>
                  <p className="report-print-insight">{data.key_observation}</p>
                </>
              ) : null}
            </div>

            {showPreview && data.previewImage ? (
              <div
                style={{
                  border: "1px solid rgba(6,28,47,0.08)",
                  borderRadius: 8,
                  overflow: "hidden",
                  lineHeight: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.previewImage}
                  alt="Page preview"
                  style={{ width: "100%", height: "auto", maxHeight: 200, objectFit: "cover" }}
                />
              </div>
            ) : null}
          </div>
        </section>

        <hr className="report-print-divider" />

        <section className="report-print-section">
          <h2 className="report-print-section-title">Score breakdown</h2>
          <table className="report-print-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Score</th>
                <th style={{ textAlign: "left" }}>Distribution</th>
              </tr>
            </thead>
            <tbody>
              {BREAKDOWN_ROWS.map(({ key, label }) => {
                const value = Math.max(0, Math.min(100, Number(breakdown[key] ?? 0)));

                return (
                  <tr key={key}>
                    <td>{label}</td>
                    <td className="report-print-table-score">{value}%</td>
                    <td className="report-print-bar-cell">
                      <div className="report-print-bar-track">
                        <div
                          className="report-print-bar-fill"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {observationRows.length > 0 ? (
            <div style={{ marginTop: 16 }}>
              <p className="report-print-label" style={{ margin: "0 0 10px", fontSize: 12 }}>
                Consultant notes
              </p>
              {observationRows.map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "72px 1fr",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <strong className="report-print-body" style={{ fontSize: 13 }}>
                    {row.label}
                  </strong>
                  <span className="report-print-muted">{row.text}</span>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        {issues.length > 0 ? (
          <section className="report-print-section">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 14,
              }}
            >
              <h2 className="report-print-section-title" style={{ margin: 0 }}>
                UX issues
              </h2>
              <span className="report-print-label" style={{ fontSize: 13 }}>
                {issues.length} found
              </span>
            </div>
            {issues.map((issue, index) => (
              <PrintIssueCard
                key={index}
                issue={issue}
                index={index}
                breakdown={breakdown}
              />
            ))}
          </section>
        ) : null}

        {suggestions.length > 0 ? (
          <section className="report-print-section">
            <h2 className="report-print-section-title">Recommendations</h2>
            {suggestions.map((item, index) => (
              <PrintSuggestionCard key={index} item={item} index={index} />
            ))}
          </section>
        ) : null}

        {hasHeadlineDirections || copy.length > 0 ? (
          <section className="report-print-section">
            <h2 className="report-print-section-title">Copy improvements</h2>
            {hasHeadlineDirections && headlineDirections ? (
              <PrintHeadlineDirectionsCard
                directions={headlineDirections}
                brandStage={data.brand_stage}
              />
            ) : null}
            {copy.map((item, index) => (
              <PrintCopyCard key={index} item={item} index={index} />
            ))}
          </section>
        ) : null}

        <div className="report-print-closing">
          <p className="report-print-section-title">Next steps</p>
          <h2 className="report-print-closing-title">What to do with this report</h2>
          <ol className="report-print-closing-steps">
            <li>
              Tackle quick wins from Recommendations first — headline, CTA, and trust signals
              usually move the score fastest.
            </li>
            <li>
              Re-run an analysis at klynt.one after you ship changes to compare your UX score.
            </li>
            <li>
              Share this PDF or the live report with your team or client to align on priorities.
            </li>
          </ol>
          <p className="report-print-disclaimer">
            AI-generated from visible page content. Not a substitute for user research. · Klynt ·
            klynt.one/report/{reportId}
          </p>
        </div>
      </div>
    </div>
  );
}
