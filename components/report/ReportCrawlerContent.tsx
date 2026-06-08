import type { AuditReport } from "@/lib/audit-report";
import { formatOverallScore, formatReportDomain } from "@/lib/report-hero-theme";

type ReportCrawlerContentProps = {
  report: AuditReport;
};

export function ReportCrawlerContent({ report }: ReportCrawlerContentProps) {
  const domain = formatReportDomain(report.url);
  const score = formatOverallScore(report.score);
  const title = domain
    ? `UX clarity report for ${domain}`
    : "UX clarity report";

  return (
    <article className="report-crawler-content" aria-hidden="true">
      <h1>{title}</h1>
      <p>
        Overall UX clarity score: {score} out of 10.
      </p>

      {report.verdict?.trim() ? <p>{report.verdict.trim()}</p> : null}
      {report.summary?.trim() ? <p>{report.summary.trim()}</p> : null}
      {report.key_observation?.trim() ? (
        <p>Key observation: {report.key_observation.trim()}</p>
      ) : null}

      {(report.issues?.length ?? 0) > 0 ? (
        <section>
          <h2>UX issues</h2>
          <ol>
            {report.issues?.map((issue, index) => (
              <li key={`issue-${index}`}>
                <h3>{issue.title?.trim() ?? `Issue ${index + 1}`}</h3>
                {issue.category?.trim() ? <p>Category: {issue.category}</p> : null}
                {issue.why?.trim() ? <p>{issue.why.trim()}</p> : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {(report.suggestions?.length ?? 0) > 0 ? (
        <section>
          <h2>Recommendations</h2>
          <ol>
            {report.suggestions?.map((item, index) => (
              <li key={`suggestion-${index}`}>
                <h3>{item.recommendation?.trim() ?? `Recommendation ${index + 1}`}</h3>
                {item.section?.trim() ? <p>Section: {item.section}</p> : null}
                {item.why?.trim() ? <p>{item.why.trim()}</p> : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {report.headline_directions ? (
        <section>
          <h2>Headline directions</h2>
          {report.headline_directions.before?.trim() ? (
            <p>Current headline: {report.headline_directions.before.trim()}</p>
          ) : null}
          {report.headline_directions.gap?.trim() ? (
            <p>{report.headline_directions.gap.trim()}</p>
          ) : null}
          <ul>
            {report.headline_directions.options.map((option, index) => (
              <li key={`headline-${index}`}>
                {option.label}: {option.text}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {(report.copy?.length ?? 0) > 0 ? (
        <section>
          <h2>Copy improvements</h2>
          <ol>
            {report.copy?.map((item, index) => (
              <li key={`copy-${index}`}>
                <h3>{item.section?.trim() ?? `Section ${index + 1}`}</h3>
                {item.before?.trim() ? <p>Before: {item.before.trim()}</p> : null}
                {item.after?.trim() ? <p>After: {item.after.trim()}</p> : null}
                {item.why?.trim() ? <p>{item.why.trim()}</p> : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </article>
  );
}
