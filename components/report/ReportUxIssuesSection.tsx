import type { ReportBreakdown, ReportIssue } from "@/lib/audit-report";
import { ReportListCard } from "@/components/report/ReportListCard";
import { ReportSectionHeader } from "@/components/report/ReportSectionHeader";
import {
  REPORT_CARD_CONTENT_GAP_CLASS,
  REPORT_TAG_CLASS,
  REPORT_SECTION_SCROLL_MARGIN_CLASS,
  REPORT_WHY_BODY_CLASS,
  REPORT_WHY_DIVIDER_CLASS,
  REPORT_WHY_BODY_MEASURE_CLASS,
} from "@/components/report/reportStyles";
import { REPORT_SECTION_ANCHORS } from "@/lib/report-sections";
import { getImpactEntries } from "@/lib/report-impact";

type ReportUxIssuesSectionProps = {
  issues?: ReportIssue[];
  breakdown?: ReportBreakdown;
  waitlistActive?: boolean;
};

export function ReportUxIssuesSection({
  issues = [],
  breakdown,
  waitlistActive = false,
}: ReportUxIssuesSectionProps) {
  if (issues.length === 0) return null;

  const visibleIssues = waitlistActive ? issues.slice(0, 1) : issues;
  const lockedIssueCount = waitlistActive ? Math.max(0, issues.length - 1) : 0;

  return (
    <section
      id={REPORT_SECTION_ANCHORS.issues}
      className={`mt-10 ${REPORT_SECTION_SCROLL_MARGIN_CLASS}`}
    >
      <ReportSectionHeader variant="issues" count={issues.length} />

      <div className="mt-6 space-y-4">
        {visibleIssues.map((issue, index) => {
          const impactEntries = getImpactEntries(issue, { breakdown, index });

          return (
            <ReportListCard
              key={index}
              variant="issue"
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
                <div className={REPORT_WHY_DIVIDER_CLASS}>
                  <p className={`${REPORT_WHY_BODY_CLASS} ${REPORT_WHY_BODY_MEASURE_CLASS}`}>
                    {issue.why}
                  </p>
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
