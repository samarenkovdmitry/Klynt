import type { ReportIssue } from "@/lib/audit-report";
import { ReportListCard } from "@/components/report/ReportListCard";
import { ReportSectionHeader } from "@/components/report/ReportSectionHeader";
import {
  REPORT_TAG_CLASS,
  REPORT_CARD_CONTENT_GAP_CLASS,
  REPORT_WHY_BODY_CLASS,
  REPORT_WHY_DIVIDER_CLASS,
  REPORT_WHY_LABEL_CLASS,
} from "@/components/report/reportStyles";
import { getImpactEntries } from "@/lib/report-impact";

type ReportUxIssuesSectionProps = {
  issues?: ReportIssue[];
};

export function ReportUxIssuesSection({ issues = [] }: ReportUxIssuesSectionProps) {
  if (issues.length === 0) return null;

  return (
    <section>
      <ReportSectionHeader title="UX Issues" count={issues.length} />

      <div className="mt-5 space-y-4">
        {issues.map((issue, index) => {
          const impactEntries = getImpactEntries(issue);

          return (
            <ReportListCard
              key={index}
              index={index}
              title={issue.title ?? ""}
              impactEntries={impactEntries}
            >
              {issue.bullets && issue.bullets.length > 0 && (
                <div className={`${REPORT_CARD_CONTENT_GAP_CLASS} flex flex-wrap gap-2`}>
                  {issue.bullets.slice(0, 3).map((bullet, i) => (
                    <span key={i} className={REPORT_TAG_CLASS}>
                      {bullet}
                    </span>
                  ))}
                </div>
              )}

              {issue.why && (
                <div className={`mt-4 ${REPORT_WHY_DIVIDER_CLASS}`}>
                  <p className={REPORT_WHY_LABEL_CLASS}>Why it matters</p>
                  <p className={REPORT_WHY_BODY_CLASS}>{issue.why}</p>
                </div>
              )}
            </ReportListCard>
          );
        })}
      </div>
    </section>
  );
}
