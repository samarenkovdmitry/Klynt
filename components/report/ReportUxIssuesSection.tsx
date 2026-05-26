import type { ReportIssue } from "@/lib/audit-report";
import { ReportListCard } from "@/components/report/ReportListCard";
import { REPORT_SECTION_TITLE_CLASS } from "@/components/report/reportStyles";
import { getImpactEntries } from "@/lib/report-impact";

type ReportUxIssuesSectionProps = {
  issues?: ReportIssue[];
};

export function ReportUxIssuesSection({ issues = [] }: ReportUxIssuesSectionProps) {
  if (issues.length === 0) return null;

  return (
    <section>
      <h3 className={`${REPORT_SECTION_TITLE_CLASS} mb-5`}>UX Issues</h3>

      <div className="space-y-4">
        {issues.map((issue, index) => {
          const impactEntries = getImpactEntries(issue);

          return (
            <ReportListCard
              key={index}
              index={index}
              title={issue.title ?? ""}
              impactEntries={impactEntries}
              impactVariant="negative"
            >
              {issue.bullets && issue.bullets.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {issue.bullets.slice(0, 3).map((bullet, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-[12px] font-medium text-neutral-600 md:text-[13px]"
                    >
                      {bullet}
                    </span>
                  ))}
                </div>
              )}

              {issue.why && (
                <div className="mt-6 border-t border-neutral-100 pt-5">
                  <p className="text-[14px] font-semibold text-[var(--ink-primary)]">
                    Why it matters
                  </p>
                  <p className="mt-1 text-[15px] leading-6 text-[var(--ink-secondary)]">
                    {issue.why}
                  </p>
                </div>
              )}
            </ReportListCard>
          );
        })}
      </div>
    </section>
  );
}
