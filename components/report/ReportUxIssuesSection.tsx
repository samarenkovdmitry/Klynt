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
  waitlistActive?: boolean;
};

export function ReportUxIssuesSection({
  issues = [],
  waitlistActive = false,
}: ReportUxIssuesSectionProps) {
  if (issues.length === 0) return null;

  const visibleIssues = waitlistActive ? issues.slice(0, 1) : issues;
  const lockedIssueCount = waitlistActive ? Math.max(0, issues.length - 1) : 0;

  return (
    <section className="mt-10">
      <ReportSectionHeader title="UX Issues" count={issues.length} />

      <div className="mt-6 space-y-4">
        {visibleIssues.map((issue, index) => {
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

        {lockedIssueCount > 0 && (
          <p className="px-1 text-[14px] leading-5 text-[rgba(6,28,47,0.45)]">
            +{lockedIssueCount} more issue{lockedIssueCount === 1 ? "" : "s"} in the full
            report
          </p>
        )}
      </div>
    </section>
  );
}
