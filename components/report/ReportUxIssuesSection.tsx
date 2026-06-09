import type { ReportIssue } from "@/lib/audit-report";
import { ReportListCard } from "@/components/report/ReportListCard";
import { ReportSectionHeader } from "@/components/report/ReportSectionHeader";
import {
  REPORT_CARD_CONTENT_GAP_CLASS,
  REPORT_SECTION_SCROLL_MARGIN_CLASS,
} from "@/components/report/reportStyles";
import { REPORT_SECTION_ANCHORS } from "@/lib/report-sections";
import { RiArrowRightLine } from "@remixicon/react";

type Severity = "critical" | "warning" | "minor";

const SEVERITY_STYLES: Record<Severity, { label: string; className: string }> = {
  critical: { label: "Critical", className: "bg-red-50 text-red-600" },
  warning:  { label: "Warning",  className: "bg-orange-50 text-orange-500" },
  minor:    { label: "Minor",    className: "bg-[rgba(6,28,47,0.06)] text-[rgba(6,28,47,0.45)]" },
};

function normalizeSeverity(raw?: string): Severity | null {
  if (raw === "critical" || raw === "warning" || raw === "minor") return raw;
  if (raw === "high") return "critical";
  if (raw === "medium") return "warning";
  if (raw === "low") return "minor";
  return null;
}

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
    <section
      id={REPORT_SECTION_ANCHORS.issues}
      className={`mt-10 ${REPORT_SECTION_SCROLL_MARGIN_CLASS}`}
    >
      <ReportSectionHeader variant="issues" count={issues.length} />

      <div className="mt-6 space-y-4">
        {visibleIssues.map((issue, index) => {
          const severity = normalizeSeverity(issue.severity);
          const severityStyle = severity ? SEVERITY_STYLES[severity] : null;

          return (
            <ReportListCard
              key={index}
              variant="issue"
              index={index}
              title={issue.title ?? ""}
              impactEntries={[]}
            >
              {severityStyle && (
                <div className={`${REPORT_CARD_CONTENT_GAP_CLASS} flex`}>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium leading-4 ${severityStyle.className}`}>
                    {severityStyle.label}
                  </span>
                </div>
              )}

              {issue.fix && (
                <div className={`${REPORT_CARD_CONTENT_GAP_CLASS} flex items-start gap-1.5`}>
                  <RiArrowRightLine
                    size={15}
                    className="mt-0.5 shrink-0 text-[rgba(6,28,47,0.35)]"
                    aria-hidden
                  />
                  <p className="text-[13px] leading-5 text-[rgba(6,28,47,0.55)]">
                    {issue.fix}
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
